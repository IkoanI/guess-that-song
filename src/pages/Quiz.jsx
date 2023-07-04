import { useNavigate, useLocation } from "react-router-dom"
import SearchBar from "../components/SearchBar"
import { useCallback, useEffect, useState } from "react"
import { WebPlaybackSDK } from "react-spotify-web-playback-sdk"
import PlayButtton from "../components/PlayButton"
import Popup from "../components/Popup"
import { clientId } from "../App"
import { Bars } from "react-loader-spinner"

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
  const navigate = useNavigate()
  
  function getRandomSong() {
    var randomSong = Math.floor(Math.random() * songsArray.length)
    while(!songsArray[randomSong]){
      randomSong = Math.floor(Math.random() * songsArray.length)
    }
    const randomStart = Math.floor(Math.random() * (songsArray[randomSong].duration - playbackTime))
    const randSong = { details: songsArray[randomSong], start: randomStart }
    
    setCurrSong(randSong)
  }

  useEffect(() => {
    getRandomSong()
  }, [answered])

  const getOAuthToken = useCallback(callback => {
    callback(getNewToken());
  }, []);

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



  if (!currSong) {
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

async function getNewToken() {
  const params = new URLSearchParams()
  params.append("client_id", clientId)
  params.append("grant_type", "refresh_token")
  params.append("refresh_token", localStorage.getItem('refresh_token'))

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params
  });

  const result = await response.json()
  if(!result.error){
    localStorage.setItem('refresh_token', result.refresh_token)
    return result.access_token
  }
  
}