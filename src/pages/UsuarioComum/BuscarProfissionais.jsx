import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Search, Star, Calendar, Clock, 
  DollarSign, ShieldCheck, HeartPulse, Check, X, Sparkles 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

//[FUTURO FIREBASE] Importações prontas para buscar profissionais e salvar agendamentos:
// import { db, auth } from "../firebaseConfig";
// import { collection, getDocs, addDoc } from "firebase/firestore";

const profissionaisMock = [
  {
    id: "pro_1",
    nome: "Dra. Juliana Mendes",
    crp: "06/88412",
    especialidade: "Terapia Cognitivo-Comportamental (TCC)",
    bio: "Especialista no tratamento de ansiedade, fobias e desenvolvimento pessoal.",
    nota: 4.9,
    avaliacoesCount: 28,
    fotoURL: null,
    servicos: [
      { id: "s1", titulo: "Sessão Individual Online", duracao: "50 min", preco: 150.00 },
      { id: "s2", titulo: "Consulta de Avaliação Inicial", duracao: "60 min", preco: 180.00 }
    ]
  },
  {
    id: "pro_2",
    nome: "Dr. Carlos Eduardo",
    crp: "06/55123",
    especialidade: "Psicanálise e Gestalt",
    bio: "Acolhimento humanizado para autoconhecimento, luto e questões de relacionamento.",
    nota: 4.8,
    avaliacoesCount: 19,
    fotoURL: null,
    servicos: [
      { id: "s1", titulo: "Psicoterapia Semanal", duracao: "50 min", preco: 130.00 }
    ]
  }
];

