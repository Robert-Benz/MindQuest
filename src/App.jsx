import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; 
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
import PerfilPsicologo from "./pages/PerfilPsicologo";
import CadastroDeServico from "./pages/CadastroDeServico"; 
import AvaliacoesPsicologo from "./pages/AvaliacoesPsicologo"; 
import LoginPsicologo from "./pages/LoginPsicologo";
import HistoricoPaciente from "./pages/HistoricoPaciente";


function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors theme="light" /> 
      
      <Routes>
           {/* ROTAS DO PACIENTE */}
        <Route path="/home" element={<Home />} />
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
        
        {/* ROTAS DO PSICÓLOGO */}
        <Route path="/painel-psicologo" element={<PerfilPsicologo />} />
        <Route path="/CadastroDeServico" element={<CadastroDeServico />} />
        <Route path="/AvaliacoesPsicologo" element={<AvaliacoesPsicologo />} />
        <Route path="/login-psicologo" element={<LoginPsicologo />} />
        <Route path="/HistoricoPaciente" element={<HistoricoPaciente />} />

      </Routes>
    </Router>
  );
}

export default App;