import AsyncSelect from 'react-select/async'


export default function SearchBar({ handleSelect }) {

  return (
    <AsyncSelect onChange={handleSelect} styles={searchStyle} placeholder="Search" loadOptions={getOptions} />
  )
}

async function getOptions(inputValue) {
  const token = localStorage.getItem("access-token");
  const result = await fetch(`https://api.spotify.com/v1/search?q=${inputValue}&type=track`, {
    method: "GET", headers: { Authorization: `Bearer ${token}` }
  });

  const data = await result.json();
  const songResults = data.tracks.items.map(({ artists, name }) => {
    return { label: `${name}, ${artists[0].name}`, value: name }
  })

  return songResults
}

const searchStyle = {
  menu: (baseStyles) => ({
    ...baseStyles,
    color: "black",
    borderRadius: '32px',
    textAlign: 'left'
  }),

  menuList: (baseStyles) => ({
    ...baseStyles,
    color: "black",
    borderRadius: '32px',
    textAlign: 'left',
    "::-webkit-scrollbar": {
      width: "0px",
      height: "0px",
    },

  }),

  dropdownIndicator: () => null,
  indicatorSeparator: () => null,

}