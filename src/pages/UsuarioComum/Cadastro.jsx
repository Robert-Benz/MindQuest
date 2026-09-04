import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, Lock, User, 
  Sparkles, ChevronRight, Heart, 
  Music, Film, Clock3, CheckSquare, 
  Square, ShieldCheck, Check, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";

// Componente CustomSelect com Múltipla Escolha
function CustomSelect({ value, onChange, placeholder, options, icon: Icon, isMulti = false }) {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (optionValue) => {
    if (isMulti) {
      if (value.includes(optionValue)) {
        onChange(value.filter((v) => v !== optionValue));
      } else {
        onChange([...value, optionValue]);
      }
    } else {
      onChange(optionValue);
      setIsOpen(false);
    }
  };

  const getDisplayLabel = () => {
    if (isMulti) {
      if (!value || value.length === 0) return placeholder;
      if (value.length === 1) return options.find((o) => o.value === value[0])?.label;
      return `${value.length} opções selecionadas`;
    } else {
      const selectedOption = options.find((o) => o.value === value);
      return selectedOption ? selectedOption.label : placeholder;
    }
  };

  const temSelecao = isMulti ? value.length > 0 : !!value;

  return (
    <div className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-full flex items-center justify-between pl-11 pr-4 py-3.5 rounded-2xl border bg-slate-50 hover:bg-white transition-all duration-200 outline-none ${
          isOpen ? "border-peach-300 bg-white shadow-md ring-4 ring-peach-400/10" : "border-slate-100"
        }`}
      >
        {Icon && (
          <Icon className={`absolute left-4 top-1/2 -translate-y-1/2 size-4 ${temSelecao ? "text-peach-500" : "text-slate-400"}`} />
        )}
        <span className={`text-sm text-left truncate pr-2 ${temSelecao ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
          {getDisplayLabel()}
        </span>
        <ChevronRight className={`size-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full bg-white border border-slate-100 rounded-2xl shadow-xl shadow-slate-900/10 overflow-hidden p-1.5 max-h-56 overflow-y-auto custom-scrollbar"
          >
            {options.map((option) => {
              const isSelected = isMulti ? value.includes(option.value) : value === option.value;
              
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-sm transition-all ${
                    isSelected ? "bg-peach-50 text-peach-600 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && isMulti && <Check size={14} className="text-peach-500" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  
  // Todos os campos de personalização agora suportam múltiplas escolhas (Arrays)
  const [objetivoPrincipal, setObjetivoPrincipal] = useState([]);
  const [generoMusical, setGeneroMusical] = useState([]);
  const [generoFilme, setGeneroFilme] = useState([]);
  const [momentoFavorito, setMomentoFavorito] = useState([]);

  const [termosAceitos, setTermosAceitos] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCadastro = async (e) => {
    e.preventDefault();
    
    if (!nome || !email || !senha) {
      toast.error("Por favor, preencha todos os dados básicos.");
      return;
    }

    if (objetivoPrincipal.length === 0 || generoMusical.length === 0 || generoFilme.length === 0 || momentoFavorito.length === 0) {
      toast.error("Por favor, selecione pelo menos uma opção em cada pergunta do questionário.");
      return;
    }

    if (!termosAceitos) {
      toast.error("Você precisa concordar com os Termos e Políticas de Privacidade (LGPD) para prosseguir.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, senha);
      const user = userCredential.user;

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email,
        xp: 0,
        nivel: 1,
        criadoEm: new Date().toISOString(),
        tipo: "paciente",
        objetivos: objetivoPrincipal,
        generosMusicais: generoMusical,
        generosFilmes: generoFilme,
        momentosFavoritos: momentoFavorito
      });

      toast.success("Conta criada com sucesso! Bem-vindo ao MindQuest.");
      navigate("/menu"); 
      
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está em uso.");
      } else if (error.code === "auth/weak-password") {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col justify-center items-center p-4 md:p-8 antialiased font-sans text-slate-800 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-peach-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-2xl space-y-6 relative z-10 my-8">
        
        <button 
          onClick={() => navigate("/login")} 
          className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-peach-500 transition-colors"
        >
          <ArrowLeft size={16} /> Voltar para o Login
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl border border-peach-50 p-6 md:p-10"
        >
          <div className="text-center mb-8">
            <div className="bg-peach-50 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-peach-100 shadow-sm">
              <img src={logoReduzido} alt="MindQuest Logo" className="w-10 h-10 object-contain" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Criar Conta</h1>
            <p className="text-sm text-slate-500 mt-2">Personalize sua jornada de autoconhecimento.</p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-6">
            
            {/* Sessão 1 */}
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold text-peach-500 uppercase tracking-widest border-b border-slate-100 pb-2">1. Seus Dados Básicos</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Seu nome completo" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                    required
                  />
                </div>

                <div className="relative md:col-span-2">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="password" 
                    placeholder="Crie uma senha (mínimo 6 caracteres)" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200 transition-all text-slate-700"
                    required
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Sessão 2 */}
            <div className="space-y-4 pt-2">
              <div className="border-b border-slate-100 pb-3">
                <h2 className="text-[10px] font-bold text-peach-500 uppercase tracking-widest">2. Personalize sua Experiência</h2>
                <div className="flex items-center gap-1.5 mt-2 bg-peach-50 text-peach-700 px-3 py-1.5 rounded-lg w-fit">
                  <Info size={14} className="text-peach-500" />
                  <span className="text-xs font-bold">Você pode selecionar mais de uma opção em cada categoria!</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="z-40">
                  <CustomSelect 
                    isMulti
                    value={objetivoPrincipal} 
                    onChange={setObjetivoPrincipal} 
                    placeholder="Quais são seus focos?" 
                    icon={Heart} 
                    options={[
                      { value: "ansiedade", label: "Reduzir Ansiedade" }, { value: "estresse", label: "Lidar com Estresse" },
                      { value: "sono", label: "Dormir Melhor" }, { value: "autoestima", label: "Trabalhar Autoestima" },
                      { value: "autoconhecimento", label: "Autoconhecimento" }, { value: "habitos", label: "Criar Hábitos Saudáveis" },
                    ]} 
                  />
                </div>

                <div className="z-30">
                  <CustomSelect 
                    isMulti
                    value={generoMusical} 
                    onChange={setGeneroMusical} 
                    placeholder="Quais suas vibes musicais?" 
                    icon={Music} 
                    options={[
                      { value: "lofi", label: "Lofi / Relaxante" }, { value: "instrumental", label: "Instrumental" },
                      { value: "classica", label: "Clássica" }, { value: "pop", label: "Pop / Vibrante" },
                      { value: "natureza", label: "Sons da Natureza" },
                    ]} 
                  />
                </div>

                <div className="z-20">
                  <CustomSelect 
                    isMulti
                    value={generoFilme} 
                    onChange={setGeneroFilme} 
                    placeholder="Tipos de filme favoritos?" 
                    icon={Film} 
                    options={[
                      { value: "comfort", label: "Comfort Movie" }, { value: "comedia", label: "Comédia / Leve" },
                      { value: "romance", label: "Romance" }, { value: "animacao", label: "Animação / Fantasia" },
                      { value: "documentario", label: "Documentários" }, { value: "ficcao", label: "Ficção Científica" }
                    ]} 
                  />
                </div>

                <div className="z-10">
                  <CustomSelect 
                    isMulti
                    value={momentoFavorito} 
                    onChange={setMomentoFavorito} 
                    placeholder="Melhor horário de foco?" 
                    icon={Clock3} 
                    options={[
                      { value: "manha", label: "☀️ Manhã" }, { value: "tarde", label: "🌤️ Tarde" }, { value: "noite", label: "🌙 Noite" },
                    ]} 
                  />
                </div>
              </div>
            </div>

            {/* Sessão 3 */}
            <div className="pt-4 pb-2">
              <div className="flex flex-col gap-3 w-full p-5 rounded-3xl bg-slate-50 border border-slate-200 shadow-inner">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={18} className="text-emerald-500" />
                  <span className="text-sm font-black text-slate-800">Termos de Consentimento e Privacidade (LGPD)</span>
                </div>
                
                <div className="h-32 overflow-y-auto custom-scrollbar text-[11px] text-slate-500/90 font-medium leading-relaxed pr-3 space-y-3 text-justify">
                  <p>
                    Declaro ter lido e aceito os Termos de Uso e a Política de Privacidade do aplicativo MindQuest. Expresso meu consentimento livre, informado e inequívoco (Art. 7º, inc. I, e Art. 8º da Lei nº 13.709/2018 - Lei Geral de Proteção de Dados) para a coleta e o tratamento de meus dados pessoais e sensíveis.
                  </p>
                  <p>
                    Compreendo que os dados sensíveis incluem, mas não se limitam a: registros contínuos de humor, relatos emocionais (diários), evolução pessoal e preferências comportamentais (filmes, músicas, metas e horários).
                  </p>
                  <p>
                    <strong>Autorizo expressamente</strong> o uso de algoritmos de <strong>Inteligência Artificial (IA)</strong> pela plataforma para processar, analisar e cruzar meus dados emocionais e comportamentais. Esta análise tem o objetivo exclusivo de gerar insights personalizados sobre meu perfil, identificar padrões de humor ao longo do tempo e realizar recomendações direcionadas de atividades (como meditações guiadas e mídias de entretenimento) adaptadas ao meu estado emocional atual.
                  </p>
                  <p>
                    Estou ciente de que as sugestões geradas pela IA são ferramentas auxiliares de bem-estar e não substituem, em nenhuma hipótese, o aconselhamento, diagnóstico ou tratamento médico e psicológico profissional. Os dados são armazenados em nuvem de forma criptografada e segura, sendo anonimizados para aprimoramento restrito do sistema interno. Reconheço meu direito de revogar este consentimento, acessar, alterar ou solicitar a exclusão total da minha conta e dos meus dados a qualquer momento, conforme assegurado pelo Art. 18 da LGPD.
                  </p>
                </div>
                
                <div className="mt-2 pt-4 border-t border-slate-200">
                  <label className="flex items-center gap-3 cursor-pointer group w-fit">
                    <button 
                      type="button"
                      onClick={() => setTermosAceitos(!termosAceitos)}
                      className="shrink-0 outline-none transition-transform active:scale-90"
                    >
                      {termosAceitos ? (
                        <CheckSquare className="size-6 text-emerald-500" />
                      ) : (
                        <Square className="size-6 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                      )}
                    </button>
                    <span className={`text-xs font-bold transition-colors ${termosAceitos ? 'text-emerald-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      Li e concordo com os Termos de Uso e consentimento de IA.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-[#E97451] hover:bg-[#C06043] text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100"
            >
              {loading ? (
                <Sparkles className="size-5 animate-spin" />
              ) : (
                <>
                  Concluir Cadastro e Iniciar <ChevronRight size={18} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-sm font-medium text-slate-500 pb-8">
          Já tem uma conta?{" "}
          <button 
            onClick={() => navigate("/login")}
            className="text-[#E97451] font-bold hover:underline"
          >
            Fazer login
          </button>
        </p>

      </div>
    </div>
  );
}