import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; 
import ScrollToTop from "./components/ScrollToTop";

import Home  from "./pages/PaginasComuns/Home";
import Senha from "./pages/PaginasComuns/Senha";


// IMPORTS - USUÁRIO COMUM (PACIENTE)
import Cadastro               from "./pages/UsuarioComum/Cadastro";
import Login                  from "./pages/UsuarioComum/Login";
import Humor                  from "./pages/UsuarioComum/Humor";
import Calendario             from "./pages/UsuarioComum/Calendario"; 
import Perfil                 from "./pages/UsuarioComum/Perfil"; 
import ResetPassword         from './pages/UsuarioComum/ResetPassword'; 
import Meditacao              from "./pages/UsuarioComum/Meditacao";
import Conquistas             from "./pages/UsuarioComum/Conquistas";
import Loja                   from "./pages/UsuarioComum/Loja";
import GerenciarAtividades    from "./pages/UsuarioComum/GerenciarAtividades";
import BuscarProfissionais    from "./pages/UsuarioComum/BuscarProfissionais";
import SalaSessao             from "./pages/PaginasComuns/SalaSessao";
import Diario                 from "./pages/UsuarioComum/Diario";
import SosRespiracao          from "./pages/UsuarioComum/SosRespiracao";
import MinhaRede              from "./pages/UsuarioComum/MinhaRede";
import Formulario             from "./pages/UsuarioComum/Formulario";
import AnaliseHumor           from "./pages/UsuarioComum/analiseHumor";
import Menu                   from "./pages/UsuarioComum/Menu";

// IMPORTS - PSICÓLOGO
import MenuPsicologo          from "./pages/Psicologo/menuPsicologo";
import CadastroDeServico      from "./pages/Psicologo/CadastroDeServico"; 
import AvaliacoesPsicologo    from "./pages/Psicologo/AvaliacoesPsicologo"; 
import LoginPsicologo         from "./pages/Psicologo/LoginPsicologo";
import HistoricoPaciente      from "./pages/Psicologo/HistoricoPaciente";
import CalendarioPsicologo    from "./pages/Psicologo/CalendarioPsicologo";
import PerfilPsicologo        from "./pages/Psicologo/PerfilPsicologo";



function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-center" richColors theme="light" /> 
      
      <Routes>
        {/* ROTAS DO PACIENTE */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/login" element={<Login />} />
        <Route path="/humor" element={<Humor />} />
        <Route path="/calendario" element={<Calendario />} />
        <Route path="/menu" element={<Menu />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/ResetPassword" element={<ResetPassword />} />
        <Route path="/meditacao" element={<Meditacao />} />
        <Route path="/conquistas" element={<Conquistas />} />
        <Route path="/loja" element={<Loja />} />
        <Route path="/atividades" element={<GerenciarAtividades />} />
        <Route path="/buscarProfissionais" element={<BuscarProfissionais />} />
        <Route path="/salaSessao" element={<SalaSessao />} />
        <Route path="/diario" element={<Diario />} />
        <Route path="/sos" element={<SosRespiracao />} />
        <Route path="/minha-rede" element={<MinhaRede />} />
        <Route path="/senha" element={<Senha />}/>
        <Route path="/formulario" element={<Formulario />}/>
        <Route path="/AnaliseHumor" element={<AnaliseHumor />} />
        
        
        {/* ROTAS DO PSICÓLOGO */}
        <Route path="/menuPsicologo" element={<MenuPsicologo />} />
        <Route path="/cadastroDeServico" element={<CadastroDeServico />} />
        <Route path="/avaliacoesPsicologo" element={<AvaliacoesPsicologo />} />
        <Route path="/loginPsicologo" element={<LoginPsicologo />} />
        <Route path="/historicoPaciente" element={<HistoricoPaciente />} />
        <Route path="/calendario-psicologo" element={<CalendarioPsicologo />} />
        <Route path="/perfilPsicologo" element={<PerfilPsicologo />} />
        
      </Routes>
    </Router>
  );
}

export default App;