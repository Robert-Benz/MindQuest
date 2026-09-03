import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, Mail, Heart, Film, Music, Sparkles, 
  ArrowLeft, Save, CheckCircle2, Camera, Users, UserPlus, Trash2, 
  Flame, Award, Bell, Lock, HelpCircle, Sun, Shield, ChevronRight, Pencil
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged, updateEmail } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, limit, getDocs, addDoc, deleteDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

const schema = z.object({
  nome: z.string().min(3, "Como podemos te chamar?"),
  email: z.string().email("Insira um e-mail válido"),
  objetivoPrincipal: z.string().min(1, "Escolha seu objetivo"),
  generoMusical: z.string().min(1, "Qual som te acalma?"),
  generoFilme: z.string().min(1, "Qual estilo de filme você prefere?"),
  momentoFavorito: z.string().min(1, "Escolha seu momento favorito"),
});

function CustomSelect({ value, onChange, placeholder, options, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-11 pr-4 p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl transition-all duration-200 outline-none focus:ring-2 focus:ring-peach-400"
      >
        {Icon && <Icon className="absolute left-3.5 top-4 size-5 text-slate-400" />}
        <span className={`text-sm ${selectedOption ? "text-slate-700 font-medium" : "text-slate-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-slate-400 text-xs">▼</span>
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5">
          {options.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2.5 text-sm rounded-xl transition-colors duration-150 block ${
                value === opt.value
                  ? "bg-peach-50 text-peach-600 font-semibold"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Perfil() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("perfil"); 
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [userXP, setUserXP] = useState(0);
  
  // Estados para controlar o bloqueio/desbloqueio via lápis
  const [editandoNome, setEditandoNome] = useState(false);
  const [editandoEmail, setEditandoEmail] = useState(false);

  // Foto de Perfil
  const [fotoURL, setFotoURL] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);

  // Amigos
  const [nomeAmigoBusca, setNomeAmigoBusca] = useState("");
  const [listaAmigos, setListaAmigos] = useState([]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      email: "",
      objetivoPrincipal: "",
      generoMusical: "",
      generoFilme: "",
      momentoFavorito: "noite"
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        let nomeAtual = "";
        let emailAtual = user.email || "";
        let objetivoAtual = "";
        let musicaAtual = "";
        let filmeAtual = "";
        let momentoAtual = "noite";

        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const dados = userDocSnap.data();
          nomeAtual = dados.nome || "";
          setUserXP(dados.xp || 0);
          if (dados.email) emailAtual = dados.email;
          if (dados.fotoURL) setFotoURL(dados.fotoURL);
          if (dados.objetivoPrincipal) objetivoAtual = dados.objetivoPrincipal;
          if (dados.generoMusical) musicaAtual = dados.generoMusical;
          if (dados.generoFilme) filmeAtual = dados.generoFilme;
          if (dados.momentoFavorito) momentoAtual = dados.momentoFavorito;
        }

        // Carregar Amigos
        const amigosRef = collection(db, "usuarios", user.uid, "amigos");
        const amigosSnap = await getDocs(amigosRef);
        const amigosCarregados = amigosSnap.docs.map(d => ({ id: d.id, ...d.data() }));
        setListaAmigos(amigosCarregados);

        reset({
          nome: nomeAtual,
          email: emailAtual,
          objetivoPrincipal: objetivoAtual,
          generoMusical: musicaAtual,
          generoFilme: filmeAtual,
          momentoFavorito: momentoAtual
        });

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [reset, navigate]);

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivoFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      let urlFinal = fotoURL;

      if (arquivoFoto) {
        const storage = getStorage();
        const imageRef = ref(storage, `perfil/${user.uid}`);
        await uploadBytes(imageRef, arquivoFoto);
        urlFinal = await getDownloadURL(imageRef);
      }

      if (data.email !== user.email) {
        await updateEmail(user, data.email).catch(() => {
          toast.error("Para alterar o e-mail, faça login recentemente.");
        });
      }

      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, {
        nome: data.nome,
        email: data.email,
        fotoURL: urlFinal,
        objetivoPrincipal: data.objetivoPrincipal,
        generoMusical: data.generoMusical,
        generoFilme: data.generoFilme,
        momentoFavorito: data.momentoFavorito
      }, { merge: true });

      setEditandoNome(false);
      setEditandoEmail(false);
      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 3000);
      toast.success("Perfil atualizado com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar alterações: " + error.message);
    }
  };

  const adicionarAmigo = async (e) => {
    e.preventDefault();
    if (!nomeAmigoBusca.trim()) return;

    try {
      const user = auth.currentUser;
      if (!user) return;

      const amigosRef = collection(db, "usuarios", user.uid, "amigos");
      const novoAmigoDoc = await addDoc(amigosRef, {
        nome: nomeAmigoBusca.trim(),
        adicionadoEm: new Date().toISOString()
      });

      setListaAmigos([...listaAmigos, { id: novoAmigoDoc.id, nome: nomeAmigoBusca.trim() }]);
      setNomeAmigoBusca("");
      toast.success("Amigo adicionado com sucesso!");
    } catch (error) {
      toast.error("Erro ao adicionar amigo.");
    }
  };

  const removerAmigo = async (idAmigo) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      await deleteDoc(doc(db, "usuarios", user.uid, "amigos", idAmigo));
      setListaAmigos(listaAmigos.filter(a => a.id !== idAmigo));
      toast.success("Amigo removido.");
    } catch (error) {
      toast.error("Erro ao remover amigo.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-[#E97451] size-10 animate-spin" />
      </div>
    );
  }

  const nivelAtual = Math.floor(userXP / 100) + 1;
  const xpProgresso = userXP % 100;
  const proximoNivelXP = nivelAtual * 100;

  return (
    <div className="min-h-screen bg-[#FFFBF9] p-4 md:p-10 text-slate-800 antialiased font-sans pb-28">
      
      <AnimatePresence>
        {showSuccessBadge && (
          <motion.div 
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-6 left-1/2 transform -translate-x-1/2 z-50 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-600 px-5 py-3 rounded-full shadow-lg text-sm font-semibold"
          >
            <CheckCircle2 className="size-5 text-emerald-500" />
            Perfil atualizado com sucesso!
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Navegação Topo */}
        <div className="flex justify-between items-center">
          <button 
            onClick={() => navigate("/Menu")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-peach-500 transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            Painel Principal
          </button>

          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1">
            <button
              onClick={() => setAbaAtiva("perfil")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                abaAtiva === "perfil" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              Principal
            </button>
            <button
              onClick={() => setAbaAtiva("amigos")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                abaAtiva === "amigos" ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users className="size-3.5" /> Amigos
            </button>
          </div>
        </div>

        {/* Card de Identidade e Nível */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white flex flex-col items-center text-center relative overflow-hidden"
        >
          <input 
            type="file" 
            id="fotoInput" 
            accept="image/*" 
            className="hidden" 
            onChange={handleFotoChange} 
          />

          <div 
            className="relative mb-3 group cursor-pointer"
            onClick={() => document.getElementById('fotoInput').click()}
          >
            <div className="size-24 rounded-[2rem] bg-gradient-to-br from-peach-300 to-orange-400 flex items-center justify-center text-white shadow-md overflow-hidden border-2 border-white outline outline-1 outline-slate-100">
              {fotoURL ? (
                <img src={fotoURL} alt="Seu Perfil" className="w-full h-full object-cover" />
              ) : (
                <User className="size-12" />
              )}
            </div>
            
            <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
              <Camera className="size-8 text-white" />
            </div>
            
            <div className="absolute -bottom-2 -right-3 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-orange-100 flex items-center gap-1 z-10">
              <Sparkles className="size-3 text-orange-400" />
              <span className="text-[10px] font-black text-orange-500 tracking-wide">LVL {nivelAtual}</span>
            </div>
          </div>

          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Seu Perfil</h2>
          <p className="text-xs text-slate-400 mt-0.5">Construindo uma rotina de autocuidado</p>
          
          <div className="w-full max-w-[220px] mt-4">
            <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1 px-1 uppercase tracking-wider">
              <span>{userXP} XP</span>
              <span>Faltam {proximoNivelXP - userXP} XP</span>
            </div>
            <div className="w-full h-2 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-[1px]">
              <motion.div 
                className="h-full bg-peach-400 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgresso}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </motion.div>

        {/* CONTEÚDO PRINCIPAL DO PERFIL */}
        {abaAtiva === "perfil" && (
          <div className="space-y-6">

            {/* MINHA JORNADA & ESTATÍSTICAS */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Minha Jornada</h3>
                <span className="text-xs font-bold text-peach-500 bg-peach-50 px-3 py-1 rounded-full">Ativo</span>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xl font-black text-slate-800">12</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Meditações</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xl font-black text-slate-800">8</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Diários</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <span className="block text-xl font-black text-orange-500 flex items-center justify-center gap-1">
                    <Flame className="size-4 fill-orange-400 text-orange-400" /> 5
                  </span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sequência</span>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-peach-50 to-orange-50 rounded-2xl border border-peach-100">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-white rounded-xl shadow-sm text-peach-500">
                    <Award className="size-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Conquistas Desbloqueadas</h4>
                    <p className="text-[11px] text-slate-500">3 de 12 badges conquistadas</p>
                  </div>
                </div>
                <span className="text-xs font-bold text-peach-600 hover:underline cursor-pointer">Ver todas</span>
              </div>
            </div>

            {/* FORMULÁRIO: PERSONALIZE SUA EXPERIÊNCIA */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white">
              <div className="mb-6 space-y-1">
                <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Personalize sua Experiência</h3>
                <p className="text-xs text-slate-400">Essas preferências ajudam o app a recomendar conteúdos mais adequados para você.</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                
                {/* Campo Nome com Lápis */}
<div className="space-y-1.5">
  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Seu Nome</label>
  <div className="relative">
    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400 z-10" />
    <input 
      type="text"
      placeholder="Seu nome"
      disabled={!editandoNome}
      {...register("nome")}
      className={`w-full pl-11 pr-12 p-3.5 border rounded-2xl outline-none transition-all font-medium text-slate-700 ${
        editandoNome ? "bg-white border-peach-400 ring-2 ring-peach-400/20" : "bg-slate-50 border-slate-100 cursor-default"
      }`}
    />
    <button
      type="button"
      onClick={() => setEditandoNome(!editandoNome)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-peach-500 transition-colors z-10 bg-white/50 rounded-lg"
      title={editandoNome ? "Bloquear edição" : "Editar nome"}
    >
      <Pencil className="size-4" />
    </button>
  </div>
  {errors.nome && <p className="text-red-400 text-xs mt-1 ml-2">{errors.nome.message}</p>}
</div>

{/* Campo E-mail com Lápis */}
<div className="space-y-1.5">
  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">E-mail de Acesso</label>
  <div className="relative">
    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-slate-400 z-10" />
    <input 
      type="email"
      disabled={!editandoEmail}
      {...register("email")}
      className={`w-full pl-11 pr-12 p-3.5 border rounded-2xl outline-none transition-all font-medium text-slate-700 ${
        editandoEmail ? "bg-white border-peach-400 ring-2 ring-peach-400/20" : "bg-slate-50 border-slate-100 cursor-default"
      }`}
    />
    <button
      type="button"
      onClick={() => setEditandoEmail(!editandoEmail)}
      className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-peach-500 transition-colors z-10 bg-white/50 rounded-lg"
      title={editandoEmail ? "Bloquear edição" : "Editar e-mail"}
    >
      <Pencil className="size-4" />
    </button>
  </div>
  {errors.email && <p className="text-red-400 text-xs mt-1 ml-2">{errors.email.message}</p>}
</div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Foco da Jornada</label>
                  <Controller
                    name="objetivoPrincipal"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        {...field}
                        placeholder="Selecione seu foco"
                        icon={Heart}
                        options={[
                          { value: "ansiedade", label: "Reduzir Ansiedade" },
                          { value: "estresse", label: "Lidar com Estresse / Burnout" },
                          { value: "habitos", label: "Criar Hábitos Saudáveis" },
                          { value: "humor", label: "Acompanhar meu Humor" },
                          { value: "rotina", label: "Sair da Rotina / Explorar" },
                          { value: "foco", label: "Melhorar Foco / TDAH" },
                          { value: "sono", label: "Dormir Melhor" },
                          { value: "autoestima", label: "Trabalhar Autoestima" },
                          { value: "autoconhecimento", label: "Autoconhecimento" },
                        ]}
                      />
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Opções de Música idênticas ao Cadastro */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Estilo de Música</label>
                    <Controller
                      name="generoMusical"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          placeholder="Escolha a música"
                          icon={Music}
                          options={[
                            { value: "lofi", label: "Lofi / Relaxante" },
                            { value: "instrumental", label: "Instrumental / Clássica" },
                            { value: "pop", label: "Pop / Vibrante" },
                            { value: "natureza", label: "Sons da Natureza" },
                          ]}
                        />
                      )}
                    />
                  </div>

                  {/* Opções de Filme idênticas ao Cadastro */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Tipo de Filme</label>
                    <Controller
                      name="generoFilme"
                      control={control}
                      render={({ field }) => (
                        <CustomSelect
                          {...field}
                          placeholder="Escolha o filme"
                          icon={Film}
                          options={[
                            { value: "confort", label: "Comfort Movie (Leve)" },
                            { value: "motivacional", label: "Motivacional" },
                            { value: "animacao", label: "Animação / Fantasia" },
                            { value: "documentario", label: "Documentários" },
                          ]}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Melhor Horário / Momento</label>
                  <Controller
                    name="momentoFavorito"
                    control={control}
                    render={({ field }) => (
                      <CustomSelect
                        {...field}
                        placeholder="Selecione o momento"
                        icon={Sun}
                        options={[
                          { value: "manha", label: "Manhã" },
                          { value: "tarde", label: "Tarde" },
                          { value: "noite", label: "Noite" },
                        ]}
                      />
                    )}
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-peach-500 hover:bg-peach-400 text-white p-4 rounded-2xl font-bold shadow-md shadow-peach-500/20 transition-all active:scale-[0.99] mt-6 flex items-center justify-center gap-2"
                >
                  <Save className="size-5" />
                  Salvar Alterações
                </button>
              </form>
            </div>

            {/* CONFIGURAÇÕES E PRIVACIDADE */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Configurações & Privacidade</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Bell className="size-5 text-slate-400" />
                    <span className="text-sm font-bold">Notificações e Lembretes</span>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Lock className="size-5 text-slate-400" />
                    <span className="text-sm font-bold">Privacidade e Gerenciamento de Dados</span>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* PRECISA DE AJUDA? */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white space-y-4">
              <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Precisa de Ajuda?</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-slate-700">
                    <HelpCircle className="size-5 text-slate-400" />
                    <span className="text-sm font-bold">Central de Ajuda & FAQ</span>
                  </div>
                  <ChevronRight className="size-4 text-slate-400" />
                </div>

                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/60 transition-colors cursor-pointer">
                  <div className="flex items-center gap-3 text-slate-700">
                    <Shield className="size-5 text-peach-500" />
                    <span className="text-sm font-bold text-peach-600">Recursos de Apoio Emocional</span>
                  </div>
                  <ChevronRight className="size-4 text-peach-400" />
                </div>
              </div>
            </div>

          </div>
        )}

        {/* CONTEÚDO DA ABA: AMIGOS */}
        {abaAtiva === "amigos" && (
          <motion.div 
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white space-y-6"
          >
            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-800">Conexões & Amigos</h3>
              <p className="text-xs text-slate-400">Adicione pessoas pelo nome de usuário para compartilhar sua jornada.</p>
            </div>

            <form onSubmit={adicionarAmigo} className="flex gap-2">
              <div className="relative flex-1">
                <UserPlus className="absolute left-3.5 top-3.5 size-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Nome de usuário do amigo..."
                  value={nomeAmigoBusca}
                  onChange={(e) => setNomeAmigoBusca(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:ring-2 focus:ring-peach-400 outline-none text-slate-700"
                />
              </div>
              <button 
                type="submit"
                className="bg-peach-500 hover:bg-peach-400 text-white px-5 rounded-2xl text-xs font-bold shadow-md shadow-peach-500/20 transition-all"
              >
                Adicionar
              </button>
            </form>

            <div className="space-y-3 pt-2">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sua Rede de Apoio ({listaAmigos.length})</label>
              
              {listaAmigos.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Users className="size-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs text-slate-400 font-medium">Nenhum amigo adicionado ainda.</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {listaAmigos.map((amigo) => (
                    <div key={amigo.id} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-xl bg-peach-100 text-peach-600 font-bold flex items-center justify-center text-sm">
                          {amigo.nome.charAt(0).toUpperCase()}
                        </div>
                        <span className="text-sm font-bold text-slate-700">{amigo.nome}</span>
                      </div>
                      <button 
                        onClick={() => removerAmigo(amigo.id)}
                        className="text-slate-400 hover:text-red-500 p-2 rounded-xl transition-colors"
                        title="Remover amigo"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
}