import { useLocation } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import { useCallback, useEffect, useState } from "react"
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk"
import PlayButtton from "../components/PlayButton"
import Popup from "../components/Popup"
import './Quiz.css'

export default function Quiz() {
  const [answered, setAnswered] = useState(0)
  const [currSong, setCurrSong] = useState(null)
  const [currStart, setCurrStart] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [triggerPopup, setTriggerPopup] = useState(false)
  const [resultMsg, setResultMsg] = useState(null)
  const { state } = useLocation()
  const { profile, songs } = state
  const songsArray = Array.from(songs)
  const token = localStorage.getItem("access-token")

  const getOAuthToken = useCallback(callback => {
    callback(token)
  }, []);

  function getRandomSong() {
    const randomSong = Math.floor(Math.random() * songsArray.length)
    const randomStart = Math.floor(Math.random() * (songsArray[randomSong].duration - 5000))
    setCurrStart(randomStart)
    setCurrSong(songsArray[randomSong])
  }

  function handleSelect(choice) {
    setUserAnswer(choice.value)

  }

  function handleSubmit() {
    let msg
    if (userAnswer === currSong.name) {
      msg = 'Correct!'
    }
    else {
      msg = `Wrong, answer is: ${currSong.name}`
    }
    setResultMsg(msg)
    setTriggerPopup(true)
    setAnswered(answered + 1)
  }

  useEffect(() => {
    getRandomSong()
  }, [answered])

  if (!currSong) {
    return <p>Loading...</p>
  }

  return (
    <>
      <div className="quizWrapper">
        <div className="details">
          <p>{profile.display_name}</p>
          <p>Questions answered: {answered}</p>
        </div>

        <div className="webPlayer">
          <WebPlaybackSDK
            deviceName="Guess That Song"
            getOAuthToken={getOAuthToken}
            volume={0.5}
          >
            <PlayButtton trackUri={currSong.uri} trackStart={currStart} />
          </WebPlaybackSDK>
        </div>

        <div className="searchBar">
          <SearchBar handleSelect={handleSelect} />
        </div>

        <div>
          <button className="submitButton" onClick={handleSubmit}>Submit</button>
        </div>

      </div>

      <Popup trigger={triggerPopup} setTrigger={setTriggerPopup}>
        <p> {resultMsg} </p>
      </Popup>
    </>
  )
}

