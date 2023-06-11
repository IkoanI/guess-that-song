import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import { clientId } from "../App";

export default function Loading() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const [songData, setSongData] = useState(null)

    async function updateData() {
        const accessToken = await getAccessToken(clientId, code);
        localStorage.setItem("access-token", accessToken)
        const playlists = await fetchPlaylists(accessToken);
        var songs = new Set()
        for (let playlist of playlists) {
            var nextSongs = await fetchAllSongs(accessToken, playlist.tracks.href)
            nextSongs.forEach(item => songs.add(item))
        }
        setSongData(songs)

    }

    useEffect(() => {
        updateData()
    }, [])

    if (!songData) {
        return (
            <div>
                <p>Loading...</p>
            </div>
        )
    }
    else {
        return <Navigate to="/quiz" state={{ songs: songData }} />
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
                return {name: i.track.name, 
                        uri: i.track.uri, 
                        duration: i.track.duration_ms, 
                        image: i.track.album.images[1].url}
            }
        })
        songs = songs.concat(nextSongs)
        next = response.next

    }
    return songs
}