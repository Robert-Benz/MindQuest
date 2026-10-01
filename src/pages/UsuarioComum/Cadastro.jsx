import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Mail, Lock, User, 
  Sparkles, ChevronRight, CheckSquare, 
  Square, ShieldCheck, Check, Calendar, Users,
  Eye, EyeOff
} from "lucide-react";
import { motion } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { toast } from "sonner";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";

// Validação de E-mail via Regex
function validarEmail(email) {
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regexEmail.test(email);
}

function validarDataNascimento(dataStr) {
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(dataStr)) {
    return { valido: false, mensagem: "Data de nascimento incompleta." };
  }

  const [diaStr, mesStr, anoStr] = dataStr.split("/");
  const dia = parseInt(diaStr, 10);
  const mes = parseInt(mesStr, 10);
  const ano = parseInt(anoStr, 10);

  const anoAtual = new Date().getFullYear();
  if (mes < 1 || mes > 12) {
    return { valido: false, mensagem: "Mês inválido." };
  }
  if (ano < anoAtual - 120 || ano > anoAtual) {
    return { valido: false, mensagem: "Ano de nascimento inválido." };
  }

  const data = new Date(ano, mes - 1, dia);
  if (
    data.getFullYear() !== ano ||
    data.getMonth() !== mes - 1 ||
    data.getDate() !== dia
  ) {
    return { valido: false, mensagem: "Dia inválido para o mês informado." };
  }

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  if (data > hoje) {
    return { valido: false, mensagem: "A data de nascimento não pode estar no futuro." };
  }

  return { valido: true };
}

