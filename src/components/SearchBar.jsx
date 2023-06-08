import AsyncSelect from 'react-select/async'


export default function SearchBar({handleSelect}) {

  return (
    <AsyncSelect onChange={handleSelect} styles={searchStyle} placeholder = "Search" loadOptions={getOptions}/>
  )
}

async function getOptions(inputValue){
    const token = localStorage.getItem("access-token");
    const result = await fetch(`https://api.spotify.com/v1/search?q=${inputValue}&type=track`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const data = await result.json();
    const songResults =  data.tracks.items.map( ({name}) => {
        return {label: name, value: name}
    })

    return songResults
}

const searchStyle = {
    menu: (baseStyles) => ({
      ...baseStyles,
      color:"black"
    }),
}