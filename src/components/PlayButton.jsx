import { usePlayerDevice, useSpotifyPlayer } from "react-spotify-web-playback-sdk"
import "../pages/Quiz.css"

export default function PlayButton({ trackUri, trackStart, playbackTime }) {
  const player = useSpotifyPlayer()
  const device = usePlayerDevice()

  return (
    <div>
      <button 
      className="playButton" 
      id="startButton" 
      onClick={() => play(trackUri, device, player, trackStart, playbackTime)}
      >
        Play
      </button>
    </div>
  )
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function play(trackUri, device, player, trackStart, playbackTime) {
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
  const submitBtn = document.getElementById('submitButton')
  btn.disabled = true
  submitBtn.disabled = true
  await sleep(playbackTime)
  await player.pause()
  btn.disabled = false
  submitBtn.disabled = false
}