// Componente CustomSelect
function CustomSelect({ value, onChange, placeholder, options, icon: Icon }) {
  const [isOpen, setIsOpen] = useState(false);
  const opcaoSelecionada = options.find((o) => o.value === value);

  return (
    <div className="relative w-full text-left">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`relative w-full flex items-center justify-between pl-10 pr-4 py-2.5 rounded-xl border bg-slate-50 transition-all outline-none cursor-pointer ${
          isOpen 
            ? "border-orange-300 bg-white ring-4 ring-orange-400/10 shadow-sm" 
            : "border-slate-100 hover:bg-white"
        }`}
      >
        {Icon && (
          <Icon className={`absolute left-3.5 top-1/2 -translate-y-1/2 size-4 transition-colors ${
            value ? "text-[#E97451]" : "text-slate-400"
          }`} />
        )}
        <span className={`text-xs truncate pr-2 ${value ? "text-slate-700 font-semibold" : "text-slate-400"}`}>
          {opcaoSelecionada ? opcaoSelecionada.label : placeholder}
        </span>
        <ChevronRight className={`size-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-100 rounded-xl shadow-xl shadow-slate-900/10 p-1 max-h-48 overflow-y-auto">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-all cursor-pointer ${
                value === option.value 
                  ? "bg-orange-50 text-[#E97451] font-semibold" 
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span>{option.label}</span>
              {value === option.value && <Check size={14} className="text-[#E97451]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Cadastro() {
  const navigate = useNavigate();
  
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [confirmarEmail, setConfirmarEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [dataNascimento, setDataNascimento] = useState("");
  const [genero, setGenero] = useState("");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);

  const [termosAceitos, setTermosAceitos] = useState(false);
  const [loading, setLoading] = useState(false);

  const opcoesGenero = [
    { value: "feminino", label: "Feminino" },
    { value: "masculino", label: "Masculino" },
    { value: "nao_binario", label: "Não-binário" },
    { value: "outro", label: "Outro" },
    { value: "prefiro_nao_informar", label: "Prefiro não informar" }
  ];

  const handleCadastro = async (e) => {
    e.preventDefault();

    const emailLimpo = email.trim().toLowerCase();
    const confirmarEmailLimpo = confirmarEmail.trim().toLowerCase();
    
    if (!nome || !emailLimpo || !confirmarEmailLimpo || !senha || !confirmarSenha || !dataNascimento || !genero) {
      toast.error("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!validarEmail(emailLimpo)) {
      toast.error("Informe um endereço de e-mail válido.");
      return;
    }

    if (emailLimpo !== confirmarEmailLimpo) {
      toast.error("Os e-mails informados não coincidem.");
      return;
    }

    if (senha !== confirmarSenha) {
      toast.error("As senhas informadas não coincidem.");
      return;
    }

    const validacaoData = validarDataNascimento(dataNascimento);
    if (!validacaoData.valido) {
      toast.error(validacaoData.mensagem);
      return;
    }

    if (senha.length < 6) {
      toast.error("A senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (!termosAceitos) {
      toast.error("Você precisa concordar com os Termos e Políticas de Privacidade (LGPD) para prosseguir.");
      return;
    }

    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, emailLimpo, senha);
      const user = userCredential.user;

      const caracteres = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let codigoUnico = "PAC-";
      for (let i = 0; i < 5; i++) {
        codigoUnico += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
      }

      await updateProfile(user, { displayName: nome });

      await setDoc(doc(db, "usuarios", user.uid), {
        nome,
        email: emailLimpo,
        dataNascimento,
        genero,
        xp: 0,
        nivel: 1,
        moedas: 0,
        criadoEm: new Date().toISOString(),
        tipoPerfil: "usuario",
        codigoUnico,
        temaEquipado: "default"     
      });

      toast.success("Conta criada com sucesso! Bem-vindo ao MindQuest.");
      navigate("/menu"); 
      
    } catch (error) {
      console.error(error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este e-mail já está em uso.");
      } else if (error.code === "auth/invalid-email") {
        toast.error("E-mail inválido.");
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
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col justify-center items-center p-3 md:p-6 antialiased font-sans text-slate-800 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-orange-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-xl space-y-3 relative z-10 my-4">
        
        <button 
          onClick={() => navigate("/Home")} 
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-[#E97451] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Voltar para a Tela Inicial
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-orange-50 p-6 md:p-8"
        >
          <div className="text-center mb-5">
            <div className="bg-orange-50 w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-2 border border-orange-100 shadow-sm">
              <img src={logoReduzido} alt="MindQuest Logo" className="w-7 h-7 object-contain" />
            </div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Criar Conta</h1>
            <p className="text-xs text-slate-500 mt-0.5">Personalize sua jornada de autoconhecimento.</p>
          </div>

          <form onSubmit={handleCadastro} className="space-y-4">
            
            {/* Seção de Dados Básicos */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold text-[#E97451] uppercase tracking-widest border-b border-slate-100 pb-1.5">
                1. Seus Dados Básicos
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Nome Completo */}
                <div className="relative md:col-span-2">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Seu nome completo" 
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700"
                    required
                  />
                </div>

                {/* E-mail */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="Seu melhor e-mail" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700"
                    required
                  />
                </div>

                {/* Confirmar E-mail */}
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type="email" 
                    placeholder="Confirme seu e-mail" 
                    value={confirmarEmail}
                    onChange={(e) => setConfirmarEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700"
                    required
                  />
                </div>

                {/* Senha */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type={mostrarSenha ? "text" : "password"} 
                    placeholder="Senha (mín. 6 caracteres)" 
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarSenha((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                  >
                    {mostrarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Confirmar Senha */}
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                  <input 
                    type={mostrarConfirmarSenha ? "text" : "password"} 
                    placeholder="Confirme sua senha" 
                    value={confirmarSenha}
                    onChange={(e) => setConfirmarSenha(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setMostrarConfirmarSenha((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer transition-colors"
                  >
                    {mostrarConfirmarSenha ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Data de Nascimento */}
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
                  <input 
                    type="text" 
                    inputMode="numeric"
                    placeholder="Nascimento (DD/MM/AAAA)" 
                    maxLength={10}
                    value={dataNascimento}
                    onChange={(e) => {
                      let valor = e.target.value.replace(/\D/g, "");
                      if (valor.length > 2) valor = valor.replace(/^(\d{2})(\d)/, "$1/$2");
                      if (valor.length > 4) valor = valor.replace(/^(\d{2})\/(\d{2})(\d)/, "$1/$2/$3");
                      setDataNascimento(valor);
                    }}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-orange-200 transition-all text-slate-700 placeholder:text-slate-400"
                    required
                  />
                </div>

                {/* Gênero */}
                <div>
                  <CustomSelect 
                    value={genero}
                    onChange={setGenero}
                    placeholder="Selecione seu gênero"
                    options={opcoesGenero}
                    icon={Users}
                  />
                </div>
              </div>
            </div>

            {/* Termos de Consentimento e LGPD */}
            <div className="pt-1">
              <div className="flex flex-col gap-2 w-full p-3.5 rounded-2xl bg-slate-50 border border-slate-200 shadow-inner">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500 shrink-0" />
                  <span className="text-xs font-black text-slate-800">Termos de Privacidade e LGPD</span>
                </div>
                
                <div className="h-20 overflow-y-auto custom-scrollbar text-[10px] text-slate-500/90 font-medium leading-relaxed pr-2 space-y-2 text-justify">
                  <p>
                    Declaro ter lido e aceito os Termos de Uso e a Política de Privacidade do MindQuest, consentindo com o tratamento de dados pessoais e sensíveis (Art. 7º e 8º da Lei nº 13.709/2018 - LGPD).
                  </p>
                  <p>
                    Compreendo que os dados incluem registros contínuos de humor, diários e preferências. <strong>Autorizo o uso de Inteligência Artificial</strong> para processar esses dados e gerar insights personalizados e recomendações de bem-estar.
                  </p>
                  <p>
                    As sugestões não substituem aconselhamento médico ou psicológico. Dados armazenados de forma criptografada.
                  </p>
                </div>
                
                <div className="pt-1 border-t border-slate-200">
                  <label className="flex items-center gap-2 cursor-pointer group w-fit">
                    <button 
                      type="button"
                      onClick={() => setTermosAceitos(!termosAceitos)}
                      className="shrink-0 outline-none transition-transform active:scale-90 cursor-pointer"
                    >
                      {termosAceitos ? (
                        <CheckSquare className="size-5 text-emerald-500" />
                      ) : (
                        <Square className="size-5 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                      )}
                    </button>
                    <span className={`text-[11px] font-bold transition-colors ${termosAceitos ? 'text-emerald-700' : 'text-slate-700 group-hover:text-slate-900'}`}>
                      Li e concordo com os Termos e consentimento de IA.
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Botão de Submissão */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#E97451] hover:bg-[#C06043] text-white rounded-xl font-bold text-xs shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-70 disabled:active:scale-100 cursor-pointer"
            >
              {loading ? (
                <Sparkles className="size-4 animate-spin" />
              ) : (
                <>
                  Concluir Cadastro e Iniciar <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>
        </motion.div>

        <p className="text-center text-xs font-medium text-slate-500 pb-4">
          Já tem uma conta?{" "}
          <button 
            onClick={() => navigate("/login")}
            className="text-[#E97451] font-bold hover:underline cursor-pointer"
          >
            Fazer login
          </button>
        </p>

      </div>
    </div>
  );
}