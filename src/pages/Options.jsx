import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import Select from 'react-select';
import { Bars } from "react-loader-spinner";
import './Loading.css'

export default function Options() {
    const [excluded, setExcluded] = useState(new Set())
    const [playbackTime, setPlaybackTime] = useState(5000)
    const [quizLength, setQuizLength] = useState(20)
    const [songData, setSongData] = useState(null)
    const [submitted, setSubmitted] = useState(false)
    const playlists = JSON.parse(localStorage.getItem("playlists"))

    async function updateData() {
        const accessToken = localStorage.getItem("access-token")
        var songs = new Set()
        for (let playlist of playlists) {
            if (!excluded.has(playlist.id)) {
                var nextSongs = await fetchAllSongs(accessToken, playlist.tracks.href)
                nextSongs.forEach(item => songs.add(item))
            }
        }
        setSongData(songs)
    }

    useEffect(() => {
        if(submitted){
            updateData()
        }
    }, [submitted])

    if (submitted && songData) {
        return <Navigate to="/quiz" state={{ songs: songData, playbackTime: playbackTime, quizLength: quizLength }} />
    }

    else if (submitted){
        return(
            <div className="loading-spinner">
               <Bars
                    height="80"
                    width="80"
                    color="#1DB954"
                    ariaLabel="bars-loading"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    /> 
            </div>
            
        )
    }

    else {
        const style = {
            control: (baseStyles) => ({
                ...baseStyles,
                width: '300px'
            }),

            menu: (baseStyles) => ({
                ...baseStyles,
                color: "black",
                borderRadius: '16px',

            }),

            menuList: (baseStyles) => ({
                ...baseStyles,
                borderRadius: '16px',
                "::-webkit-scrollbar": {
                    width: "0px",
                    height: "0px",
                },

            }),

        }

        return (
            <>
                <div className="options">
                    <div className="row-option">
                        <h3 className="desc">Exclude Playlists: </h3>
                        <Select
                            isMulti
                            onChange={(chosenPlaylists) => {
                                var newExcluded = new Set()
                                for (let playlist of chosenPlaylists) {
                                    newExcluded.add(playlist.value.id)
                                }
                                setExcluded(newExcluded)
                            }}
                            styles={style}
                            options={playlists.map((playlist) => {
                                return { label: playlist.name, value: playlist }
                            }
                            )}
                            className="select"
                        />
                    </div>

                    <div className="row-option">
                        <h3 className="desc">Playback Time: </h3>
                        <Select
                            defaultValue={{ label: '5 seconds', value: 5000 }}
                            onChange={(chosenTime) => {
                                setPlaybackTime(chosenTime.value)
                            }}
                            styles={style}
                            options={[{ label: '2 seconds', value: 2000 },
                            { label: '5 seconds', value: 5000 },
                            { label: '10 seconds', value: 10000 }]}

                            className="select"
                        />
                    </div>

                    <div className="row-option">
                        <h3 className="desc">Number of Songs: </h3>
                        <Select
                            defaultValue={{ label: '20', value: 20 }}
                            onChange={(chosenNumber) => {
                                setQuizLength(chosenNumber.value)
                            }}
                            styles={style}
                            options={[{ label: '10', value: 10 },
                            { label: '20', value: 20 },
                            { label: '30', value: 30 },
                            { label: '40', value: 40 },
                            { label: '50', value: 50 }]}

                            className="select"
                        />
                    </div>
                </div>

                <button onClick={() => {
                    setSubmitted(true)
                    updateData()
                }} className="continueBtn">
                    Continue
                </button>
            </>

        )
    }
}

async function fetchSongs(token, playlistURL) {
    const result = await fetch(
        `${playlistURL}`, {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    })

    const data = await result.json();
    return data
}

async function fetchAllSongs(token, playlistURL) {
    var next = playlistURL
    var songs = []
    while (next) {
        var response = await fetchSongs(token, next)
        var nextSongs = response.items.map((i) => {
            if (i.track && !i.track.is_local) {
                return {
                    name: i.track.name,
                    uri: i.track.uri,
                    duration: i.track.duration_ms,
                    image: i.track.album.images[1].url
                }
            }
        })
        songs = songs.concat(nextSongs)
        next = response.next

    }
    return songs
}