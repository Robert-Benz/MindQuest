import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Sparkles, Users, BriefcaseMedical, 
  UserSquare2, Activity, ShieldCheck, Plus, Trash2, 
  Clock, DollarSign, Edit3, HeartPulse, Search,
  Camera, Star, UserPlus, X, Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { collection, getDocs, deleteDoc, doc, getDoc, setDoc, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { toast } from "sonner";

export default function PerfilPsicologo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState("pacientes"); // Inicia em pacientes para você testar logo de cara!
  const [userUid, setUserUid] = useState(null);

  // Estados dos Serviços e Perfil
  const [servicos, setServicos] = useState([]);
  const [perfilPro, setPerfilPro] = useState({ nome: "", crp: "", especialidade: "", bio: "" });
  const [fotoURL, setFotoURL] = useState(null);
  const [arquivoFoto, setArquivoFoto] = useState(null);

  // =========================================================
  // ESTADOS DA GESTÃO DE PACIENTES
  // =========================================================
  const [pacientes, setPacientes] = useState([
    { id: "1", nome: "Ana Carolina M.", codigo: "PAC-992", ultimoHumor: "😔", nivel: 2, status: "Atenção", aviso: "Humor baixo há 3 dias consecutivos.", cor: "bg-red-50 text-red-600 border-red-100", data: "Hoje, 09:30" },
    { id: "2", nome: "Lucas Rafael", codigo: "PAC-451", ultimoHumor: "😊", nivel: 8, status: "Estável", aviso: "Check-in realizado com sucesso.", cor: "bg-emerald-50 text-emerald-600 border-emerald-100", data: "Ontem, 20:15" },
  ]);
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);
  const [codigoPacienteInput, setCodigoPacienteInput] = useState("");

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

  const carregarDados = async (uid) => {
    try {
      // 1. Carrega Perfil do Psicólogo
      const docRef = doc(db, "psicologos", uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const dados = docSnap.data();
        setPerfilPro(dados);
        if (dados.fotoURL) setFotoURL(dados.fotoURL);
      }

      // 2. Carrega a lista de Serviços
      const servicosRef = collection(db, "psicologos", uid, "servicos");
      const servicosSnap = await getDocs(servicosRef);
      setServicos(servicosSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      /* 
       
        [FUTURO FIREBASE - CARREGAR PACIENTES]
        const pacientesRef = collection(db, "psicologos", uid, "pacientesVinculados");
        const pacientesSnap = await getDocs(pacientesRef);
        if (!pacientesSnap.empty) {
          setPacientes(pacientesSnap.docs.map(d => ({ id: d.id, ...d.data() })));
        }
 
      */

    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // FUNÇÕES DE GERENCIAMENTO DE PACIENTES
  // =========================================================
  const handleAdicionarPaciente = async (e) => {
    e.preventDefault();
    if (!codigoPacienteInput.trim()) {
      toast.error("Digite o código do paciente.");
      return;
    }

    try {
      /* 
       
        [FUTURO FIREBASE - VINCULAR PACIENTE POR CÓDIGO]
        Aqui você buscaria na coleção global de usuários ("usuarios") 
        alguém cujo campo `codigoUnico` seja igual a `codigoPacienteInput`.
        Depois, salvaria na subcoleção do psicólogo.
        
      */

      // Simulação para o TCC (Cria um paciente mockado novo na tela)
      const novoPacienteSimulado = {
        id: Date.now().toString(),
        nome: `Paciente (${codigoPacienteInput.toUpperCase()})`,
        codigo: codigoPacienteInput.toUpperCase(),
        ultimoHumor: "😊",
        nivel: 7,
        status: "Estável",
        aviso: "Paciente vinculado recentemente.",
        cor: "bg-emerald-50 text-emerald-600 border-emerald-100",
        data: "Agora mesmo"
      };

      setPacientes([novoPacienteSimulado, ...pacientes]);
      toast.success("Paciente vinculado com sucesso!");
      setCodigoPacienteInput("");
      setMostrarModalAdicionar(false);

    } catch (error) {
      console.error(error);
      toast.error("Erro ao vincular paciente.");
    }
  };

  const removerPaciente = async (id, nome) => {
    if (!window.confirm(`Deseja realmente desvincular ${nome} do seu acompanhamento?`)) return;

    try {
      /* 
        
        [FUTURO FIREBASE - EXCLUIR/DESVINCULAR PACIENTE]
        await deleteDoc(doc(db, "psicologos", userUid, "pacientesVinculados", id));
      
      */

      setPacientes(pacientes.filter(p => p.id !== id));
      toast.success("Paciente desvinculado.");
    } catch (error) {
      toast.error("Erro ao remover paciente.");
    }
  };

  // Filtragem da busca por Nome ou Código
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
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <Sparkles className="text-blue-400 size-8 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#f0f9ff_0%,_#f8fafc_38%,_#ffffff_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-blue-500 transition-colors">
            <ArrowLeft size={16} /> Voltar ao Início
          </button>
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-blue-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Acesso Restrito</span>
          </div>
        </div>

        {/* HEADER DO PROFISSIONAL */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-white shadow-xl shadow-blue-900/5 p-7 md:p-9 text-center"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-blue-100/50 blur-3xl pointer-events-none" />
          
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20 text-white overflow-hidden border-2 border-white">
            {fotoURL ? (
              <img src={fotoURL} alt="Profissional" className="w-full h-full object-cover" />
            ) : (
              <HeartPulse size={36} className="fill-white/20" />
            )}
          </div>

          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-[0.2em] mb-1">MindQuest Pro</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{perfilPro.nome || "Área do Profissional"}</h1>
          <p className="text-xs text-slate-500 mt-1">Gerencie seus pacientes e consultas com segurança.</p>

          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <button onClick={() => setAbaAtiva("pacientes")} className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${abaAtiva === "pacientes" ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
              <Users size={14} /> Pacientes
            </button>
            <button onClick={() => setAbaAtiva("servicos")} className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${abaAtiva === "servicos" ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
              <BriefcaseMedical size={14} /> Serviços
            </button>
            <button onClick={() => setAbaAtiva("perfil")} className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${abaAtiva === "perfil" ? "bg-slate-900 text-white shadow-md" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}>
              <UserSquare2 size={14} /> Perfil
            </button>
            <button onClick={() => navigate("/AvaliacoesPsicologo")} className="px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all bg-slate-50 text-slate-500 hover:bg-amber-50 hover:text-amber-600 border border-transparent hover:border-amber-100">
              <Star size={14} className="text-amber-500" /> Avaliações
            </button>
          </div>
        </motion.div>

        {/* =========================================
            ABA: PACIENTES (COM BUSCA, ADICIONAR E EXCLUIR)
        ========================================= */}
        {abaAtiva === "pacientes" && (
           <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
               <ShieldCheck className="text-blue-500 shrink-0 mt-0.5" size={18} />
               <div>
                 <span className="block text-xs font-bold text-blue-800">Dados Protegidos por LGPD</span>
                 <span className="text-[10px] text-blue-600/80 leading-tight block mt-0.5">Você só visualiza pacientes que consentiram ativamente o compartilhamento dos registros.</span>
               </div>
             </div>

             {/* BARRA DE AÇÕES: BUSCA E BOTÃO ADICIONAR */}
             <div className="flex gap-2">
               <div className="relative flex-1">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                 <input 
                   type="text" 
                   placeholder="Buscar por nome ou código (ex: PAC-992)..." 
                   value={termoBusca}
                   onChange={(e) => setTermoBusca(e.target.value)}
                   className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm focus:ring-2 focus:ring-blue-100 transition-all font-medium text-slate-700" 
                 />
               </div>

               <button 
                 onClick={() => setMostrarModalAdicionar(!mostrarModalAdicionar)}
                 className="px-4 py-3.5 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl shadow-md shadow-blue-500/20 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95"
               >
                 <UserPlus size={16} /> Vincular
               </button>
             </div>

             {/* FORMULÁRIO / MODAL INLINE PARA ADICIONAR PACIENTE POR CÓDIGO */}
             <AnimatePresence>
               {mostrarModalAdicionar && (
                 <motion.form 
                   initial={{ opacity: 0, height: 0 }}
                   animate={{ opacity: 1, height: "auto" }}
                   exit={{ opacity: 0, height: 0 }}
                   onSubmit={handleAdicionarPaciente}
                   className="bg-white p-6 rounded-[2rem] border border-blue-100 shadow-lg shadow-blue-900/5 space-y-3 overflow-hidden"
                 >
                   <div className="flex justify-between items-center">
                     <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Vincular Novo Paciente</h3>
                     <button type="button" onClick={() => setMostrarModalAdicionar(false)} className="text-slate-400 hover:text-slate-600">
                       <X size={16} />
                     </button>
                   </div>
                   
                   <p className="text-[11px] text-slate-500">Insira o código de acesso exclusivo fornecido pelo paciente para começar o acompanhamento.</p>

                   <div className="flex gap-2">
                     <input 
                       type="text"
                       placeholder="Ex: PAC-789"
                       value={codigoPacienteInput}
                       onChange={(e) => setCodigoPacienteInput(e.target.value)}
                       className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-blue-200"
                       required
                     />
                     <button type="submit" className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1">
                       <Check size={16} /> Adicionar
                     </button>
                   </div>
                 </motion.form>
               )}
             </AnimatePresence>

             {/* LISTA DE PACIENTES */}
             <div className="space-y-3">
               {pacientesFiltrados.length === 0 ? (
                 <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-[2rem]">
                   <Users className="mx-auto size-8 text-slate-300 mb-2" />
                   <p className="text-sm font-bold text-slate-500">Nenhum paciente encontrado.</p>
                   <p className="text-[11px] text-slate-400 mt-1">Tente buscar por outro termo ou vincule pelo código.</p>
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
                              <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">{paciente.codigo}</span>
                            </div>
                            <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <Clock size={10} /> Check-in: {paciente.data}
                            </p>
                          </div>
                        </div>

                        {/* BOTÃO EXCLUIR / DESVINCULAR */}
                        <button 
                          onClick={() => removerPaciente(paciente.id, paciente.nome)}
                          className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                          title="Desvincular Paciente"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex gap-2 items-start">
                        <Activity size={14} className="text-slate-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] font-medium text-slate-600">{paciente.aviso}</p>
                      </div>

                      <button 
                        onClick={() => navigate("/HistoricoPaciente")} 
                        className="w-full mt-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 hover:text-blue-500 transition-colors flex items-center justify-center gap-1.5"
                      >
                        Ver Histórico Completo
                      </button>
                    </div>
                  ))
               )}
             </div>
           </motion.div>
        )}

        {/* ABA: SERVIÇOS */}
        {abaAtiva === "servicos" && (
          <motion.div initial={{ opacity: 0, x: 0 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.18em]">Seu Catálogo</span>
              <button onClick={() => navigate("/CadastroDeServico")} className="flex items-center gap-1.5 text-xs font-bold text-white bg-blue-500 px-4 py-2 rounded-xl shadow-md shadow-blue-500/20 hover:bg-blue-600 transition-all active:scale-95">
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

        {/* ABA: PERFIL */}
        {abaAtiva === "perfil" && (
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="bg-white p-6 md:p-8 rounded-[2.5rem] shadow-sm border border-slate-50 space-y-6">
            <form onSubmit={salvarPerfil} className="space-y-5">
              <div className="flex flex-col items-center mb-6">
                <input type="file" id="fotoInput" accept="image/*" className="hidden" onChange={handleFotoChange} />
                <div className="size-24 rounded-[2rem] bg-slate-100 flex items-center justify-center text-slate-400 cursor-pointer overflow-hidden border-4 border-white shadow-sm" onClick={() => document.getElementById('fotoInput').click()}>
                  {fotoURL ? <img src={fotoURL} alt="Perfil" className="w-full h-full object-cover" /> : <Camera size={32} />}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Nome Completo</label>
                <input type="text" value={perfilPro.nome} onChange={e => setPerfilPro({...perfilPro, nome: e.target.value})} className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-blue-100" />
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

              <button type="submit" className="w-full py-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg transition-all">
                Salvar Perfil Público
              </button>
            </form>
          </motion.div>
        )}

      </div>
    </div>
  );
}