import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Mail, Sparkles, MailCheck } from "lucide-react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { toast } from "sonner";

export default function ModalVerificacaoEmail({
  isOpen,
  email,
  titulo = "Confirmar E-mail",
  redirectPath = "/login",
  onVerificado,
  onFechar,
}) {
  const [loading, setLoading] = useState(false);
  const [reenviando, setReenviando] = useState(false);
  const [erro, setErro] = useState("");

  const handleJaConfirmei = async () => {
    const user = auth.currentUser;
    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    setLoading(true);
    setErro("");

    try {
      // Busca o estado atualizado do usuário no servidor
      await user.reload();

      if (auth.currentUser.emailVerified) {
        // Atualiza o token para que email_verified também valha nas regras do Firestore
        await auth.currentUser.getIdToken(true);
        await onVerificado(auth.currentUser);
      } else {
        setErro("Ainda não identificamos a confirmação. Clique no link do e-mail e tente de novo.");
      }
    } catch (e) {
      console.error(e);
      setErro("Não foi possível verificar agora. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviar = async () => {
    const user = auth.currentUser;
    if (!user) {
      setErro("Sessão expirada. Faça login novamente.");
      return;
    }

    setReenviando(true);
    try {
      await sendEmailVerification(user, { url: `${window.location.origin}${redirectPath}` });
      toast.success("Link de verificação reenviado!");
    } catch (e) {
      console.error(e);
      toast.error(
        e.code === "auth/too-many-requests"
          ? "Muitas tentativas. Aguarde alguns minutos antes de reenviar."
          : "Erro ao reenviar o e-mail."
      );
    } finally {
      setReenviando(false);
    }
  };

  const handleFechar = () => {
    setErro("");
    onFechar?.();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full text-center shadow-2xl border border-orange-100 relative"
          >
            <button
              type="button"
              onClick={handleFechar}
              className="absolute top-5 left-5 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <Mail className="text-[#E97451] size-7" />
            </div>

            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-1">{titulo}</h2>

            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Enviamos um link de confirmação para <br />
              <strong className="text-slate-700">{email}</strong>.<br />
              Abra o e-mail (verifique também o spam), clique no link e depois volte aqui.
            </p>

            {erro && <p className="text-rose-500 text-xs mb-4 font-semibold">{erro}</p>}

            <button
              type="button"
              onClick={handleJaConfirmei}
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-xs text-white bg-[#E97451] hover:bg-[#C06043] shadow-md shadow-orange-500/20 transition-all active:scale-95 disabled:opacity-60 disabled:active:scale-100 cursor-pointer flex items-center justify-center gap-2"
            >
              {loading ? (
                <Sparkles className="size-4 animate-spin" />
              ) : (
                <>
                  <MailCheck size={16} /> Já confirmei
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleReenviar}
              disabled={reenviando}
              className="mt-4 text-xs font-semibold text-[#E97451] hover:underline block mx-auto cursor-pointer disabled:opacity-50"
            >
              {reenviando ? "Reenviando..." : "Reenviar e-mail"}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
