import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; 


import Home from "./pages/PaginasComuns/Home";
import Menu from "./pages/PaginasComuns/Menu";


// IMPORTS - USUÁRIO COMUM (PACIENTE)
import Cadastro from "./pages/UsuarioComum/Cadastro";
import Login from "./pages/UsuarioComum/Login";
import Humor from "./pages/UsuarioComum/Humor";
import Calendario from "./pages/UsuarioComum/Calendario"; 
import Perfil from "./pages/UsuarioComum/Perfil"; 
import RecuperarSenha from './pages/UsuarioComum/ResetPassword'; 
import Meditacao from "./pages/UsuarioComum/Meditacao";
import Conquistas from "./pages/UsuarioComum/Conquistas";
import Loja from "./pages/UsuarioComum/Loja";
import GerenciarAtividades from "./pages/UsuarioComum/GerenciarAtividades";
import BuscarProfissionais from "./pages/UsuarioComum/BuscarProfissionais";
import SalaSessao from "./pages/PaginasComuns/SalaSessao";
import Diario from "./pages/UsuarioComum/Diario";
import SosRespiracao from "./pages/UsuarioComum/SosRespiracao";
import MinhaRede from "./pages/UsuarioComum/MinhaRede";

// IMPORTS - PSICÓLOGO
import PerfilPsicologo from "./pages/Psicologo/PerfilPsicologo";
import CadastroDeServico from "./pages/Psicologo/CadastroDeServico"; 
import AvaliacoesPsicologo from "./pages/Psicologo/AvaliacoesPsicologo"; 
import LoginPsicologo from "./pages/Psicologo/LoginPsicologo";
import HistoricoPaciente from "./pages/Psicologo/HistoricoPaciente";
import CalendarioPsicologo from "./pages/Psicologo/CalendarioPsicologo";


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
        <Route path="/BuscarProfissionais" element={<BuscarProfissionais />} />
        <Route path="/SalaSessao" element={<SalaSessao />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/sos" element={<SosRespiracao />} />
        <Route path="/minha-rede" element={<MinhaRede />} />
        
        
        {/* ROTAS DO PSICÓLOGO */}
        <Route path="/painel-psicologo" element={<PerfilPsicologo />} />
        <Route path="/CadastroDeServico" element={<CadastroDeServico />} />
        <Route path="/AvaliacoesPsicologo" element={<AvaliacoesPsicologo />} />
        <Route path="/login-psicologo" element={<LoginPsicologo />} />
        <Route path="/HistoricoPaciente" element={<HistoricoPaciente />} />
        <Route path="/calendario-psicologo" element={<CalendarioPsicologo />} />
        
      </Routes>
    </Router>
  );
}

export default App;