import { useNavigate, useLocation } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import { useCallback, useEffect, useState } from "react"
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk"
import PlayButtton from "../components/PlayButton"
import Popup from "../components/Popup"

export default function Quiz() {
  const [answered, setAnswered] = useState(0)
  const [score, setScore] = useState(0)
  const [currSong, setCurrSong] = useState(null)
  const [userAnswer, setUserAnswer] = useState(null)
  const [triggerPopup, setTriggerPopup] = useState(false)
  const [result, setResult] = useState(null)
  const { state } = useLocation()
  const { songs, playbackTime, quizLength } = state
  const songsArray = Array.from(songs)
  const token = localStorage.getItem("access-token")
  const navigate = useNavigate()

  const getOAuthToken = useCallback(callback => {
    callback(token)
  }, []);

  function getRandomSong() {
    const randomSong = Math.floor(Math.random() * songsArray.length)
    const randomStart = Math.floor(Math.random() * (songsArray[randomSong].duration - playbackTime))
    const randSong = { details: songsArray[randomSong], start: randomStart }
    setCurrSong(randSong)
  }

  function handleSelect(choice) {
    setUserAnswer(choice.value)

  }

  function handleSubmit() {
    let msg
    if (userAnswer === currSong.details.name) {
      msg = `Correct! Answer is: ${currSong.details.name}`
      setScore(score + 1)
    }
    else {
      msg = `Wrong, answer is: ${currSong.details.name}`
    }
    setResult(msg)
    setTriggerPopup(true)
  }

  function handleContinue() {
    setTriggerPopup(false)
    setAnswered(answered + 1)
  }

  useEffect(() => {
    getRandomSong()
  }, [answered])

  if (!currSong) {
    return <p>Loading...</p>
  }

  if (answered == quizLength) {
    
    return (
      <div className="result-screen">
        <h1>Score: {score}/{quizLength}</h1>
        <button onClick={() => navigate('/options')} className="back-button">Back</button>
      </div>
    )
  }

  return (
    <>
      <div className="quizWrapper">
        <div className="details">
          <h1>Question {answered + 1}/{quizLength}</h1>
          <h2>Score: {score}/{quizLength}</h2>
        </div>

        <div className="webPlayer">
          <WebPlaybackSDK
            deviceName="Guess That Song"
            getOAuthToken={getOAuthToken}
            volume={0.5}
          >
            <PlayButtton trackUri={currSong.details.uri} trackStart={currSong.start} playbackTime={playbackTime} />
          </WebPlaybackSDK>
        </div>

        <div className="searchBar">
          <div className="search">
            <SearchBar handleSelect={handleSelect} />
          </div>
          <button className="submitButton" id="submitButton" onClick={handleSubmit}>Submit</button>
        </div>

      </div>

      <Popup trigger={triggerPopup} continue={handleContinue}>
        <img src={`${currSong.details.image}`} />
        <h1 className="result-msg"> {result} </h1>
      </Popup>
    </>
  )
}

