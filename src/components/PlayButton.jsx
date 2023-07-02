import { usePlayerDevice, useSpotifyPlayer } from "react-spotify-web-playback-sdk"
import "../pages/Quiz.css"
import ProgressBar from "@ramonak/react-progress-bar"
import Slider from '@mui/material/Slider';
import VolumeDown from '@mui/icons-material/VolumeDown';
import VolumeUp from '@mui/icons-material/VolumeUp';
import { useState } from "react"

export default function PlayButton({ trackUri, trackStart, playbackTime }) {
  const player = useSpotifyPlayer()
  const device = usePlayerDevice()
  const [currTime, setCurrTime] = useState(0)

  function countdown() {
    const id = setInterval(() => {
      setCurrTime((prevTime) => {
        if (prevTime > playbackTime) {
          clearInterval(id)
          return 0
        }

        else {
          return prevTime + 10
        }

      })
    }, 10)
  }

  function handleVolumeChange(event, newValue){
    player.setVolume(newValue/100)
  }

  return (
    <div className="player-wrapper">
      <ProgressBar
        completed={currTime}
        maxCompleted={playbackTime}
        bgColor="#1DB954"
        labelColor="#ffffff"
        customLabel={`${Math.floor(currTime / 1000)}`}
        transitionTimingFunction="linear"
        transitionDuration="0"
      />

      <div className="play-and-volume">
        <button
          className="playButton"
          id="startButton"
          onClick={() => {
            play(trackUri, device, player, trackStart, playbackTime)
            if (player) {
              countdown()
            }
          }}
        >
          Play
        </button>

        <div className="volume-control">
          <VolumeDown />
          <Slider
            defaultValue={50}
            aria-label="Volume"
            sx={{
              width: '100px',
              color: '#1DB954',
              marginLeft: '10px',
              marginRight: '19px',
              padding: '11px'
            }}
            onChange={handleVolumeChange}
          />
          <VolumeUp />
        </div>
      </div>
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
      body: JSON.stringify({ uris: [trackUri], position_ms: trackStart }),
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



