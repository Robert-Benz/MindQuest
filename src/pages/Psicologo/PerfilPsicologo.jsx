import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Users, BriefcaseMedical, 
  UserSquare2, Activity, ShieldCheck, Plus, Trash2, 
  Clock, Search, Camera, UserPlus, X, Check,
  MessageSquare, Send, LogOut, KeyRound, FileText, Upload, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged, signOut, updatePassword } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc, addDoc, query, orderBy, onSnapshot } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";
import BottomNavPsicologo from "../../components/BottomNavPsicologo";

export default function PerfilPsicologo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("pacientes"); 
  const [userUid, setUserUid] = useState(null);

  const [servicos, setServicos] = useState([]);
  const [perfilPro, setPerfilPro] = useState({ nome: "", crp: "", especialidade: "", bio: "", statusCRP: "Pendente" });
  const [fotoURL, setFotoURL] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);

  // Estados para alteração de senha
  const [modalSenha, setModalSenha] = useState(false);
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [salvandoSenha, setSalvandoSenha] = useState(false);

  // Estados para documento de identidade
  const [enviandoDocumento, setEnviandoDocumento] = useState(false);

  const [pacientes, setPacientes] = useState([
    { id: "1", nome: "Ana Carolina M.", codigo: "PAC-992", ultimoHumor: "😔", nivel: 2, status: "Atenção", aviso: "Humor baixo há 3 dias consecutivos.", data: "Hoje, 09:30" },
    { id: "2", nome: "Lucas Rafael", codigo: "PAC-451", ultimoHumor: "😊", nivel: 8, status: "Estável", aviso: "Check-in realizado com sucesso.", data: "Ontem, 20:15" },
  ]);
  
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);
  const [codigoPacienteInput, setCodigoPacienteInput] = useState("");

  const [pacienteSelecionadoChat, setPacienteSelecionadoChat] = useState(null);
  const [mensagensChat, setMensagensChat] = useState([]);
  const [novaMensagem, setNovaMensagem] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const abaUrl = params.get("aba");
    if (abaUrl) {
      setAbaAtiva(abaUrl);
    } else {
      setAbaAtiva("pacientes");
    }
  }, [location.search]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login-psicologo");
        return;
      }
      setUserUid(user.uid);
      await carregarDados(user.uid);
    });
    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!pacienteSelecionadoChat) return;

    const chatRef = collection(db, "usuarios", pacienteSelecionadoChat.id || "1", "chatTerapeuta");
    const q = query(chatRef, orderBy("data", "asc"));

    const unsubscribeChat = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMensagensChat(msgs);
    }, (error) => {
      setMensagensChat([
        { id: "m1", remetente: "paciente", texto: "Olá doutor(a), enviei meu diário de humor desta semana.", data: new Date().toISOString() },
        { id: "m2", remetente: "psicologo", texto: "Olá! Obrigado por compartilhar. Vou analisar e conversamos na sessão.", data: new Date().toISOString() }
      ]);
    });

    return () => unsubscribeChat();
  }, [pacienteSelecionadoChat]);

  const carregarDados = async (uid) => {
    try {
      const docRef = doc(db, "psicologos", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dados = docSnap.data();
        setPerfilPro({
          nome: dados.nome || "",
          crp: dados.crp || "",
          especialidade: dados.especialidade || "Psicologia Clínica",
          bio: dados.bio || "Olá! Sou profissional cadastrado no MindQuest Pro.",
          statusCRP: dados.statusCRP || "Pendente"
        });
        if (dados.fotoURL) setFotoURL(dados.fotoURL);
      }

      const servicosRef = collection(db, "psicologos", uid, "servicos");
      const servicosSnap = await getDocs(servicosRef);
      setServicos(servicosSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
      toast.success("Sessão encerrada com sucesso.");
      navigate("/login-psicologo");
    } catch (error) {
      toast.error("Erro ao sair da conta.");
    }
  };

  const handleAlterarSenha = async (e) => {
    e.preventDefault();
    if (novaSenha.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (novaSenha !== confirmarSenha) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setSalvandoSenha(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updatePassword(user, novaSenha);
      toast.success("Senha alterada com sucesso!");
      setModalSenha(false);
      setNovaSenha("");
      setConfirmarSenha("");
    } catch (error) {
      if (error.code === "auth/requires-recent-login") {
        toast.error("Por segurança, faça login novamente antes de alterar a senha.");
      } else {
        toast.error("Erro ao alterar senha. Tente novamente.");
      }
    } finally {
      setSalvandoSenha(false);
    }
  };

  const handleUploadDocumento = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setEnviandoDocumento(true);
    setTimeout(async () => {
      try {
        const storage = getStorage();
        const docRef = ref(storage, `documentos_crp/${userUid}/${file.name}`);
        await uploadBytes(docRef, file);
        const urlDoc = await getDownloadURL(docRef);

        await setDoc(doc(db, "psicologos", userUid), { 
          documentoCRP: urlDoc,
          statusCRP: "Em Análise"
        }, { merge: true });

        setPerfilPro(prev => ({ ...prev, statusCRP: "Em Análise" }));
        toast.success("Documento enviado com sucesso! Validação em andamento.");
      } catch (error) {
        toast.error("Erro ao enviar o documento.");
      } finally {
        setEnviandoDocumento(false);
      }
    }, 1500);
  };

  const enviarMensagemChat = async (e) => {
    e.preventDefault();
    if (!novaMensagem.trim() || !pacienteSelecionadoChat) return;

    try {
      await addDoc(collection(db, "usuarios", pacienteSelecionadoChat.id || "1", "chatTerapeuta"), {
        texto: novaMensagem.trim(),
        remetente: "psicologo",
        data: new Date().toISOString()
      });
      setNovaMensagem("");
    } catch (error) {
      setMensagensChat(prev => [...prev, { id: Date.now().toString(), remetente: "psicologo", texto: novaMensagem.trim(), data: new Date().toISOString() }]);
      setNovaMensagem("");
    }
  };

  const handleAdicionarPaciente = async (e) => {
    e.preventDefault();
    if (!codigoPacienteInput.trim()) {
      toast.error("Digite o código do paciente.");
      return;
    }

    try {
      const novoPacienteSimulado = {
        id: Date.now().toString(),
        nome: `Paciente (${codigoPacienteInput.toUpperCase()})`,
        codigo: codigoPacienteInput.toUpperCase(),
        ultimoHumor: "😊",
        nivel: 7,
        status: "Estável",
        aviso: "Paciente vinculado recentemente.",
        data: "Agora mesmo"
      };

      setPacientes([novoPacienteSimulado, ...pacientes]);
      toast.success("Paciente vinculado com sucesso!");
      setCodigoPacienteInput("");
      setMostrarModalAdicionar(false);
    } catch (error) {
      toast.error("Erro ao vincular paciente.");
    }
  };

  const removerPaciente = async (id, nome) => {
    if (!window.confirm(`Deseja realmente desvincular ${nome} do seu acompanhamento?`)) return;
    setPacientes(pacientes.filter(p => p.id !== id));
    toast.success("Paciente desvinculado.");
  };

  const pacientesFiltrados = pacientes.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) || 
    p.codigo.toLowerCase().includes(termoBusca.toLowerCase())
  );

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setArquivoFoto(file);
      const reader = new FileReader();
      reader.onloadend = () => setFotoURL(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const salvarPerfil = async (e) => {
    e.preventDefault();
    try {
      let urlFinal = fotoURL;
      if (arquivoFoto) {
        const storage = getStorage();
        const imageRef = ref(storage, `psicologos_perfil/${userUid}`);
        await uploadBytes(imageRef, arquivoFoto);
        urlFinal = await getDownloadURL(imageRef);
      }
      const dadosParaSalvar = { ...perfilPro, fotoURL: urlFinal };
      await setDoc(doc(db, "psicologos", userUid), dadosParaSalvar, { merge: true });
      toast.success("Perfil profissional atualizado!");
    } catch (error) {
      toast.error("Erro ao salvar perfil.");
    }
  };

  const removerServico = async (id) => {
    try {
      await deleteDoc(doc(db, "psicologos", userUid, "servicos", id));
      setServicos(servicos.filter(s => s.id !== id));
      toast.success("Serviço removido.");
    } catch (error) {
      toast.error("Erro ao remover serviço.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-peach-500 size-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32 relative overflow-hidden">
      
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-peach-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-72 h-72 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        
        {/* Topo com Voltar e Botão de Sair */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => {
              if (abaAtiva !== "pacientes") {
                navigate("/painel-psicologo?aba=pacientes");
              } else {
                navigate("/");
              }
            }} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-peach-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Início
          </button>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleLogOut}
              className="flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 px-3 py-1.5 rounded-xl transition-all"
              title="Sair da conta"
            >
              <LogOut size={14} /> Sair
            </button>
            <div className="flex items-center gap-1.5 bg-white/80 border border-peach-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
              <ShieldCheck size={14} className="text-emerald-500" />
              <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">MindQuest Pro</span>
            </div>
          </div>
        </div>

        {/* Header do Profissional */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-peach-50 shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-peach-100/40 blur-3xl pointer-events-none" />
          
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-400 to-[#E97451] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white overflow-hidden border-2 border-white">
            {fotoURL ? (
              <img src={fotoURL} alt="Profissional" className="w-full h-full object-cover" />
            ) : (
              <img src={logoReduzido} alt="Logo" className="w-10 h-10 object-contain filter brightness-0 invert" />
            )}
          </div>

          <p className="text-[10px] font-bold text-peach-500 uppercase tracking-[0.2em] mb-1">Painel Clínico</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{perfilPro.nome || "Área do Profissional"}</h1>
          <p className="text-xs text-slate-500 mt-1">Gerencie seus pacientes, chat e consultas com segurança.</p>
        </motion.div>

        {/* ABA 1: PACIENTES / INÍCIO */}
        {abaAtiva === "pacientes" && (
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
             <div className="bg-peach-50 border border-peach-100 p-4 rounded-2xl flex items-start gap-3">
               <ShieldCheck className="text-peach-500 shrink-0 mt-0.5" size={18} />
               <div>
                 <span className="block text-xs font-bold text-slate-800">Dados Protegidos por LGPD</span>
                 <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">Você só visualiza pacientes que consentiram ativamente o compartilhamento dos registros.</span>
               </div>
             </div>

             <div className="flex gap-2">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Buscar por nome ou código (ex: PAC-992)..." 
                   value={termoBusca}
                   onChange={(e) => setTermoBusca(e.target.value)}
                   className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm focus:ring-2 focus:ring-peach-200 transition-all font-medium text-slate-700" 
                 />
               </div>

               <button 
                 onClick={() => setMostrarModalAdicionar(!mostrarModalAdicionar)}
                 className="px-4 py-3.5 bg-[#E97451] hover:bg-[#C06043] text-white rounded-2xl shadow-md shadow-orange-500/20 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
               >
                 <UserPlus size={16} /> Vincular
               </button>
             </div>

             <AnimatePresence>
               {mostrarModalAdicionar && (
                 <motion.form 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   onSubmit={handleAdicionarPaciente}
                   className="bg-white p-6 rounded-[2rem] border border-peach-100 shadow-lg shadow-orange-900/5 space-y-3 overflow-hidden"
                 >
                   <div className="flex justify-between items-center">
                     <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Vincular Novo Paciente</h3>
                     <button type="button" onClick={() => setMostrarModalAdicionar(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={16} />
                     </button>
                   </div>
                   <p className="text-[11px] text-slate-500">Insira o código de acesso exclusivo fornecido pelo paciente.</p>
                   <div className="flex gap-2">
                     <input 
                       type="text"
                       placeholder="Ex: PAC-789"
                       value={codigoPacienteInput}
                       onChange={(e) => setCodigoPacienteInput(e.target.value)}
                       className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-peach-200"
                       required
                     />
                     <button type="submit" className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                       <Check size={16} /> Adicionar
                     </button>
                   </div>
                 </motion.form>
               )}
             </AnimatePresence>

             <div className="space-y-3">
               {pacientesFiltrados.length === 0 ? (
                 <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-[2rem]">
                   <Users className="mx-auto size-8 text-slate-300 mb-2" />
                   <p className="text-sm font-bold text-slate-500">Nenhum paciente encontrado.</p>
                 </div>
               ) : (
                 pacientesFiltrados.map((paciente) => (
                    <div key={paciente.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-3">
                          <div className="size-12 rounded-[1rem] bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-inner">
                            {paciente.ultimoHumor}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="text-sm font-bold text-slate-800">{paciente.nome}</h3>
                              <span className="text-[9px] font-black bg-peach-50 text-peach-600 px-2 py-0.5 rounded-md border border-peach-100">{paciente.codigo}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> Check-in: {paciente.data}
                            </p>
                          </div>
                        </div>

                        <button 
                          onClick={() => removerPaciente(paciente.id, paciente.nome)}
                          className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Desvincular Paciente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-2 items-start mb-3">
                        <Activity size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-slate-600">{paciente.aviso}</p>
                      </div>

                      <div className="flex gap-2">
                        <button 
                          onClick={() => navigate("/HistoricoPaciente")} 
                          className="flex-1 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-peach-500 transition-colors flex items-center justify-center gap-1.5"
                        >
                          Ver Histórico
                        </button>
                        <button 
                          onClick={() => {
                            setPacienteSelecionadoChat(paciente);
                            setAbaAtiva("chat");
                            navigate("/painel-psicologo?aba=chat");
                          }} 
                          className="py-2.5 px-4 rounded-xl bg-peach-50 text-peach-600 text-xs font-bold hover:bg-peach-100 transition-colors flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare size={14} /> Abrir Chat
                        </button>
                      </div>
                    </div>
                  ))
               )}
             </div>
           </motion.div>
        )}

        {/* ABA 2: SERVIÇOS */}
        {abaAtiva === "servicos" && (
          <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Seu Catálogo</span>
              <button onClick={() => navigate("/CadastroDeServico")} className="flex items-center gap-1.5 text-xs font-bold text-white bg-[#E97451] px-4 py-2 rounded-xl shadow-md shadow-orange-500/20 hover:bg-[#C06043] transition-all active:scale-95">
                <Plus size={14} /> Novo Serviço
              </button>
            </div>
            
            <div className="space-y-3 pt-2">
              {servicos.length === 0 ? (
                <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-[2rem]">
                  <BriefcaseMedical className="mx-auto size-8 text-slate-300 mb-2" />
                  <p className="text-sm font-bold text-slate-500">Nenhum serviço cadastrado.</p>
                </div>
              ) : (
                servicos.map((servico) => (
                  <div key={servico.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{servico.titulo}</h3>
                      <p className="text-[10px] font-bold text-emerald-600 mt-1">R$ {parseFloat(servico.preco).toFixed(2)} ({servico.duracao})</p>
                    </div>
                    <button onClick={() => removerServico(servico.id)} className="p-2.5 rounded-xl text-slate-300 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {/* ABA 3: MENSAGENS / CHAT COM PACIENTE */}
        {abaAtiva === "chat" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-white space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-peach-500 uppercase tracking-[0.18em]">Canal Clínico</span>
                <h2 className="text-lg font-black text-slate-800">Mensagens com Pacientes</h2>
              </div>
              {pacienteSelecionadoChat && (
                <button 
                  onClick={() => setPacienteSelecionadoChat(null)}
                  className="text-xs text-peach-600 font-bold bg-peach-50 px-3 py-1 rounded-xl"
                >
                  Trocar Paciente
                </button>
              )}
            </div>

            {!pacienteSelecionadoChat ? (
              <div className="space-y-3 py-4">
                <p className="text-xs text-slate-500">Selecione um paciente para iniciar ou continuar a conversa:</p>
                <div className="space-y-2">
                  {pacientes.map(p => (
                    <div 
                      key={p.id}
                      onClick={() => setPacienteSelecionadoChat(p)}
                      className="p-4 bg-slate-50 hover:bg-peach-50/60 border border-slate-100 rounded-2xl flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-xl bg-peach-100 text-peach-700 font-black flex items-center justify-center">
                          {p.ultimoHumor}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{p.nome}</h4>
                          <span className="text-[10px] text-slate-400">{p.codigo}</span>
                        </div>
                      </div>
                      <MessageSquare size={16} className="text-peach-400" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-peach-50/50 rounded-2xl flex items-center gap-3 border border-peach-100">
                  <div className="size-9 rounded-xl bg-peach-100 text-peach-700 font-black flex items-center justify-center text-sm">
                    {pacienteSelecionadoChat.ultimoHumor}
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-800">Conversando com {pacienteSelecionadoChat.nome}</h4>
                    <span className="text-[9px] text-emerald-600 font-bold">Canal Seguro & Confidencial</span>
                  </div>
                </div>

                <div className="border border-slate-100 rounded-2xl bg-slate-50/50 flex flex-col h-72">
                  <div className="flex-1 p-4 overflow-y-auto space-y-3 custom-scrollbar">
                    {mensagensChat.map(msg => (
                      <div key={msg.id} className={`flex flex-col ${msg.remetente === "psicologo" ? "items-end" : "items-start"}`}>
                        <div className={`max-w-[80%] p-3 rounded-2xl text-xs font-medium leading-relaxed ${
                          msg.remetente === "psicologo" 
                            ? "bg-[#E97451] text-white rounded-br-none shadow-sm" 
                            : "bg-white text-slate-700 border border-slate-200 rounded-bl-none shadow-sm"
                        }`}>
                          {msg.texto}
                        </div>
                      </div>
                    ))}
                  </div>

                  <form onSubmit={enviarMensagemChat} className="p-3 bg-white border-t border-slate-100 rounded-b-2xl flex gap-2 items-center">
                    <input 
                      type="text" 
                      placeholder="Digite sua resposta..." 
                      value={novaMensagem}
                      onChange={(e) => setNovaMensagem(e.target.value)}
                      className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-peach-200"
                    />
                    <button type="submit" className="p-2.5 bg-[#E97451] hover:bg-[#C06043] text-white rounded-xl transition-all shadow-sm">
                      <Send size={16} />
                    </button>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* ABA 4: PERFIL PÚBLICO DO PROFISSIONAL & CONFIGURAÇÕES */}
        {abaAtiva === "perfil" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white space-y-6">
              <div className="mb-2">
                <span className="text-[10px] font-bold text-peach-500 uppercase tracking-[0.18em]">Identidade Profissional</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Dados Públicos</h2>
              </div>

              <form onSubmit={salvarPerfil} className="space-y-5">
                <div className="flex flex-col items-center mb-6">
                  <input type="file" id="fotoInput" accept="image/*" className="hidden" onChange={handleFotoChange} />
                  <div className="size-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden border-4 border-white shadow-sm" onClick={() => document.getElementById('fotoInput').click()}>
                    {fotoURL ? <img src={fotoURL} alt="Perfil" className="w-full h-full object-cover" /> : <Camera size={32} />}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-2 font-medium">Toque para alterar a foto</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Nome Completo</label>
                  <input type="text" value={perfilPro.nome} onChange={e => setPerfilPro({...perfilPro, nome: e.target.value})} className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200" />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">CRP</label>
                    <input type="text" value={perfilPro.crp} onChange={e => setPerfilPro({...perfilPro, crp: e.target.value})} className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Especialidade</label>
                    <input type="text" value={perfilPro.especialidade} onChange={e => setPerfilPro({...perfilPro, especialidade: e.target.value})} className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none" />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Sobre Mim / Abordagem</label>
                  <textarea rows="4" value={perfilPro.bio} onChange={e => setPerfilPro({...perfilPro, bio: e.target.value})} className="w-full mt-1 p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none resize-none" />
                </div>

                <button type="submit" className="w-full py-4 rounded-2xl bg-[#E97451] hover:bg-[#C06043] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all">
                  Salvar Perfil Público
                </button>
              </form>
            </div>

            {/* SEÇÃO DE SEGURANÇA E VALIDAÇÃO DE IDENTIDADE */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-white space-y-6">
              <div>
                <span className="text-[10px] font-bold text-peach-500 uppercase tracking-[0.18em]">Credenciais e Segurança</span>
                <h2 className="text-lg font-black text-slate-800 mt-1">Validação e Conta</h2>
              </div>

              <div className="space-y-3">
                
                {/* Status de Validação do CRP */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-peach-500">
                      <FileText size={18} />
                    </div>
                    <div>
                      <span className="block text-sm font-bold text-slate-700">Validação do CRP / Identidade</span>
                      <span className="text-[10px] text-slate-400">Status: <strong className="text-amber-600">{perfilPro.statusCRP}</strong></span>
                    </div>
                  </div>
                  
                  <label className="px-4 py-2 bg-peach-50 hover:bg-peach-100 text-peach-600 rounded-xl text-xs font-bold cursor-pointer transition-all flex items-center gap-1.5 shadow-sm">
                    <Upload size={14} /> 
                    {enviandoDocumento ? "Enviando..." : "Enviar Doc"}
                    <input type="file" accept=".pdf,.png,.jpg,.jpeg" className="hidden" onChange={handleUploadDocumento} />
                  </label>
                </div>

                {/* Alterar Senha */}
                <button 
                  type="button" 
                  onClick={() => setModalSenha(true)} 
                  className="w-full flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:bg-peach-50 hover:border-peach-100 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-10 rounded-xl bg-white flex items-center justify-center shadow-sm">
                      <KeyRound size={17} className="text-slate-400" />
                    </div>
                    <div className="text-left">
                      <span className="block text-sm font-bold text-slate-700">Alterar Senha</span>
                      <span className="text-[10px] text-slate-400">Atualize sua senha de acesso</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-slate-300" />
                </button>

              </div>
            </div>

          </motion.div>
        )}

      </div>

      {/* MODAL DE ALTERAR SENHA */}
      <AnimatePresence>
        {modalSenha && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div initial={{ y: 50, scale: 0.95 }} animate={{ y: 0, scale: 1 }} exit={{ y: 50, scale: 0.95 }} className="bg-white w-full max-w-sm rounded-[2.5rem] p-7 shadow-2xl relative">
              <button onClick={() => setModalSenha(false)} className="absolute top-5 right-5 p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"><X size={16} /></button>
              
              <div className="size-12 rounded-2xl bg-peach-50 flex items-center justify-center mb-4"><KeyRound className="text-peach-500" size={24} /></div>
              <h2 className="text-xl font-black text-slate-800">Alterar Senha</h2>
              <p className="text-xs text-slate-500 mt-1 mb-5">Insira sua nova senha de acesso profissional.</p>
              
              <form onSubmit={handleAlterarSenha} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Mínimo 6 caracteres" 
                    value={novaSenha} 
                    onChange={(e) => setNovaSenha(e.target.value)} 
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200"
                    required 
                    minLength={6} 
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Confirmar Nova Senha</label>
                  <input 
                    type="password" 
                    placeholder="Repita a nova senha" 
                    value={confirmarSenha} 
                    onChange={(e) => setConfirmarSenha(e.target.value)} 
                    className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-peach-200"
                    required 
                    minLength={6} 
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={salvandoSenha}
                  className="w-full py-4 rounded-2xl bg-[#E97451] hover:bg-[#C06043] text-white font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                >
                  {salvandoSenha ? <Sparkles className="size-5 animate-spin" /> : <><Check size={16} /> Salvar Nova Senha</>}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNavPsicologo />
    </div>
  );
}