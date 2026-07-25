import { useState } from "react";
import {
  Sparkles,
  Settings,
  Activity,
  Clock,
  Heart,
  CalendarDays,
  Users,
  MessageCircle
} from "lucide-react";

import { motion } from "framer-motion";

import logoReduzido from "../assets/LogoPessegoReduzido.png";

const LogoPrincipal = () => (
  <div className="bg-white p-0.2 rounded-xl border border-slate-100 shadow-sm flex items-center justify-center w-12 h-12">
    <img
      src={logoReduzido}
      alt="MindQuest Logo"
      className="w-full h-full object-contain"
    />
  </div>
);

export default function HomePsicologoAprovado() {

  const [isModalOpen, setIsModalOpen] = useState(false); // já aprovado → sem popup inicial

  return (
    <div className="min-h-screen bg-[#FFFBF9] flex flex-col text-slate-800 font-sans">

      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-[#FFFBF9]/80 backdrop-blur-md px-6 py-4 flex justify-between items-center border-b border-slate-100">

        <div className="flex items-center gap-3">
          <LogoPrincipal />
          <div>
            <p className="text-[10px] uppercase tracking-widest text-[#E97451] font-bold">
              Psicólogo
            </p>
          </div>
        </div>

        <button className="bg-white p-2.5 rounded-2xl shadow-sm border border-slate-100 text-slate-400">
          <Settings size={20} />
        </button>

      </header>

      {/* DASHBOARD */}
      <main className="pt-24 px-6 pb-10 space-y-8">

        {/* BEM-VINDO */}
        <div>
          <p className="text-[#E97451] font-bold text-[10px] uppercase tracking-widest">
            Painel profissional
          </p>

          <h1 className="text-3xl font-extrabold text-slate-900">
            Bem-vindo de volta 👨‍⚕️
          </h1>
        </div>

        {/* STATUS OK */}
        <section className="bg-green-50 border border-green-100 p-5 rounded-3xl flex items-center gap-3">
          <Sparkles className="text-green-600" size={20} />
          <p className="text-sm text-green-700 font-medium">
            Sua conta está aprovada e ativa.
          </p>
        </section>

        {/* CARDS PRINCIPAIS */}
        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col gap-3">
            <Users className="text-[#E97451]" />
            <p className="text-sm font-bold text-slate-700">Pacientes</p>
            <p className="text-3xl font-black">12</p>
          </div>

          <div className="bg-white p-5 rounded-3xl border shadow-sm flex flex-col gap-3">
            <CalendarDays className="text-[#E97451]" />
            <p className="text-sm font-bold text-slate-700">Consultas</p>
            <p className="text-3xl font-black">5</p>
          </div>

        </div>

        {/* AÇÕES */}
        <section className="space-y-3">

          <button className="w-full bg-[#E97451] text-white p-4 rounded-2xl font-bold flex items-center justify-center gap-2">
            <MessageCircle size={18} />
            Ver Pacientes
          </button>

    

        </section>

        {/* ATIVIDADE */}
        <section className="bg-white p-6 rounded-3xl border space-y-4">

          <h3 className="font-bold flex items-center gap-2">
            <Activity size={16} />
            Atividade recente
          </h3>

          <div className="text-sm text-slate-400">
            Nenhuma atividade recente registrada
          </div>

        </section>

      </main>
    </div>
  );
}