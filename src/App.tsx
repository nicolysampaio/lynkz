import {BrowserRouter, Route, Routes} from "react-router-dom";
import Home from "./pages/Home.tsx";
import Course from "./pages/Course.tsx";
import Login from "./pages/Login.tsx";

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/cursos" element={<Course />} />
            </Routes>
        </BrowserRouter>
    )
}

export default App
