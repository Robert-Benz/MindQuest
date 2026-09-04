import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import { auth } from "../../firebaseConfig";
import { sendPasswordResetEmail } from "firebase/auth";

export default function RecuperarSenha() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [mensagem, setMensagem] = useState({ tipo: "", texto: "" });
  const [loading, setLoading] = useState(false);

  const handleRecuperarSenha = async (e) => {
    e.preventDefault(); // Evita o recarregamento da página
    setMensagem({ tipo: "", texto: "" });

    if (!email) {
      setMensagem({ tipo: "erro", texto: "Por favor, digite seu email." });
      return;
    }

    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
      setMensagem({ 
        tipo: "sucesso", 
        texto: "Link de recuperação enviado! Verifique sua caixa de entrada (e o spam)." 
      });
      setEmail(""); // Limpa o campo após o sucesso
    } catch (error) {
      console.error("Erro ao enviar email de recuperação:", error.code);
      // Tratamento de erros comuns do Firebase
      if (error.code === "auth/user-not-found" || error.code === "auth/invalid-email") {
        setMensagem({ tipo: "erro", texto: "Email não encontrado ou inválido." });
      } else {
        setMensagem({ tipo: "erro", texto: "Ocorreu um erro. Tente novamente mais tarde." });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5DACA] via-[#FFF4EF] to-[#ECC3A9] flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl border border-white relative"
      >
        {/* Botão Voltar */}
        <button 
          onClick={() => navigate("/login")}
          className="absolute top-6 left-6 text-[#9A6A58] hover:text-[#7A4E3A] transition-colors flex items-center gap-2 text-sm font-medium"
        >
          <ArrowLeft className="size-4" /> Voltar
        </button>

        <div className="text-center mb-8 mt-6">
          <div className="w-16 h-16 rounded-full bg-[#FFF7F4] border border-[#F5DACA] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <KeyRound className="text-[#FF9B7D] size-8" />
          </div>
          <h2 className="text-2xl font-bold text-[#7A4E3A]">
            Esqueceu a senha?
          </h2>
          <p className="text-[#9A6A58] mt-2 text-sm">
            Digite seu email abaixo e enviaremos um link para você redefinir sua senha.
          </p>
        </div>

        <form onSubmit={handleRecuperarSenha} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-4 top-4 size-5 text-[#B88B79]" />
            <input
              type="email"
              placeholder="Seu email de acesso"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full pl-12 pr-4 py-4 rounded-2xl bg-[#FFF7F4] border border-[#F5DACA] 
                focus:outline-none focus:ring-2 focus:ring-[#FFC9BA] transition-all 
                text-[#7A4E3A] placeholder:text-[#B88B79]
              "
            />
          </div>

          {/* Feedback Visual de Sucesso ou Erro */}
          {mensagem.texto && (
            <motion.div 
              initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-xl flex items-start gap-2 text-sm font-medium ${
                mensagem.tipo === "sucesso" 
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-200" 
                  : "bg-red-50 text-red-500 border border-red-200"
              }`}
            >
              {mensagem.tipo === "sucesso" ? (
                <CheckCircle2 className="size-5 shrink-0" />
              ) : (
                <AlertCircle className="size-5 shrink-0" />
              )}
              <p>{mensagem.texto}</p>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="
              w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r 
              from-[#FFB5A0] to-[#FF9B7D] shadow-lg hover:scale-[1.02] 
              hover:shadow-xl transition-all active:scale-95 disabled:opacity-70 disabled:hover:scale-100
            "
          >
            {loading ? "Enviando..." : "Enviar link de recuperação"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}