import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  User, Mail, Heart, Film, Music, Sparkles, 
  ArrowLeft, Save, CheckCircle2, Camera 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, collection, query, limit, getDocs } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage"; // Adicionado Storage!
import { toast } from "sonner";

const schema = z.object({
  nome: z.string().min(3, "Como podemos te chamar?"),
  objetivoPrincipal: z.string().min(1, "Escolha seu objetivo"),
  generoMusical: z.string().min(1, "Qual som te acalma?"),
  generoFilme: z.string().min(1, "Qual estilo de filme você prefere?"),
});

// Componente de Dropdown Arredondado
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
        {Icon && <Icon className="absolute left-3.5 top-4 size-5 text-gray-400" />}
        <span className={`text-sm ${selectedOption ? "text-gray-700 font-medium" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <span className="text-gray-400 text-xs">▼</span>
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
                  : "text-gray-600 hover:bg-slate-50"
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
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userXP, setUserXP] = useState(0);
  
  // Novos estados para a Foto de Perfil
  const [fotoURL, setFotoURL] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      nome: "",
      objetivoPrincipal: "",
      generoMusical: "",
      generoFilme: ""
    }
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
        return;
      }

      setUserEmail(user.email || "");

      try {
        let nomeAtual = "";
        let objetivoAtual = "";
        let musicaAtual = "";
        let filmeAtual = "";

        // Busca dados
        const userDocRef = doc(db, "usuarios", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          const dados = userDocSnap.data();
          nomeAtual = dados.nome || "";
          setUserXP(dados.xp || 0);
          
          // Carrega a foto de perfil se ela existir no banco
          if (dados.fotoURL) setFotoURL(dados.fotoURL);
          
          if (dados.objetivoPrincipal) objetivoAtual = dados.objetivoPrincipal;
          if (dados.generoMusical) musicaAtual = dados.generoMusical;
          if (dados.generoFilme) filmeAtual = dados.generoFilme;
        }

        const subRef = collection(db, "usuarios", user.uid, "respostasFormulario");
        const subSnap = await getDocs(query(subRef, limit(1)));

        if (!subSnap.empty) {
          const respostas = subSnap.docs[0].data().respostas || {};
          if (respostas["0"]) objetivoAtual = respostas["0"];
          if (respostas["2"]) musicaAtual = respostas["2"];
          if (respostas["3"]) filmeAtual = respostas["3"];
        }

        reset({
          nome: nomeAtual,
          objetivoPrincipal: objetivoAtual,
          generoMusical: musicaAtual,
          generoFilme: filmeAtual
        });

      } catch (error) {
        console.error("Erro ao carregar dados do banco:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [reset, navigate]);

  // Função que lida com a seleção da imagem no computador/celular
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivoFoto(file);
      
      // Cria um preview da imagem instantaneamente
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoURL(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data) => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      let urlFinal = fotoURL; // Mantém a antiga se não upou nada de novo

      // Se o usuário selecionou um arquivo novo, fazemos o Upload pro Firebase Storage
      if (arquivoFoto) {
        const storage = getStorage();
        const imageRef = ref(storage, `perfil/${user.uid}`);
        
        // Sobe a imagem
        await uploadBytes(imageRef, arquivoFoto);
        
        // Pega a URL pública da imagem que acabou de subir
        urlFinal = await getDownloadURL(imageRef);
      }

      const userDocRef = doc(db, "usuarios", user.uid);
      await setDoc(userDocRef, {
        nome: data.nome,
        email: userEmail,
        fotoURL: urlFinal, // Salva a URL da foto!
        objetivoPrincipal: data.objetivoPrincipal,
        generoMusical: data.generoMusical,
        generoFilme: data.generoFilme
      }, { merge: true });

      const subRef = collection(db, "usuarios", user.uid, "respostasFormulario");
      const subSnap = await getDocs(query(subRef, limit(1)));
      
      let targetDocRef = subSnap.empty 
        ? doc(db, "usuarios", user.uid, "respostasFormulario", "questionarioInicial")
        : doc(db, "usuarios", user.uid, "respostasFormulario", subSnap.docs[0].id);

      await setDoc(targetDocRef, {
        respostas: {
          "0": data.objetivoPrincipal,
          "2": data.generoMusical,
          "3": data.generoFilme
        }
      }, { merge: true });

      setShowSuccessBadge(true);
      setTimeout(() => setShowSuccessBadge(false), 3000);
    } catch (error) {
      toast.error("Erro ao salvar alterações: " + error.message);
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
    <div className="min-h-screen bg-gradient-to-br from-peach-50 via-white to-orange-50 p-4 md:p-10 text-slate-800 antialiased font-sans pb-24">
      
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
        
        <button 
          onClick={() => navigate("/Menu")}
          className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-peach-500 transition-colors group"
        >
          <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
          Voltar para o Painel
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-xl border border-white space-y-8"
        >
          <div className="flex flex-col items-center text-center">
            
            {/* Input de arquivo invisível (acionado pelo clique no avatar) */}
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
              
              {/* Máscara escura com a câmera que aparece ao passar o mouse */}
              <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all duration-200">
                <Camera className="size-8 text-white" />
              </div>
              
              <div className="absolute -bottom-2 -right-4 bg-white px-2.5 py-1 rounded-xl shadow-sm border border-orange-100 flex items-center gap-1 z-10">
                <Sparkles className="size-3 text-orange-400" />
                <span className="text-[10px] font-black text-orange-500 tracking-wide">LVL {nivelAtual}</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-2">Seu Perfil</h2>
            
            <div className="w-full max-w-[220px] mt-4 mb-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mb-1.5 px-1 uppercase tracking-wider">
                <span>{userXP} XP</span>
                <span>Faltam {proximoNivelXP - userXP} XP</span>
              </div>
              <div className="w-full h-2.5 bg-slate-50 border border-slate-100 rounded-full overflow-hidden p-[1px]">
                <motion.div 
                  className="h-full bg-gradient-to-r from-peach-300 to-peach-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgresso}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                />
              </div>
            </div>

          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Seu Nome</label>
              <div className="relative">
                <User className="absolute left-3.5 top-4 size-5 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Seu nome"
                  {...register("nome")}
                  className="w-full pl-11 pr-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-peach-400 outline-none transition-all font-medium text-slate-700"
                />
              </div>
              {errors.nome && <p className="text-red-400 text-xs mt-1 ml-2">{errors.nome.message}</p>}
            </div>

            <div className="space-y-1.5 opacity-70">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-4 size-5 text-gray-400" />
                <input 
                  type="email"
                  value={userEmail}
                  disabled
                  className="w-full pl-11 pr-4 p-3.5 bg-slate-100 border border-slate-200 rounded-2xl cursor-not-allowed outline-none font-medium text-gray-500"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100/80">
              <label className="text-[10px] font-bold ml-1 uppercase tracking-widest text-peach-500">Suas Recomendações</label>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Foco da Jornada</label>
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
                      { value: "foco", label: "Melhorar Foco / TDAH" },
                      { value: "sono", label: "Dormir Melhor" },
                      { value: "autoestima", label: "Trabalhar Autoestima" },
                    ]}
                  />
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Estilo de Música</label>
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

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Tipo de Filme</label>
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

            <button 
              type="submit" 
              className="w-full bg-peach-500 hover:bg-peach-400/95 text-white p-4 rounded-2xl font-bold shadow-lg shadow-peach-500/10 transition-all active:scale-[0.99] mt-6 flex items-center justify-center gap-2"
            >
              <Save className="size-5" />
              Salvar Alterações
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}