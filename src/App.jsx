import { BrowserRouter, Routes, Route, HashRouter } from "react-router-dom"
import Login from "./pages/LoginPage"
import Loading from "./pages/Loading"
import Options from "./pages/Options";
import Quiz from "./pages/Quiz";
export const clientId = "ec1d519601d9404daf77057dec294452";
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path= '/' element={<Login />} />
        <Route path='/loading' element={<Loading />} />
        <Route path='/options' element={<Options />} />
        <Route path= '/quiz' element={<Quiz />} />
      </Routes>
    </BrowserRouter>
  )
}
