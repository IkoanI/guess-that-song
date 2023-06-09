import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom"
import Login from "./pages/login"
import Loading from "./pages/Loading"
import Quiz from "./pages/Quiz";
export const clientId = "ec1d519601d9404daf77057dec294452";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= 'guess-that-song/' element={<Login />} />
        <Route path='guess-that-song/loading' element={<Loading />} />
        <Route path= 'guess-that-song/quiz' element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  )
}
