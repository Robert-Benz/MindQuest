import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner"; 
import ScrollToTop from "./components/ScrollToTop";

import { ThemeProvider } from "./utils/tema.jsx";

import Home  from "./pages/PaginasComuns/Home";
import Senha from "./pages/PaginasComuns/Senha";

// IMPORTS - USUÁRIO COMUM (PACIENTE)
import Cadastro               from "./pages/UsuarioComum/Cadastro";
import Login                  from "./pages/UsuarioComum/Login";
import Humor                  from "./pages/UsuarioComum/Humor";
import Calendario             from "./pages/UsuarioComum/Calendario"; 
import Perfil                 from "./pages/UsuarioComum/Perfil"; 
import ResetPassword         from './pages/UsuarioComum/ResetPassword'; 
import Conquistas             from "./pages/UsuarioComum/Conquistas";
import Loja                   from "./pages/UsuarioComum/Loja";
import GerenciarAtividades    from "./pages/UsuarioComum/GerenciarAtividades";
import SalaSessao             from "./pages/PaginasComuns/SalaSessao";
import Formulario             from "./pages/UsuarioComum/Formulario";
import AnaliseHumor           from "./pages/UsuarioComum/analiseHumor";
import Menu                   from "./pages/UsuarioComum/Menu";

// IMPORTS - PSICÓLOGO
import MenuPsicologo          from "./pages/Psicologo/menuPsicologo";
import LoginPsicologo         from "./pages/Psicologo/LoginPsicologo";
import HistoricoPaciente      from "./pages/Psicologo/HistoricoPaciente";
import PerfilPsicologo        from "./pages/Psicologo/PerfilPsicologo";

function App() {
  return (
    <ThemeProvider>
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
          <Route path="/conquistas" element={<Conquistas />} />
          <Route path="/loja" element={<Loja />} />
          <Route path="/atividades" element={<GerenciarAtividades />} />
          <Route path="/salaSessao" element={<SalaSessao />} />
          <Route path="/senha" element={<Senha />}/>
          <Route path="/formulario" element={<Formulario />}/>
          <Route path="/AnaliseHumor" element={<AnaliseHumor />} />
          
          {/* ROTAS DO PSICÓLOGO */}
          <Route path="/menuPsicologo" element={<MenuPsicologo />} />
          <Route path="/loginPsicologo" element={<LoginPsicologo />} />
          <Route path="/historicoPaciente" element={<HistoricoPaciente />} />
          <Route path="/perfilPsicologo" element={<PerfilPsicologo />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;