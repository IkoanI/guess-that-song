import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import { clientId } from "../App";
import Select from 'react-select';
import './Loading.css'

export default function Loading() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const [playlists, setPlaylists] = useState(null)
    const [excluded, setExcluded] = useState(new Set())
    const [playbackTime, setPlaybackTime] = useState(5000)
    const [quizLength, setQuizLength] = useState(20)
    const [songData, setSongData] = useState(null)
    const [submitted, setSubmitted] = useState(false)

    async function updateData() {
        if (!playlists) {
            const accessToken = await getAccessToken(clientId, code)
            localStorage.setItem("access-token", accessToken)
            const userPlaylists = await fetchPlaylists(accessToken)
            setPlaylists(userPlaylists)
        }

        else {
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
    }

    useEffect(() => {
        updateData()
    }, [])

    if (songData) {
        return <Navigate to="/quiz" state={{ songs: songData, playbackTime: playbackTime, quizLength: quizLength }} />
    }

    if (!submitted && playlists) {
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

    else {
        return (
            <div>
                <p>Loading...</p>
            </div>
        )
    }
}

async function getAccessToken(clientId, code) {
    const verifier = localStorage.getItem("verifier");
    const params = new URLSearchParams();
    params.append("client_id", clientId);
    params.append("grant_type", "authorization_code");
    params.append("code", code);
    params.append("redirect_uri", `${window.location.origin}/loading`);
    params.append("code_verifier", verifier);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: params
    });

    const result = await response.json()
    return result.access_token;

}

async function fetchPlaylists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const data = await result.json();
    return data.items
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