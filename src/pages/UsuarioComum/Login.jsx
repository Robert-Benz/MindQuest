import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

// Importações dos nossos novos arquivos de erro
import PopUpGenerico from "../../components/PopUpGenerico";
import { mapearErroFirebase } from "../../utils/firebaseErrors";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  // Novos estados para controlar o PopUp
  const [modalAberto, setModalAberto] = useState(false);
  const [mensagemErro, setMensagemErro] = useState("");

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, senha);
      console.log("Login realizado com sucesso!");
      navigate("/Menu");
    } catch (error) {
      console.error("Erro ao entrar:", error.code);
      
      // Captura o erro, traduz e abre o PopUp dinamicamente
      const mensagemTraduzida = mapearErroFirebase(error.code);
      setMensagemErro(mensagemTraduzida);
      setModalAberto(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5DACA] via-[#FFF4EF] to-[#ECC3A9] flex items-center justify-center p-6 relative">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full bg-[#F5DACA] flex items-center justify-center mx-auto mb-4 shadow-md">
            <LogIn className="text-[#FF9B7D] size-8" />
          </div>
          <h2 className="text-3xl font-bold text-[#7A4E3A]">
            Bem-vindo ✨
          </h2>
          <p className="text-[#9A6A58] mt-2">
            Sentimos sua falta no MindQuest
          </p>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-4 rounded-2xl bg-[#FFF7F4] border border-[#F5DACA] focus:outline-none focus:ring-2 focus:ring-[#FFC9BA] transition-all text-[#7A4E3A] placeholder:text-[#B88B79]"
          />

          <div className="space-y-1">
            <input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full p-4 rounded-2xl bg-[#FFF7F4] border border-[#F5DACA] focus:outline-none focus:ring-2 focus:ring-[#FFC9BA] transition-all text-[#7A4E3A] placeholder:text-[#B88B79]"
            />
            
            {/* Link de recuperação de senha */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => navigate("/recuperar-senha")}
                className="text-xs font-medium text-[#FF9B7D] hover:text-[#E97451] transition-colors"
              >
                Esqueci minha senha
              </button>
            </div>
          </div>

          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D] shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 mt-2"
          >
            Entrar no MindQuest
          </button>
        </div>

        <p className="text-center mt-6 text-sm text-[#9A6A58]">
          Não tem conta?{" "}
          <button
            onClick={() => navigate("/cadastro")}
            className="font-bold text-[#FF9B7D] hover:underline"
          >
            Cadastre-se
          </button>
        </p>
      </motion.div>

      {/* Renderização do nosso PopUp Genérico */}
      <PopUpGenerico 
        isOpen={modalAberto} 
        onClose={() => setModalAberto(false)} 
        mensagem={mensagemErro} 
      />
    </div>
  );
}