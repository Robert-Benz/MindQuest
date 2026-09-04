import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, Award, Film, Headphones } from "lucide-react";
import BottomNav from "../../components/BottomNav";
import { toast } from "sonner";

// Mocks estruturados pensando na futura integração com o Firebase (coleção de feed / atividades dos amigos)
const atividadesMockIniciais = [
  {
    id: "1",
    amigoNome: "Ana Carolina",
    avatar: "AC",
    tipo: "badge",
    descricao: "Desbloqueou a conquista de 5 dias seguidos de meditação!",
    icone: Award,
    corIcone: "text-amber-500 bg-amber-50",
    tempo: "Há 2 horas",
    reacoes: 4,
    reagido: false
  },
  {
    id: "2",
    amigoNome: "Lucas Rafael",
    avatar: "LR",
    tipo: "filme",
    descricao: "Assistiu ao comfort movie 'O Fabuloso Destino de Amélie Poulain'.",
    icone: Film,
    corIcone: "text-pink-500 bg-pink-50",
    tempo: "Há 5 horas",
    reacoes: 2,
    reagido: true
  },
  {
    id: "3",
    amigoNome: "Mariana Silva",
    avatar: "MS",
    tipo: "meditacao",
    descricao: "Completou uma sessão de respiração guiada de 10 minutos.",
    icone: Headphones,
    corIcone: "text-blue-500 bg-blue-50",
    tempo: "Ontem",
    reacoes: 6,
    reagido: false
  }
];

export default function MinhaRede() {
  const navigate = useNavigate();
  const [atividades, setAtividades] = useState(atividadesMockIniciais);

  const handleReagir = (id) => {
    setAtividades(prev => prev.map(item => {
      if (item.id === id) {
        const novoReagido = !item.reagido;
        const novasReacoes = novoReagido ? item.reacoes + 1 : item.reacoes - 1;
        toast.success(novoReagido ? "Você enviou um apoio ❤️" : "Reação removida");
        return { ...item, reagido: novoReagido, reacoes: novasReacoes };
      }
      return item;
    }));
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff5f0_0%,_#fffbf9_38%,_#fffaf7_100%)] p-4 md:p-8 text-slate-800 antialiased font-sans pb-32">
      <div className="max-w-xl mx-auto space-y-6">
        
        {/* Topo */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/menu")} className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-orange-500 transition-colors">
            <ArrowLeft size={16} /> Painel Principal
          </button>
          <div className="flex items-center gap-1.5 bg-peach-50 border border-peach-100 px-3 py-1 rounded-full text-peach-600 text-[10px] font-bold">
            <Heart size={12} className="fill-peach-400" /> Rede de Apoio
          </div>
        </div>

        {/* Cabeçalho */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.75rem] border border-white shadow-xl shadow-orange-900/5 p-7 md:p-9 text-center relative overflow-hidden"
        >
          <div className="absolute -top-20 -right-20 size-48 rounded-full bg-peach-100/50 blur-3xl pointer-events-none" />
          <div className="size-14 rounded-2xl bg-peach-50 text-peach-500 flex items-center justify-center mx-auto mb-3 border border-peach-100 shadow-sm">
            <Heart size={26} className="fill-peach-400" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Minha Rede</h1>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
            Como é belo ver a conquista de nossos queridos. Um lembrete constante de que nunca estamos sozinhos em nossa jornada.
          </p>
        </motion.div>

        {/* Feed de Atividades */}
        <div className="space-y-4">
          {atividades.map((item) => {
            const IconComponent = item.icone;
            return (
              <motion.div
                whileHover={{ y: -2 }}
                key={item.id}
                className="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm space-y-4 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-11 rounded-2xl bg-gradient-to-br from-peach-100 to-orange-200 text-orange-700 font-black flex items-center justify-center text-sm shadow-inner">
                      {item.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-800">{item.amigoNome}</h3>
                      <span className="text-[10px] text-slate-400">{item.tempo}</span>
                    </div>
                  </div>

                  <div className={`size-9 rounded-xl flex items-center justify-center ${item.corIcone}`}>
                    <IconComponent size={18} />
                  </div>
                </div>

                <p className="text-xs font-medium text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100/80">
                  {item.descricao}
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleReagir(item.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      item.reagido 
                        ? "bg-red-50 text-red-500 border border-red-100 scale-105" 
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                    }`}
                  >
                    <Heart size={16} className={item.reagido ? "fill-red-500" : ""} />
                    <span>{item.reacoes} {item.reacoes === 1 ? "Apoio" : "Apoios"}</span>
                  </button>

                  <span className="text-[10px] text-slate-400 font-medium italic">Feed exclusivo de leitura</span>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
      <BottomNav />
    </div>
  );
}