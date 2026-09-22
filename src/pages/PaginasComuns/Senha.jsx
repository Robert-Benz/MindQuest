import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, ArrowLeft } from "lucide-react";
import { useState, useRef } from "react";

export default function RecuperarSenha() {

  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalAberto, setModalAberto] = useState(false);

  const [toast, setToast] = useState(false);

  const [codigo, setCodigo] = useState([
    "", "", "", "", "", ""
  ]);

  const [codigoErro, setCodigoErro] = useState("");

  const inputsRef = useRef([]);

  const handleResetPassword = async () => {

    setErro("");

    setLoading(true);

    setTimeout(() => {

      setLoading(false);

      setModalAberto(true);

    }, 1500);

  };

  const handleReenviarEmail = () => {

    setToast(true);

    setTimeout(() => {

      setToast(false);

    }, 3000);

  };

  const handleChangeCodigo = (value, index) => {

    if (!/^\d*$/.test(value)) return;

    const novoCodigo = [...codigo];

    novoCodigo[index] = value.slice(-1);

    setCodigo(novoCodigo);

    if (value && index < 5) {

      inputsRef.current[index + 1]?.focus();

    }
  };

  const handleKeyDown = (e, index) => {

    if (
      e.key === "Backspace" &&
      !codigo[index] &&
      index > 0
    ) {

      inputsRef.current[index - 1]?.focus();

    }
  };

  const handleConfirmarCodigo = () => {

    const codigoCompleto = codigo.join("");

    if (codigoCompleto.length < 6) {

      setCodigoErro("Digite o código completo");

      return;
    }

    setCodigoErro("");

    console.log("Código digitado:", codigoCompleto);

    navigate("/nova-senha");
  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#F5DACA] via-[#FFF4EF] to-[#ECC3A9] flex items-center justify-center p-6">

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="
          w-full
          max-w-md
          bg-white/80
          backdrop-blur-md
          rounded-[2.5rem]
          p-8
          md:p-10
          shadow-2xl
          border
          border-white
          relative
        "
      >

        {/* Botão voltar */}

        <button
          onClick={() => navigate("/login")}
          className="
            absolute
            top-6
            left-6
            text-[#9A6A58]
            hover:text-[#7A4E3A]
            transition-all
          "
        >
          <ArrowLeft />
        </button>

        {/* Header */}

        <div className="text-center mb-8">

          <div className="
            w-16
            h-16
            rounded-full
            bg-[#F5DACA]
            flex
            items-center
            justify-center
            mx-auto
            mb-4
            shadow-md
          ">

            <Mail className="text-[#FF9B7D] size-8" />

          </div>

          <h2 className="text-3xl font-bold text-[#7A4E3A]">
            Recuperar Senha
          </h2>

          <p className="text-[#9A6A58] mt-2">
            Digite seu email para receber o código de recuperação
          </p>

        </div>

        {/* Form */}

        <div className="space-y-4">

          <input
            type="email"
            placeholder="Digite seu email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="
              w-full
              p-4
              rounded-2xl
              bg-[#FFF7F4]
              border
              border-[#F5DACA]
              focus:outline-none
              focus:ring-2
              focus:ring-[#FFC9BA]
              transition-all
              text-[#7A4E3A]
              placeholder:text-[#B88B79]
            "
          />

          {erro && (

            <p className="text-[#D45B4A] text-sm text-center">
              {erro}
            </p>

          )}

          <button
            onClick={handleResetPassword}
            disabled={loading}
            className={`
              w-full
              py-4
              rounded-2xl
              font-bold
              text-white
              shadow-lg
              transition-all
              active:scale-95
              ${
                loading
                  ? "bg-[#D9A999] cursor-not-allowed"
                  : "bg-gradient-to-r from-[#FFB5A0] to-[#FF9B7D] hover:scale-[1.02] hover:shadow-xl"
              }
            `}
          >

            {loading
              ? "Enviando..."
              : "Enviar código"}

          </button>

        </div>

      </motion.div>

      {/* Modal */}

      {modalAberto && (

        <div className="
          fixed
          inset-0
          bg-black/40
          flex
          items-center
          justify-center
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
              max-w-sm
              w-full
              text-center
              shadow-2xl
              relative
            "
          >

            {/* Botão voltar modal */}

            <button
              onClick={() => {

                setModalAberto(false);

                setCodigo([
                  "", "", "", "", "", ""
                ]);

                setCodigoErro("");

              }}
              className="
                absolute
                top-6
                left-6
                text-[#9A6A58]
                hover:text-[#7A4E3A]
                transition-all
              "
            >
              <ArrowLeft />
            </button>

            <div className="
              w-16
              h-16
              bg-[#F5DACA]
              rounded-full
              flex
              items-center
              justify-center
              mx-auto
              mb-4
            ">

              <Mail className="text-[#FF9B7D] size-8" />

            </div>

            <h3 className="
              text-2xl
              font-bold
              text-[#7A4E3A]
              mb-2
            ">
              Verificação
            </h3>

            <p className="text-[#9A6A58] mb-6">
              Digite o código de 6 dígitos enviado para seu email
            </p>

            {/* Inputs código */}

            <div className="
              flex
              justify-center
              gap-2
              mb-4
            ">

              {codigo.map((digit, index) => (

                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength={1}
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) =>
                    handleChangeCodigo(
                      e.target.value,
                      index
                    )
                  }
                  onKeyDown={(e) =>
                    handleKeyDown(e, index)
                  }
                  className="
                    w-12
                    h-14
                    rounded-2xl
                    text-center
                    text-xl
                    font-bold
                    bg-[#FFF7F4]
                    border
                    border-[#F5DACA]
                    focus:outline-none
                    focus:ring-2
                    focus:ring-[#FFC9BA]
                    text-[#7A4E3A]
                    transition-all
                  "
                />

              ))}

            </div>

            {/* Erro código */}

            {codigoErro && (

              <p className="
                text-[#D45B4A]
                text-sm
                mb-4
              ">
                {codigoErro}
              </p>

            )}

            {/* Botões */}

            <div className="space-y-3">

              <button
                onClick={handleConfirmarCodigo}
                className="
                  w-full
                  py-4
                  rounded-2xl
                  font-bold
                  text-white
                  bg-gradient-to-r
                  from-[#FFB5A0]
                  to-[#FF9B7D]
                  shadow-lg
                  hover:scale-[1.02]
                  hover:shadow-xl
                  transition-all
                "
              >
                Confirmar Código
              </button>

              <button
                onClick={handleReenviarEmail}
                className="
                  text-sm
                  text-[#FF9B7D]
                  hover:underline
                  transition-all
                "
              >
                Não recebeu o código? Reenviar
              </button>

            

            </div>

          </motion.div>

        </div>

      )}

      {/* Toast */}

      {toast && (

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="
            fixed
            bottom-6
            right-6
            bg-[#7A4E3A]
            text-white
            px-6
            py-4
            rounded-2xl
            shadow-2xl
            z-50
            font-medium
          "
        >
          Código reenviado com sucesso
        </motion.div>

      )}

    </div>
  );
}