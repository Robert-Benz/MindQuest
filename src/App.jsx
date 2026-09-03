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
import Meditacao from "./pages/Meditacao";
import Conquistas from "./pages/Conquistas";
import Loja from "./pages/Loja";
import GerenciarAtividades from "./pages/GerenciarAtividades";

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
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/RecuperarSenha" element={<RecuperarSenha />} />
        <Route path="/meditacao" element={<Meditacao />} />
        <Route path="/conquistas" element={<Conquistas />} />
        <Route path="/loja" element={<Loja />} />
        <Route path="/atividades" element={<GerenciarAtividades />} />
      </Routes>
    </Router>
  );
}

export default App;