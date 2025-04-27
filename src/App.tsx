import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./pages/Home.tsx";
import Course from "./pages/Course.tsx";
import Login from "./pages/Login.tsx";
import DisciplineSelection from "./pages/DisciplineSelection.tsx";
import Enrollment from "./pages/Enrollment.tsx";

function App() {
  return (
    // TODO: usar variável de ambiente para o clientId
    <GoogleOAuthProvider clientId="672860559215-km24kctijodjb48k8tnsvhat1em68jj5.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pageLogin" element={<Login />} />
          <Route path="/pageCourse" element={<Course />} />
          <Route path="/disciplinas-cursadas" element={<DisciplineSelection />} />
          <Route path="/disciplinas-matricula" element={<Enrollment />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
