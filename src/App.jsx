import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; // IMPORTANTE AQUI
import Home from "./pages/Home";
import Cadastro from "./pages/Cadastro";
import Login from "./pages/Login";
import Humor from "./pages/Humor";
import Calendario from "./pages/Calendario"; 
import Menu from "./pages/Menu";
import Perfil from "./pages/Perfil"; 
import RecuperarSenha from './pages/ResetPassword'; 
import Senha from "./pages/Senha"
import CadastroPsicologo from "./pages/Cadastro-Psicologo";
import MenuPsicologo from "./pages/Menu-Psicologo";
import Formulario from "./pages/Formulario"

function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors theme="light" /> 
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/humor" element={<Humor />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/senha" element={<Senha />}/>
        <Route path="/cadastropsicologo" element={<CadastroPsicologo />}/>
        <Route path="/menupsicologo" element={<MenuPsicologo />}/>
        <Route path="/formulario" element={<Formulario />}/>
        

        <Route path="/perfil" element={<Perfil />} />
        <Route path="/RecuperarSenha" element={<RecuperarSenha />} />
      </Routes>
    </Router>
  );
}

export default App;