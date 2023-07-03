import { useEffect, useState } from "react";
import { Navigate } from 'react-router-dom';
import { clientId } from "../App";
import { Bars } from 'react-loader-spinner'
import './Loading.css'

export default function Loading() {
    const params = new URLSearchParams(window.location.search)
    const code = params.get("code")
    const [playlists, setPlaylists] = useState(null)

    async function updateData() {
        const tokens = await getAccessToken(clientId, code)
        localStorage.setItem("access-token", tokens.access_token)
        localStorage.setItem("refresh_token", tokens.refresh_token)
        const userPlaylists = await fetchPlaylists(tokens.access_token)
        setPlaylists(userPlaylists)
    }

    useEffect(() => {
        updateData()
    }, [])

    if (playlists) {
        localStorage.setItem("playlists", JSON.stringify(playlists))
        return <Navigate to="/options" />
    }

    else {
        return (
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
    return result

}

async function fetchPlaylists(token) {
    const result = await fetch("https://api.spotify.com/v1/me/playlists", {
        method: "GET", headers: { Authorization: `Bearer ${token}` }
    });

    const data = await result.json();
    return data.items
}