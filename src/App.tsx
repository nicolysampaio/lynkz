import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Course from "./pages/Course.tsx";
import Login from "./pages/Login.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import DisciplineSelection from "./pages/DisciplineSelection.tsx";

function App() {
  return (
    //TODO: adicionar variáveis de ambiente e atualizar o client id
    <GoogleOAuthProvider clientId="672860559215-km24kctijodjb48k8tnsvhat1em68jj5.apps.googleusercontent.com">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cursos" element={<Course />} />
          <Route path="/disciplinas-cursadas" element={<DisciplineSelection />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
