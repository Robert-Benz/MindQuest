import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Mic, MicOff, Video as VideoIcon, VideoOff, 
  PhoneOff, Send, ShieldCheck, MessageSquare, 
  Settings, UserSquare2
} from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

export default function SalaSessao() {
  const navigate = useNavigate();
  
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCamOn, setIsCamOn] = useState(true);

  const [mensagemInput, setMensagemInput] = useState("");
  const [mensagens, setMensagens] = useState([
    { id: 1, sender: "psicologo", text: "Olá! Tudo bem? Como tem sido a sua semana?", time: "14:30" },
    { id: 2, sender: "paciente", text: "Oi Dra., tudo bem. Tenho me sentido um pouco ansiosa nos últimos dias.", time: "14:31" }
  ]);

  // Ativação da câmera e microfone reais via API do navegador
  useEffect(() => {
    const iniciarMidia = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        });
        
        setStream(mediaStream);
        
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
        
        toast.success("Câmera e microfone conectados com sucesso!", { icon: <ShieldCheck /> });
      } catch (error) {
        console.error("Erro ao acessar câmera/microfone:", error);
        toast.error("Permissão de câmera ou microfone negada.");
      }
    };

    iniciarMidia();

    // Desliga a câmera e o microfone ao sair do componente
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Funções de controle de mídia
  const toggleMic = () => {
    if (stream) {
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMicOn(audioTrack.enabled);
      }
    }
  };

  const toggleCam = () => {
    if (stream) {
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsCamOn(videoTrack.enabled);
      }
    }
  };

  const encerrarSessao = () => {
    if (window.confirm("Deseja realmente encerrar esta sessão?")) {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      navigate("/calendario"); 
    }
  };

  // Função de envio de mensagens no chat
  const enviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagemInput.trim()) return;

    const novaMsg = {
      id: Date.now(),
      sender: "paciente",
      text: mensagemInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMensagens([...mensagens, novaMsg]);
    setMensagemInput("");
  };

  return (
    <div className="h-screen w-full bg-slate-900 flex flex-col md:flex-row overflow-hidden font-sans antialiased">
      
      {/* Área de vídeo */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header da chamada com status de segurança */}
        <div className="absolute top-0 left-0 right-0 z-20 p-6 flex justify-between items-center bg-gradient-to-b from-slate-900/80 to-transparent pointer-events-none">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 text-red-500 px-3 py-1 rounded-full border border-red-500/30 flex items-center gap-2 backdrop-blur-md">
              <div className="size-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sessão Ao Vivo</span>
            </div>
            <div className="bg-white/10 text-white/80 px-3 py-1 rounded-full border border-white/10 flex items-center gap-1.5 backdrop-blur-md">
              <ShieldCheck size={14} />
              <span className="text-[10px] font-bold uppercase tracking-widest">Criptografado</span>
            </div>
          </div>
        </div>

        {/* Grid de vídeos em tela dividida */}
        <div className="flex-1 p-4 pt-20 pb-28 grid grid-rows-2 md:grid-rows-1 md:grid-cols-2 gap-4">
          
          {/* Câmera do psicólogo (Mock animado) */}
          <div className="bg-slate-800 rounded-3xl overflow-hidden relative border border-slate-700 shadow-xl flex items-center justify-center group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/40 to-slate-900/80" />
            
            <div className="relative z-10 flex flex-col items-center">
              <div className="size-28 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center mb-4 relative">
                <div className="absolute inset-0 rounded-full border border-blue-400 animate-ping opacity-20" />
                <UserSquare2 size={50} className="text-blue-400" />
              </div>
              <h2 className="text-white font-bold text-lg">Dra. Juliana Mendes</h2>
              <p className="text-blue-400 text-xs font-medium">Psicóloga</p>
            </div>

            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-medium">
              Dra. Juliana Mendes
            </div>
          </div>

          {/* Câmera do paciente (Real) */}
          <div className="bg-slate-800 rounded-3xl overflow-hidden relative border border-slate-700 shadow-xl flex items-center justify-center">
            {isCamOn ? (
              <video 
                ref={videoRef}
                autoPlay 
                playsInline 
                muted
                className="w-full h-full object-cover mirror"
                style={{ transform: "scaleX(-1)" }}
              />
            ) : (
              <div className="flex flex-col items-center text-slate-500">
                <VideoOff size={48} className="mb-3 opacity-50" />
                <p className="text-sm font-medium">Sua câmera está desativada</p>
              </div>
            )}

            <div className="absolute bottom-4 left-4 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-white text-xs font-medium flex items-center gap-2">
              Você {isMicOn ? <Mic size={12} className="text-emerald-400" /> : <MicOff size={12} className="text-red-400" />}
            </div>
          </div>

        </div>

        {/* Controles de mídia na base do vídeo */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-slate-800/80 backdrop-blur-xl p-3 rounded-3xl border border-slate-700 shadow-2xl z-30">
          <button 
            onClick={toggleMic}
            className={`p-4 rounded-2xl transition-all ${isMicOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'}`}
          >
            {isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
          </button>

          <button 
            onClick={toggleCam}
            className={`p-4 rounded-2xl transition-all ${isCamOn ? 'bg-slate-700 hover:bg-slate-600 text-white' : 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'}`}
          >
            {isCamOn ? <VideoIcon size={22} /> : <VideoOff size={22} />}
          </button>

          <button className="p-4 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white transition-all hidden sm:block">
            <Settings size={22} />
          </button>

          <div className="w-px h-8 bg-slate-600 mx-2" />

          <button 
            onClick={encerrarSessao}
            className="px-6 py-4 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold transition-all shadow-lg shadow-red-600/30 flex items-center gap-2"
          >
            <PhoneOff size={22} /> <span className="hidden sm:inline">Encerrar</span>
          </button>
        </div>

      </div>

      {/* Área de chat */}
      <div className="w-full md:w-96 bg-white flex flex-col shadow-2xl border-l border-slate-200 z-40 h-[40vh] md:h-screen">
        
        <div className="p-5 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-blue-50 p-2 rounded-xl text-blue-500">
            <MessageSquare size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Chat da Sessão</h3>
            <p className="text-[10px] text-slate-400 font-medium">As mensagens sumirão após a sessão.</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar bg-slate-50">
          {mensagens.map((msg) => (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              key={msg.id} 
              className={`flex flex-col ${msg.sender === "paciente" ? "items-end" : "items-start"}`}
            >
              <div 
                className={`p-3 rounded-2xl max-w-[85%] text-sm ${
                  msg.sender === "paciente" 
                  ? "bg-blue-500 text-white rounded-br-sm" 
                  : "bg-white border border-slate-200 text-slate-700 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
              <span className="text-[9px] text-slate-400 mt-1 font-medium px-1">
                {msg.sender === "paciente" ? "Você" : "Dra. Juliana"} • {msg.time}
              </span>
            </motion.div>
          ))}
        </div>

        <form onSubmit={enviarMensagem} className="p-4 bg-white border-t border-slate-100 flex gap-2">
          <input 
            type="text" 
            placeholder="Digite sua mensagem..." 
            value={mensagemInput}
            onChange={(e) => setMensagemInput(e.target.value)}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition-all text-slate-700"
          />
          <button 
            type="submit"
            className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-xl shadow-sm transition-all active:scale-95"
          >
            <Send size={18} />
          </button>
        </form>
      </div>

    </div>
  );
}