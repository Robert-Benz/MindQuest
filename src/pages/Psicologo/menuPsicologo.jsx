import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Sparkles, Users, Activity, ShieldCheck, Trash2, 
  Clock, Search, UserPlus, X, Check, ChevronRight
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { auth, db } from "../../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { 
  collection, getDocs, doc, getDoc, setDoc, 
  query, where 
} from "firebase/firestore";
import { toast } from "sonner";
import logoReduzido from "../../assets/LogoPessegoReduzido.png";
import BottomNavPsicologo from "../../components/BottomNavPsicologo";

export default function MenuPsicologo() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [psicologoDados, setPsicologoDados] = useState({ nome: "", crp: "" });

  const [pacientes, setPacientes] = useState([]);
  const [termoBusca, setTermoBusca] = useState("");
  const [mostrarModalAdicionar, setMostrarModalAdicionar] = useState(false);
  const [codigoPacienteInput, setCodigoPacienteInput] = useState("");
  const [vinculando, setVinculando] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login-psicologo");
        return;
      }

      try {
        const psiRef = doc(db, "psicologos", user.uid);
        const psiSnap = await getDoc(psiRef);
        if (psiSnap.exists()) {
          setPsicologoDados(psiSnap.data());
        }

        const qPacientes = query(
          collection(db, "usuarios"), 
          where("terapeuta.uid", "==", user.uid)
        );
        
        const snapPacientes = await getDocs(qPacientes);
        const lista = snapPacientes.docs.map((d) => ({
          id: d.id,
          ...d.data()
        }));
        setPacientes(lista);
      } catch (err) {
        console.error("Erro ao carregar dados do painel:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, [navigate]);

  const handleVincularPaciente = async (e) => {
    e.preventDefault();
    const codigoLimpo = codigoPacienteInput.trim().toUpperCase();
    if (!codigoLimpo) return;

    setVinculando(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      let q = query(collection(db, "usuarios"), where("codigoUnico", "==", codigoLimpo));
      let snap = await getDocs(q);

      if (snap.empty) {
        q = query(collection(db, "usuarios"), where("codigoPaciente", "==", codigoLimpo));
        snap = await getDocs(q);
      }

      if (snap.empty) {
        toast.error("Nenhum paciente encontrado com este código.");
        return;
      }

      const pacienteDoc = snap.docs[0];
      const pacienteId = pacienteDoc.id;
      const dadosPaciente = pacienteDoc.data();

      const dadosTerapeuta = {
        uid: user.uid,
        nome: psicologoDados.nome || "Dr(a). Especialista",
        crp: psicologoDados.crp || "CRP 06/12345",
        vinculadoEm: new Date().toISOString()
      };

      await setDoc(doc(db, "usuarios", pacienteId), {
        terapeuta: dadosTerapeuta
      }, { merge: true });

      const novoPacienteItem = {
        id: pacienteId,
        ...dadosPaciente,
        terapeuta: dadosTerapeuta
      };

      setPacientes((prev) => [novoPacienteItem, ...prev.filter((p) => p.id !== pacienteId)]);
      toast.success(`Paciente ${dadosPaciente.nome || ""} vinculado com sucesso!`);
      setCodigoPacienteInput("");
      setMostrarModalAdicionar(false);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao vincular paciente.");
    } finally {
      setVinculando(false);
    }
  };

  const handleDesvincular = async (pacienteId, nome) => {
    if (!window.confirm(`Deseja remover o vínculo clínico com ${nome}?`)) return;

    try {
      await setDoc(doc(db, "usuarios", pacienteId), { terapeuta: null }, { merge: true });
      setPacientes((prev) => prev.filter((p) => p.id !== pacienteId));
      toast.success("Paciente desvinculado com sucesso.");
    } catch (err) {
      toast.error("Erro ao desvincular paciente.");
    }
  };

  const pacientesFiltrados = pacientes.filter((p) => {
    const nome = (p.nome || "").toLowerCase();
    const cod = (p.codigoUnico || p.codigoPaciente || "").toLowerCase();
    const termo = termoBusca.toLowerCase();
    return nome.includes(termo) || cod.includes(termo);
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF9] flex items-center justify-center">
        <Sparkles className="text-[#E97451] size-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32 relative overflow-hidden">
      <div className="max-w-xl mx-auto space-y-6 relative z-10">
        
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white p-1 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center size-9">
              <img src={logoReduzido} alt="Logo" className="size-full object-contain" />
            </div>
            <span className="text-xs font-black tracking-wider text-slate-800 uppercase">MindQuest</span>
          </div>

          <div className="flex items-center gap-1.5 bg-white/85 border border-peach-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-emerald-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Painel Clínico</span>
          </div>
        </div>

        {/* Card do Terapeuta */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-white rounded-[2.75rem] border border-peach-50 shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center"
        >
          <div className="relative size-20 mx-auto mb-4 rounded-[1.75rem] bg-gradient-to-br from-orange-400 to-[#E97451] flex items-center justify-center shadow-lg shadow-orange-500/20 text-white overflow-hidden border-2 border-white">
            <img src={logoReduzido} alt="Logo" className="w-10 h-10 object-contain filter brightness-0 invert" />
          </div>

          <p className="text-[10px] font-bold text-[#E97451] uppercase tracking-[0.2em] mb-1">Psicologia Clínica</p>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{psicologoDados.nome || "Área do Profissional"}</h1>
          <p className="text-xs text-slate-500 mt-1">
            {psicologoDados.crp ? `Registo: ${psicologoDados.crp}` : "Faça a gestão dos seus pacientes e acompanhe a evolução clínica."}
          </p>
        </motion.div>

        {/* Aviso LGPD */}
        <div className="bg-orange-50/60 border border-orange-100/80 p-4 rounded-2xl flex items-start gap-3">
          <ShieldCheck className="text-[#E97451] shrink-0 mt-0.5" size={18} />
          <div>
            <span className="block text-xs font-bold text-slate-800">Dados Protegidos por LGPD</span>
            <span className="text-[10px] text-slate-500 leading-tight block mt-0.5">
              Apenas são apresentados relatórios e registos de pacientes que autorizaram ativamente a partilha.
            </span>
          </div>
        </div>

        {/* Barra de Pesquisa e Botão Vincular */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Pesquisar por nome ou código (ex: MQ-992)..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-100 rounded-2xl shadow-sm outline-none text-sm focus:ring-2 focus:ring-orange-200 transition-all font-medium text-slate-700" 
            />
          </div>

          <button 
            type="button"
            onClick={() => setMostrarModalAdicionar(!mostrarModalAdicionar)}
            className="px-5 py-3.5 bg-[#E97451] hover:bg-[#C06043] text-white rounded-2xl shadow-md shadow-orange-500/20 font-bold text-xs flex items-center gap-1.5 transition-all shrink-0 active:scale-95 cursor-pointer"
          >
            <UserPlus size={16} /> Vincular
          </button>
        </div>

        {/* Modal de Vínculo */}
        <AnimatePresence>
          {mostrarModalAdicionar && (
            <motion.form 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleVincularPaciente}
              className="bg-white p-6 rounded-[2rem] border border-orange-100 shadow-lg shadow-orange-900/5 space-y-3 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider">Vincular Paciente por Código</h3>
                <button type="button" onClick={() => setMostrarModalAdicionar(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
                  <X size={16} />
                </button>
              </div>
              <p className="text-[11px] text-slate-500">
                Insira o código de identificação fornecido pelo paciente na aba Terapeuta do perfil dele.
              </p>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ex: MQ-8K7F2"
                  value={codigoPacienteInput}
                  onChange={(e) => setCodigoPacienteInput(e.target.value)}
                  className="flex-1 p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold uppercase outline-none focus:ring-2 focus:ring-orange-200"
                  required
                />
                <button 
                  type="submit" 
                  disabled={vinculando}
                  className="px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  {vinculando ? <Sparkles className="size-4 animate-spin" /> : <><Check size={16} /> Adicionar</>}
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* Lista de Pacientes */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pacientes em Acompanhamento</span>
            <span className="text-[10px] font-bold text-[#E97451] bg-orange-50 px-2 py-0.5 rounded-full">{pacientesFiltrados.length}</span>
          </div>

          {pacientesFiltrados.length === 0 ? (
            <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <Users className="mx-auto size-9 text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-500">Nenhum paciente vinculado no momento.</p>
              <p className="text-xs text-slate-400 mt-0.5">Utilize o botão Vincular acima para registar o código do paciente.</p>
            </div>
          ) : (
            pacientesFiltrados.map((p) => {
              const codigo = p.codigoUnico || p.codigoPaciente || "MQ-PAC";
              return (
                <div key={p.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-md transition-all space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="size-12 rounded-[1rem] bg-orange-50 border border-orange-100 flex items-center justify-center text-xl shadow-inner font-bold text-[#E97451]">
                        {p.nome ? p.nome.charAt(0).toUpperCase() : "P"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-bold text-slate-800">{p.nome || "Paciente"}</h3>
                          <span className="text-[9px] font-black bg-orange-50 text-orange-600 px-2 py-0.5 rounded-md border border-orange-100 font-mono">
                            {codigo}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> Registado no sistema
                        </p>
                      </div>
                    </div>

                    <button 
                      type="button"
                      onClick={() => handleDesvincular(p.id, p.nome)}
                      className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Desvincular Paciente"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  <button 
                    type="button"
                    onClick={() => navigate("/HistoricoPaciente", { state: { pacienteUid: p.id } })} 
                    className="w-full py-3 px-4 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-slate-700 hover:text-orange-600 text-xs font-bold transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center gap-2">
                      <Activity size={15} className="text-[#E97451]" />
                      <span>Ver Histórico e Análises Clínicas</span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-orange-600 transition-transform group-hover:translate-x-0.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

      </div>

      <BottomNavPsicologo />
    </div>
  );
}