import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { User, Mail, Lock, Heart, Film, Music, Activity, ChevronDown, Sparkles, BookOpen } from "lucide-react";
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, collection, addDoc } from "firebase/firestore";

const schema = z.object({
  nome: z.string().min(3, "Como podemos te chamar?"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "Mínimo 6 caracteres"),
  objetivoPrincipal: z.string().min(1, "Escolha seu objetivo"),
  condicaoPrevia: z.string().min(1, "Selecione uma opção"),
  generoMusical: z.string().min(1, "Qual som te acalma?"),
  generoFilme: z.string().min(1, "Qual estilo de filme você prefere?"),
  generoLivro: z.string().min(1, "Qual seu estilo de leitura?"), // NOVO CAMPO AQUI
  atividadeRelaxante: z.string().min(1, "O que mais te ajuda a relaxar?"),
});

function CustomSelect({ value, onChange, placeholder, options, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <div className="relative w-full text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between pl-11 pr-4 p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-100 rounded-2xl transition-all duration-200 outline-none focus:ring-2 focus:ring-peach-400"
      >
        {Icon && <Icon className="absolute left-3.5 top-4 size-5 text-gray-400 pointer-events-none" />}
        <span className={`text-sm ${selectedOption ? "text-gray-700 font-medium" : "text-gray-400"}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown className={`size-4 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 4 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full bg-white/95 backdrop-blur-md border border-slate-100 rounded-2xl shadow-xl max-h-60 overflow-y-auto p-1.5 min-w-[200px]"
          >
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  const { register, handleSubmit, control, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      objetivoPrincipal: "",
      condicaoPrevia: "",
      generoMusical: "",
      generoFilme: "",
      generoLivro: "", // NOVO CAMPO AQUI
      atividadeRelaxante: "",
    }
  });

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.senha);
      const user = userCredential.user;

      // Salvamos o livro também na raiz para facilitar a leitura da IA depois
      await setDoc(doc(db, "usuarios", user.uid), {
        idUsuario: user.uid,
        nome: data.nome,
        email: data.email,
        tipoPerfil: "comum",
        moedas: 0,
        nivel: 1,
        xp: 0,
        generoLivro: data.generoLivro, 
        dataCadastro: new Date()
      });

      // Mapeamento original mantido e o livro entra no índice 5
      const respostasMap = {
        0: data.objetivoPrincipal,
        1: data.condicaoPrevia,
        2: data.generoMusical,
        3: data.generoFilme,
        4: data.atividadeRelaxante,
        5: data.generoLivro 
      };

      await addDoc(collection(db, "usuarios", user.uid, "respostasFormulario"), {
        idFormulario: "questionarioInicial",
        dataPreenchimento: new Date(),
        respostas: respostasMap
      });

      navigate("/Menu");
    } catch (error) {
      alert("Erro ao criar conta: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-peach-50 via-white to-orange-50 p-4 md:p-10 selection:bg-peach-100">
      <motion.form
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl w-full max-w-2xl space-y-6 border border-slate-50"
      >
        <div className="text-center space-y-1">
          <h1 className="text-3xl font-extrabold tracking-tight text-peach-500 flex items-center justify-center gap-2">
            MindQuest <Sparkles className="size-6 text-orange-400 animate-pulse" />
          </h1>
          <p className="text-gray-400 text-sm">Vamos personalizar sua jornada de cura ✨</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[10px] font-bold text-gray-400 ml-1 uppercase tracking-widest">Informações de Acesso</label>
            <div className="mt-1.5 relative">
              <User className="absolute left-3.5 top-4 size-5 text-gray-400" />
              <input 
                placeholder="Nome completo" 
                {...register("nome")} 
                className="w-full pl-11 pr-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-peach-400 outline-none transition-all" 
              />
            </div>
            {errors.nome && <p className="text-red-400 text-xs mt-1 ml-2">{errors.nome.message}</p>}
          </div>

          <div>
            <div className="relative">
              <Mail className="absolute left-3.5 top-4 size-5 text-gray-400" />
              <input 
                placeholder="Email" 
                {...register("email")} 
                className="w-full pl-11 pr-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-peach-400 outline-none transition-all" 
              />
            </div>
            {errors.email && <p className="text-red-400 text-xs mt-1 ml-2">{errors.email.message}</p>}
          </div>

          <div>
            <div className="relative">
              <Lock className="absolute left-3.5 top-4 size-5 text-gray-400" />
              <input 
                type="password" 
                placeholder="Senha" 
                {...register("senha")} 
                className="w-full pl-11 pr-4 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-2 focus:ring-peach-400 outline-none transition-all" 
              />
            </div>
            {errors.senha && <p className="text-red-400 text-xs mt-1 ml-2">{errors.senha.message}</p>}
          </div>

          <div className="md:col-span-2 pt-4 border-t border-slate-100/80">
            <label className="text-[10px] font-bold ml-1 uppercase tracking-widest text-peach-500">Para suas Recomendações</label>
          </div>

          {/* Campo: Objetivo */}
          <div>
            <Controller
              name="objetivoPrincipal"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  placeholder="Qual seu foco hoje?"
                  icon={Heart}
                  options={[
                    { value: "ansiedade", label: "Reduzir Ansiedade" },
                    { value: "foco", label: "Melhorar Foco/TDAH" },
                    { value: "sono", label: "Dormir Melhor" },
                    { value: "autoestima", label: "Trabalhar Autoestima" },
                  ]}
                />
              )}
            />
            {errors.objetivoPrincipal && <p className="text-red-400 text-xs mt-1 ml-2">{errors.objetivoPrincipal.message}</p>}
          </div>

          {/* Campo: Histórico */}
          <div>
            <Controller
              name="condicaoPrevia"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  placeholder="Histórico de saúde mental?"
                  icon={Activity}
                  options={[
                    { value: "nao", label: "Nunca tive diagnóstico" },
                    { value: "sim_tratamento", label: "Sim, em tratamento" },
                    { value: "sim_sem_tratamento", label: "Sim, mas sem acompanhamento" },
                    { value: "prefiro_nao_dizer", label: "Prefiro não dizer" },
                  ]}
                />
              )}
            />
            {errors.condicaoPrevia && <p className="text-red-400 text-xs mt-1 ml-2">{errors.condicaoPrevia.message}</p>}
          </div>

          {/* Campo: Música */}
          <div>
            <Controller
              name="generoMusical"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  placeholder="Estilo de Música"
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
            {errors.generoMusical && <p className="text-red-400 text-xs mt-1 ml-2">{errors.generoMusical.message}</p>}
          </div>

          {/* Campo: Filme */}
          <div>
            <Controller
              name="generoFilme"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  placeholder="Tipo de Filme"
                  icon={Film}
                  options={[
                    { value: "confort", label: "Comfort Movie (Leve)" },
                    { value: "motivacional", label: "Motivacional" },
                    { value: "animacao", label: "Animação/Fantasia" },
                    { value: "documentario", label: "Documentários" },
                  ]}
                />
              )}
            />
            {errors.generoFilme && <p className="text-red-400 text-xs mt-1 ml-2">{errors.generoFilme.message}</p>}
          </div>

          {/* NOVO CAMPO: Livro */}
          <div>
            <Controller
              name="generoLivro"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  placeholder="Estilo de Leitura"
                  icon={BookOpen}
                  options={[
                    { value: "misterio", label: "Mistério / Suspense" },
                    { value: "romance", label: "Romance / Drama" },
                    { value: "fantasia", label: "Ficção Científica / Fantasia" },
                    { value: "desenvolvimento", label: "Desenvolvimento Pessoal" },
                  ]}
                />
              )}
            />
            {errors.generoLivro && <p className="text-red-400 text-xs mt-1 ml-2">{errors.generoLivro.message}</p>}
          </div>

          {/* Campo: Atividade Relaxante (Agora ocupa 1 coluna para fechar o grid) */}
          <div>
            <Controller
              name="atividadeRelaxante"
              control={control}
              render={({ field }) => (
                <CustomSelect
                  {...field}
                  placeholder="Para relaxar?"
                  icon={Sparkles}
                  options={[
                    { value: "meditacao", label: "Meditação / Respiração" },
                    { value: "leitura", label: "Ler um Livro" },
                    { value: "exercicio", label: "Exercícios Físicos" },
                    { value: "arte", label: "Pintar / Criar algo" },
                    { value: "jogar", label: "Jogar Videogames" },
                  ]}
                />
              )}
            />
            {errors.atividadeRelaxante && <p className="text-red-400 text-xs mt-1 ml-2">{errors.atividadeRelaxante.message}</p>}
          </div>
        </div>

        <button 
          type="submit" 
          className="w-full bg-peach-500 text-white p-4 rounded-2xl font-bold hover:bg-peach-400/95 shadow-lg shadow-peach-500/20 transition-all active:scale-[0.99] mt-4"
        >
          Finalizar Cadastro e Ver Perfil ✨
        </button>
      </motion.form>
    </div>
  );
}