import { usePlayerDevice, useSpotifyPlayer } from "react-spotify-web-playback-sdk"
import "../pages/Quiz.css"

export default function PlayButton({ trackUri, trackStart }) {
  const player = useSpotifyPlayer()
  const device = usePlayerDevice()

  return (
    <div>
      <button 
      className="playButton" 
      id="startButton" 
      onClick={() => play(trackUri, device, player, trackStart)}
      >
        Play
      </button>
    </div>
  )
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function play(trackUri, device, player, trackStart) {
  player.activateElement()
  await fetch(
    `https://api.spotify.com/v1/me/player/play?device_id=${device.device_id}`,
    {
      method: "PUT",
      body: JSON.stringify({ uris: [trackUri], position_ms: trackStart}),
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access-token")}`,
      },
    },
  );
  const btn = document.getElementById('startButton')
  btn.disabled = true
  await sleep(5000)
  await player.pause()
  btn.disabled = false
}

