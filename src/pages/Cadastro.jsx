import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Lock, Calendar, VenusAndMars, Eye, EyeOff, 
  ArrowLeft, Stethoscope, HeartHandshake, ChevronDown 
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";

const schema = z.object({
  nome: z.string().min(3, "Digite seu nome"),
  email: z.string().email("Email inválido"),
  senha: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
  confirmarSenha: z.string(),
  dataNascimento: z.string().min(1, "Informe sua data de nascimento"),
  genero: z.string().min(1, "Selecione um gênero"),
}).refine((data) => data.senha === data.confirmarSenha, {
  message: "As senhas não coincidem",
  path: ["confirmarSenha"],
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

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  const senha = watch("senha");
  const confirmarSenha = watch("confirmarSenha");
  const email = watch("email");

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [modalCodigo, setModalCodigo] = useState(false);
  const [modalPerfil, setModalPerfil] = useState(false);
  const [perfilSelecionado, setPerfilSelecionado] = useState("");
  const [toast, setToast] = useState(false);
  const [erroCodigo, setErroCodigo] = useState("");
  const [usuarioCriado, setUsuarioCriado] = useState(null);
  const [codigo, setCodigo] = useState(["", "", "", "", "", ""]);

  const CODIGO_MOCKADO = "123456";

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
  const codigoCompleto = codigo.every((digit) => digit !== "");

  const onSubmit = async (data) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.senha
      );

      const user = userCredential.user;
      setUsuarioCriado(user);

      await setDoc(doc(db, "usuarios", user.uid), {
        idUsuario: user.uid,
        nome: data.nome,
        email: data.email,
        dataNascimento: data.dataNascimento,
        genero: data.genero,
        tipoPerfil: "",
        moedas: 0,
        nivel: 1,
        xp: 0,
        emailVerificado: false,
        dataCadastro: new Date()
      });

      setModalCodigo(true);

    } catch (error) {
      alert("Erro ao criar conta: " + error.message);
    }
  };

  const handleCodigoChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;

    const novoCodigo = [...codigo];
    novoCodigo[index] = value;
    setCodigo(novoCodigo);
    setErroCodigo("");

    if (value && index < 5) {
      document.getElementById(`codigo-${index + 1}`)?.focus();
    }
  };

  const handleReenviarCodigo = () => {
    setToast(true);
    setTimeout(() => {
      setToast(false);
    }, 3000);
  };

  const handleConfirmarCodigo = async () => {
    const codigoDigitado = codigo.join("");

    if (codigoDigitado !== CODIGO_MOCKADO) {
      setErroCodigo("Código inválido");
      return;
    }

    setErroCodigo("");

    if (usuarioCriado) {
      await updateDoc(doc(db, "usuarios", usuarioCriado.uid), {
        emailVerificado: true
      });
    }

    setModalCodigo(false);
    setModalPerfil(true);
  };

  const handleConfirmarPerfil = async () => {
    if (!perfilSelecionado) return;

    try {
      if (usuarioCriado) {
        await updateDoc(doc(db, "usuarios", usuarioCriado.uid), {
          tipoPerfil: perfilSelecionado
        });
      }

      navigate("/Menu");

    } catch (error) {
      alert("Erro ao salvar perfil");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#F5DACA] via-[#FFF4EF] to-[#ECC3A9] p-6 md:p-10">
      <motion.form
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white/80 backdrop-blur-md p-8 md:p-10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl space-y-6 border border-white"
      >
        <button
          type="button"
          onClick={() => navigate("/")} // Altere para "/" ou "/login" se preferir mandar para a landing ou login
          className="flex items-center gap-2 text-[#9A6A58] hover:text-[#7A4E3A] font-semibold text-sm transition-colors group"
        >
          <ArrowLeft className="size-5 group-hover:-translate-x-1 transition-transform" />
          <span></span>
        </button>

        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#7A4E3A]">
            MindQuest ✨
          </h1>
          <p className="text-[#9A6A58] text-sm mt-2">
            Crie sua conta para começar sua jornada
          </p>
        </div>

        {/* Campos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nome */}
          <div className="md:col-span-2">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#B88B79]" />
              <input
                placeholder="Nome completo"
                {...register("nome")}
                className="w-full pl-11 p-4 bg-[#FFF7F4] border border-[#F5DACA] rounded-2xl focus:ring-2 focus:ring-[#FFC9BA] outline-none"
              />
            </div>
            {errors.nome && (
              <p className="text-[#D45B4A] text-xs mt-1 ml-2">
                {errors.nome.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#B88B79]" />
            <input
              placeholder="Email"
              {...register("email")}
              className="w-full pl-11 p-4 bg-[#FFF7F4] border border-[#F5DACA] rounded-2xl focus:ring-2 focus:ring-[#FFC9BA] outline-none"
            />
            {email && !emailValido && (
              <p className="text-[#D45B4A] text-xs mt-1 ml-2">
                Digite um email válido
              </p>
            )}
          </div>

          {/* Data nascimento */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#B88B79]" />
            <input
              type="date"
              {...register("dataNascimento")}
              className="w-full pl-11 p-4 bg-[#FFF7F4] border border-[#F5DACA] rounded-2xl focus:ring-2 focus:ring-[#FFC9BA] outline-none text-[#7A4E3A] cursor-pointer [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-60 hover:[&::-webkit-calendar-picker-indicator]:opacity-100"
            />
            {errors.dataNascimento && (
              <p className="text-[#D45B4A] text-xs mt-1 ml-2">
                {errors.dataNascimento.message}
              </p>
            )}
          </div>

          {/* Senha */}
          <div className="relative flex items-center">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#B88B79]" />
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              {...register("senha")}
              className="w-full pl-11 pr-12 p-4 bg-[#FFF7F4] border border-[#F5DACA] rounded-2xl focus:ring-2 focus:ring-[#FFC9BA] outline-none"
            />
            <button
              type="button"
              onClick={() => setMostrarSenha(!mostrarSenha)}
              className="absolute right-4 top-4 text-[#B88B79] hover:text-[#7A4E3A]"
            >
              {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {senha && senha.length < 6 && (
              <p className="text-[#D45B4A] text-xs mt-1 ml-2">
                A senha deve ter no mínimo 6 caracteres
              </p>
            )}
            {senha && senha.length >= 6 && (
              <p className="text-green-500 text-xs mt-1 ml-2">
                Senha válida ✓
              </p>
            )}
          </div>

          {/* Confirmar senha */}
          <div className="relative flex items-center">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#B88B79]" />
            <input
              type={mostrarConfirmarSenha ? "text" : "password"}
              placeholder="Confirmar senha"
              {...register("confirmarSenha")}
              className="w-full pl-11 pr-12 p-4 bg-[#FFF7F4] border border-[#F5DACA] rounded-2xl focus:ring-2 focus:ring-[#FFC9BA] outline-none"
            />
            <button
              type="button"
              onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
              className="absolute right-4 top-4 text-[#B88B79] hover:text-[#7A4E3A]"
            >
              {mostrarConfirmarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
            {senha && confirmarSenha && senha !== confirmarSenha && (
              <p className="text-[#D45B4A] text-xs mt-1 ml-2">
                As senhas não coincidem
              </p>
            )}
            {senha && confirmarSenha && senha === confirmarSenha && (
              <p className="text-green-500 text-xs mt-1 ml-2">
                Senhas coincidem ✓
              </p>
            )}
          </div>

          {/* Gênero */}
          <div className="relative md:col-span-2">
            <VenusAndMars className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-[#B88B79] pointer-events-none" />
            <select
              {...register("genero")}
              className="w-full pl-11 p-4 bg-[#FFF7F4] border border-[#F5DACA] rounded-2xl focus:ring-2 focus:ring-[#FFC9BA] outline-none appearance-none text-[#7A4E3A]"
            >
              <option value="">Selecione seu gênero</option>
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="nao_binario">Não-binário</option>
              <option value="prefiro_nao_dizer">Prefiro não dizer</option>
            </select>
            {errors.genero && (
              <p className="text-[#D45B4A] text-xs mt-1 ml-2">
                {errors.genero.message}
              </p>
            )}
          </div>
        </div>

        {/* Botão */}
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D] text-white p-4 rounded-2xl font-bold shadow-lg hover:scale-[1.02] hover:shadow-xl transition-all active:scale-95 mt-4"
        >
          Criar Conta ✨
        </button>
      </motion.form>

      {/* MODAL CÓDIGO */}
      {modalCodigo && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative"
          >
            <button
              onClick={() => setModalCodigo(false)}
              className="absolute top-6 left-6 text-[#9A6A58] hover:text-[#7A4E3A]"
            >
              <ArrowLeft />
            </button>

            <div className="w-16 h-16 rounded-full bg-[#F5DACA] flex items-center justify-center mx-auto mb-4">
              <Mail className="text-[#FF9B7D] size-8" />
            </div>

            <h2 className="text-2xl font-bold text-[#7A4E3A] mb-2">
              Confirmar Email
            </h2>

            <p className="text-[#9A6A58] mb-6">
              Digite o código de 6 dígitos enviado para seu email
            </p>

            <div className="flex justify-center gap-3 mb-4">
              {codigo.map((digit, index) => (
                <input
                  key={index}
                  id={`codigo-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodigoChange(e.target.value, index)}
                  className="w-12 h-14 text-center text-xl font-bold rounded-2xl bg-[#FFF7F4] border border-[#F5DACA] focus:outline-none focus:ring-2 focus:ring-[#FFC9BA] text-[#7A4E3A]"
                />
              ))}
            </div>

            {erroCodigo && (
              <p className="text-[#D45B4A] text-sm mb-4 font-medium">
                {erroCodigo}
              </p>
            )}

            <button
              onClick={handleConfirmarCodigo}
              disabled={!codigoCompleto}
              className={`w-full py-4 rounded-2xl font-bold text-white transition-all ${
                !codigoCompleto
                  ? "bg-[#D9A999] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D] hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              Confirmar Código
            </button>

            <button
              onClick={handleReenviarCodigo}
              className="mt-4 text-sm text-[#FF9B7D] hover:underline"
            >
              Reenviar código
            </button>
          </motion.div>
        </div>
      )}

      {/* MODAL PERFIL */}
      {modalPerfil && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-6 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl"
          >
            <h2 className="text-3xl font-bold text-[#7A4E3A] mb-2">
              Escolha seu perfil
            </h2>

            <p className="text-[#9A6A58] mb-8">
              Como você deseja utilizar o MindQuest?
            </p>

            <div className="space-y-4">
              {/* Paciente */}
              <button
                type="button"
                onClick={() => setPerfilSelecionado("paciente")}
                className={`w-full p-5 rounded-3xl border transition-all text-left ${
                  perfilSelecionado === "paciente"
                    ? "bg-[#FFE8DF] border-[#FF9B7D] shadow-lg scale-[1.02]"
                    : "bg-[#FFF7F4] border-[#F5DACA] hover:scale-[1.02] hover:shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5DACA] flex items-center justify-center">
                    <HeartHandshake className="text-[#FF9B7D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#7A4E3A]">
                      Paciente
                    </h3>
                  </div>
                </div>
              </button>

              {/* Psicólogo */}
              <button
                type="button"
                onClick={() => setPerfilSelecionado("psicologo")}
                className={`w-full p-5 rounded-3xl border transition-all text-left ${
                  perfilSelecionado === "psicologo"
                    ? "bg-[#FFE8DF] border-[#FF9B7D] shadow-lg scale-[1.02]"
                    : "bg-[#FFF7F4] border-[#F5DACA] hover:scale-[1.02] hover:shadow-lg"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#F5DACA] flex items-center justify-center">
                    <Stethoscope className="text-[#FF9B7D]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#7A4E3A]">
                      Psicólogo
                    </h3>
                  </div>
                </div>
              </button>
            </div>

            {/* BOTÃO OK */}
            <button
              type="button"
              onClick={handleConfirmarPerfil}
              disabled={!perfilSelecionado}
              className={`w-full mt-6 py-4 rounded-2xl font-bold text-white transition-all ${
                !perfilSelecionado
                  ? "bg-[#D9A999] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D] hover:scale-[1.02] hover:shadow-xl"
              }`}
            >
              Confirmar Perfil
            </button>
          </motion.div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 bg-[#7A4E3A] text-white px-6 py-4 rounded-2xl shadow-2xl z-50 font-medium"
        >
          Código reenviado com sucesso
        </motion.div>
      )}
    </div>
  );
}