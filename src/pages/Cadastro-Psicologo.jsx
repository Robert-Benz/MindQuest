import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  BadgeCheck,
  Upload,
  Stethoscope,
  MailCheck
} from "lucide-react";

import { useState } from "react";

import { auth, db } from "../firebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function CompletarPsicologo() {

  const navigate = useNavigate();

  const [crp, setCrp] = useState("");
  const [uf, setUf] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [arquivo, setArquivo] = useState(null);

  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const [modalSucesso, setModalSucesso] = useState(false);

  const handleEnviar = async () => {

    setErro("");

    if (!crp || !uf || !especialidade) {
      setErro("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      const user = auth.currentUser;

      await updateDoc(doc(db, "usuarios", user.uid), {
        tipoPerfil: "psicologo",
        crp,
        uf,
        especialidade,
        statusValidacao: "em_analise"
      });

      // simula envio
      setTimeout(() => {
        setModalSucesso(true);
        setLoading(false);
      }, 1200);

    } catch (error) {
      console.error(error);
      setErro("Erro ao enviar dados");
      setLoading(false);
    }
  };

  const handleVoltarInicio = () => {
    navigate("/"); // ajuste para sua rota principal
  };

  return (

    <div className="
      min-h-screen
      bg-gradient-to-br
      from-[#F5DACA]
      via-[#FFF4EF]
      to-[#ECC3A9]
      flex
      items-center
      justify-center
      p-6
    ">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          w-full
          max-w-2xl
          bg-white/80
          backdrop-blur-md
          rounded-[2.5rem]
          p-8
          shadow-2xl
          relative
        "
      >

        {/* voltar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 text-[#9A6A58]"
        >
          <ArrowLeft />
        </button>

        {/* header */}
        <div className="text-center mb-8">

          <div className="
            w-20 h-20
            mx-auto mb-4
            bg-[#F5DACA]
            rounded-full
            flex items-center justify-center
          ">
            <Stethoscope className="text-[#FF9B7D]" size={32} />
          </div>

          <h1 className="text-3xl font-bold text-[#7A4E3A]">
            Validação Profissional
          </h1>

          <p className="text-[#9A6A58] mt-2">
            Complete seus dados para análise
          </p>

        </div>

        {/* formulário */}
        <div className="space-y-4">

          <input
            placeholder="CRP (ex: 06/123456)"
            value={crp}
            onChange={(e) => setCrp(e.target.value)}
            className="w-full p-4 rounded-2xl bg-[#FFF7F4] border border-[#F5DACA]"
          />

          <select
            value={uf}
            onChange={(e) => setUf(e.target.value)}
            className="w-full p-4 rounded-2xl bg-[#FFF7F4] border border-[#F5DACA]"
          >
            <option value="">Selecione o estado</option>
            <option value="SP">SP</option>
            <option value="RJ">RJ</option>
            <option value="MG">MG</option>
            <option value="PR">PR</option>
            <option value="RS">RS</option>
          </select>

          <input
            placeholder="Especialidade"
            value={especialidade}
            onChange={(e) => setEspecialidade(e.target.value)}
            className="w-full p-4 rounded-2xl bg-[#FFF7F4] border border-[#F5DACA]"
          />

          {/* upload simples */}
          <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed rounded-2xl cursor-pointer">
            <Upload />
            <span>
              {arquivo ? arquivo.name : "Enviar documento"}
            </span>
            <input
              type="file"
              hidden
              onChange={(e) => setArquivo(e.target.files[0])}
            />
          </label>

          {erro && (
            <p className="text-red-500 text-sm text-center">
              {erro}
            </p>
          )}

          <button
            onClick={handleEnviar}
            disabled={loading}
            className="
              w-full
              py-4
              rounded-2xl
              bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D]
              text-white font-bold
            "
          >
            {loading ? "Enviando..." : "Enviar para análise"}
          </button>

        </div>

        {/* INFO */}
        <div className="mt-6 text-sm text-[#9A6A58]">
          Após análise, você será notificado por email.
        </div>

      </motion.div>

      {/* POPUP SUCESSO */}
      {modalSucesso && (

        <div className="
          fixed inset-0
          bg-black/40
          flex items-center justify-center
          p-6
          z-50
        ">

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="
              bg-white
              rounded-3xl
              p-8
              max-w-md
              w-full
              text-center
              shadow-2xl
            "
          >

            <div className="w-16 h-16 bg-[#F5DACA] rounded-full flex items-center justify-center mx-auto mb-4">
              <MailCheck className="text-[#FF9B7D]" size={32} />
            </div>

            <h2 className="text-2xl font-bold text-[#7A4E3A]">
              Enviado para análise
            </h2>

            <p className="text-[#9A6A58] mt-3 mb-6">
              Seus dados foram enviados com sucesso.  
              Após a análise, você será notificado por email.
            </p>

            <button
              onClick={handleVoltarInicio}
              className="
                w-full
                py-4
                rounded-2xl
                bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D]
                text-white font-bold
                hover:scale-[1.02]
              "
            >
              Voltar ao início do app
            </button>

          </motion.div>

        </div>

      )}

    </div>
  );
}