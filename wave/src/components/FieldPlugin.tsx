import { useState, useEffect, FunctionComponent } from 'react'
import { useFieldPlugin } from '@storyblok/field-plugin/react'
import AsyncSelect, { StylesConfig } from 'react-select';
import CSS from 'csstype';

interface IResponseOption {
    id: string;
    name: string;
}

interface IOption extends IResponseOption {
  label: string;
  value: string;
}


async function getCategories() {
  try {
    const serverResponse = await fetch("https://wave.uea.ac.uk/graphql", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // omitted 'ancestry' field as it's not used
      body: JSON.stringify({ query: '{ categoriesWithAncestry { name, id } }' }),
    })
    const response = await serverResponse.json();
    return response.data.categoriesWithAncestry.map((data: IResponseOption) => ({
        id: data.id,
        label: data.name,
        value: data.name,
    }));
  } catch(e) {
    return []
  }
}

const WAVECategories: FunctionComponent = () => {

    const {data, actions} = useFieldPlugin();
    const [selected, setSelected ] = useState<undefined | IOption[]>();
    const [waveCategories, setWaveCategoriesState] = useState<IOption[]>();

    useEffect(() => {
        getCategories().then(options => setWaveCategoriesState(options))
    }, []);

    useEffect(()=>{
        getSelected();
    },[data, waveCategories])

    const getSelected = () => {
        if (data?.content instanceof Array) {
            setSelected(data?.content?.map(content => ({name: content.value, value: content.value, label: content.value, id: content.id})))
        }
    }

    const setCategories = ((options: IOption[]) => {
        actions?.setContent(options.map(option => ({id: option.id, value: option.value})))
    })

    const colourStyles: StylesConfig = {
        control: (styles) => ({ ...styles, fontSize: '12px' }),
        placeholder: (styles) => ({ ...styles, fontSize: '12px' }),
        group: (styles) => ({
            ...styles,
            'fontSize': '9px',
            'paddingTop': '1px',
            'paddingBottom': '1px',
            'marginTop': '1px',
            'marginBottom': '1px',
        }),
        groupHeading: (styles) => ({
            ...styles,
            'fontSize': '9px',
            'borderTop': '1px solid #ccc',
            'marginTop': '1px',
            'paddingTop': '3px',
        }),
        option: (styles, { data, isDisabled, isFocused, isSelected }) => {
            return {
                ...styles,
                'fontSize': '14px',
            };
        },
    };

    const appCSS: CSS.Properties = {
        'minHeight': '450px',
        'height': '100%',
    };

    return (
        <div className="App" style={appCSS}>
            <AsyncSelect
                value={selected}
                isMulti
                isSearchable={true}
                isDisabled={waveCategories == undefined}
                isLoading={waveCategories == undefined}
                onChange={(event) => setCategories((event as IOption[]))}
                options={waveCategories}
                styles={colourStyles}
            />
            <p style={{textAlign:'center',fontSize:'12px', paddingTop:'5px'}}>All of the above categories are managed in <a href='https://wave.uea.ac.uk' rel="noreferrer" target='_blank' title='WA&VE'>WA&VE</a>.<br/>Please contact the <a href='mailto:digital@uea.ac.uk'>Digital Inbox</a> for any queries.</p>
        </div>
    );
}

export default WAVECategories