export default function BuscarProfissionais() {
  const navigate = useNavigate();
  
  // Estados
  const [profissionais, setProfissionais] = useState(profissionaisMock);
  const [termoBusca, setTermoBusca] = useState("");
  
  // Estados do Modal de Agendamento
  const [profissionalSelecionado, setProfissionalSelecionado] = useState(null);
  const [servicoEscolhido, setServicoEscolhido] = useState(null);
  const [dataAgendamento, setDataAgendamento] = useState("");
  const [horarioAgendamento, setHorarioAgendamento] = useState("");
  const [loadingAgendamento, setLoadingAgendamento] = useState(false);

  /* 
    [FUTURO FIREBASE - BUSCAR PROFISSIONAIS DO BANCO]
    useEffect(() => {
      const carregarProfissionais = async () => {
        try {
          const snapshot = await getDocs(collection(db, "psicologos"));
          const lista = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          if (lista.length > 0) setProfissionais(lista);
        } catch (error) {
          console.error("Erro ao buscar profissionais:", error);
        }
      };
      carregarProfissionais();
    }, []);
  */

  const handleAgendarSessao = async (e) => {
    e.preventDefault();
    if (!servicoEscolhido || !dataAgendamento || !horarioAgendamento) {
      toast.error("Preencha todos os campos do agendamento.");
      return;
    }

    setLoadingAgendamento(true);

    try {
      /* 
        [FUTURO FIREBASE - SALVAR AGENDAMENTO]
        const user = auth.currentUser;
        await addDoc(collection(db, "agendamentos"), {
          pacienteId: user ? user.uid : "anonimo",
          psicologoId: profissionalSelecionado.id,
          psicologoNome: profissionalSelecionado.nome,
          servico: servicoEscolhido.titulo,
          valor: servicoEscolhido.preco,
          data: dataAgendamento,
          horario: horarioAgendamento,
          status: "Confirmado",
          criadoEm: new Date().toISOString()
        });
      */

      // Simulação de sucesso imediata para a apresentação
      toast.success(`Sessão agendada com ${profissionalSelecionado.nome} para ${dataAgendamento} às ${horarioAgendamento}!`);
      setProfissionalSelecionado(null);
      setServicoEscolhido(null);
      setDataAgendamento("");
      setHorarioAgendamento("");

    } catch (error) {
      console.error(error);
      toast.error("Erro ao realizar agendamento.");
    } finally {
      setLoadingAgendamento(false);
    }
  };

  // Filtragem por nome ou especialidade
  const profissionaisFiltrados = profissionais.filter(p => 
    p.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    p.especialidade.toLowerCase().includes(termoBusca.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffbeb_0%,_#f8fafc_40%,_#ffffff_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-28">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* TOPO / VOLTAR */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/Menu")} 
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-amber-500 transition-colors"
          >
            <ArrowLeft size={16} /> Voltar ao Início
          </button>
          
          <div className="flex items-center gap-1.5 bg-white/80 border border-slate-100 px-3 py-1.5 rounded-full shadow-sm backdrop-blur">
            <ShieldCheck size={14} className="text-amber-500" />
            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Rede Verificada</span>
          </div>
        </div>

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] border border-amber-50 shadow-xl shadow-amber-900/5 p-7 md:p-9 text-center relative overflow-hidden"
        >
          <div className="absolute -top-10 -right-10 size-32 rounded-full bg-amber-100/40 blur-3xl pointer-events-none" />
          
          <div className="relative size-16 mx-auto mb-4 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
            <HeartPulse size={28} />
          </div>
          
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Encontre seu Profissional</h1>
          <p className="text-xs text-slate-500 mt-1">Conecte-se com especialistas qualificados e agende sua sessão.</p>

          {/* BARRA DE BUSCA */}
          <div className="relative mt-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar por nome ou abordagem (ex: TCC)..." 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-200 transition-all text-slate-700"
            />
          </div>
        </motion.div>

        {/* LISTA DE PROFISSIONAIS */}
        <div className="space-y-4">
          {profissionaisFiltrados.length === 0 ? (
            <div className="text-center py-10 bg-white border border-dashed border-slate-200 rounded-[2rem]">
              <p className="text-sm font-bold text-slate-500">Nenhum profissional encontrado.</p>
            </div>
          ) : (
            profissionaisFiltrados.map((pro, index) => (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                key={pro.id}
                className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="size-14 rounded-2xl bg-amber-100/60 border border-amber-200 flex items-center justify-center text-amber-700 font-black text-lg shadow-inner">
                      {pro.nome.charAt(3)}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{pro.nome}</h3>
                      <p className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">{pro.crp}</p>
                      <p className="text-[11px] text-slate-400 font-medium mt-0.5">{pro.especialidade}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100 text-xs font-black text-amber-700">
                    <Star size={12} className="fill-amber-400 text-amber-400" />
                    <span>{pro.nota}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium bg-slate-50 p-3 rounded-xl border border-slate-100/50 leading-relaxed">
                  "{pro.bio}"
                </p>

                {/* SERVIÇOS OFERECIDOS */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Serviços Disponíveis</span>
                  
                  {pro.servicos.map((serv) => (
                    <div key={serv.id} className="flex items-center justify-between bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">{serv.titulo}</h4>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Clock size={10} /> {serv.duracao} • <span className="font-bold text-emerald-600">R$ {serv.preco.toFixed(2)}</span>
                        </span>
                      </div>
                      
                      <button 
                        onClick={() => {
                          setProfissionalSelecionado(pro);
                          setServicoEscolhido(serv);
                        }}
                        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm shadow-amber-500/20 transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Calendar size={13} /> Agendar
                      </button>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* MODAL DE AGENDAMENTO */}
        <AnimatePresence>
          {profissionalSelecionado && servicoEscolhido && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 border border-slate-100 relative"
              >
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-black text-slate-900 tracking-tight">Confirmar Agendamento</h3>
                  <button onClick={() => setProfissionalSelecionado(null)} className="text-slate-400 hover:text-slate-600">
                    <X size={18} />
                  </button>
                </div>

                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 space-y-1">
                  <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">Profissional</span>
                  <p className="text-sm font-bold text-slate-800">{profissionalSelecionado.nome}</p>
                  <p className="text-xs text-slate-600 mt-1">📦 {servicoEscolhido.titulo} (<span className="font-bold text-emerald-600">R$ {servicoEscolhido.preco.toFixed(2)}</span>)</p>
                </div>

                <form onSubmit={handleAgendarSessao} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Data da Sessão</label>
                    <input 
                      type="date"
                      value={dataAgendamento}
                      onChange={(e) => setDataAgendamento(e.target.value)}
                      className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 ml-1 uppercase tracking-widest">Horário</label>
                    <input 
                      type="time"
                      value={horarioAgendamento}
                      onChange={(e) => setHorarioAgendamento(e.target.value)}
                      className="w-full mt-1 p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-medium outline-none focus:ring-2 focus:ring-amber-200"
                      required
                    />
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button 
                      type="button" 
                      onClick={() => setProfissionalSelecionado(null)}
                      className="w-1/2 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-colors"
                    >
                      Cancelar
                    </button>
                    <button 
                      type="submit" 
                      disabled={loadingAgendamento}
                      className="w-1/2 py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex justify-center items-center gap-1.5"
                    >
                      {loadingAgendamento ? <Sparkles className="size-4 animate-spin" /> : <Check size={16} />} Confirmar
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}