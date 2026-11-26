import { useEffect, useState } from "react";
import { obterCoordenadas, buscarEndereco } from "../services/localizacaoService";
import { buscarLugaresProximos, TODAS_CATEGORIAS } from "../services/lugaresService";

// Guarda o resultado de cada busca por 15 minutos (economiza a cota gratuita da Geoapify)
const PREFIXO_CACHE = "mindquest_lugares_";
const VALIDADE_CACHE_MS = 15 * 60 * 1000;

const lerCache = (chave) => {
  try {
    const salvo = JSON.parse(sessionStorage.getItem(PREFIXO_CACHE + chave));
    if (salvo && Date.now() - salvo.salvoEm < VALIDADE_CACHE_MS) return salvo;
  } catch {
    // sessionStorage indisponível ou corrompido: ignora o cache
  }
  return null;
};

const salvarCache = (chave, dados) => {
  try {
    sessionStorage.setItem(PREFIXO_CACHE + chave, JSON.stringify({ ...dados, salvoEm: Date.now() }));
  } catch {
    // sem cache, segue normalmente
  }
};

const apagarCache = (chave) => {
  try {
    sessionStorage.removeItem(PREFIXO_CACHE + chave);
  } catch {
    // nada a fazer
  }
};

// Pega a posição do usuário e busca endereço + lugares ao mesmo tempo
const carregarDados = async ({ categorias, raioMetros, limite }) => {
  const { latitude, longitude } = await obterCoordenadas();

  const [respostaEndereco, respostaLugares] = await Promise.allSettled([
    buscarEndereco(latitude, longitude),
    buscarLugaresProximos(latitude, longitude, { categorias, raioMetros, limite }),
  ]);

  // Sem a lista de lugares não há o que mostrar
  if (respostaLugares.status === "rejected") throw respostaLugares.reason;

  // Se só o endereço falhar, os lugares aparecem mesmo assim
  if (respostaEndereco.status === "rejected") console.error("Geoapify (endereço):", respostaEndereco.reason);

  return {
    localizacao: {
      latitude,
      longitude,
      ...(respostaEndereco.status === "fulfilled" ? respostaEndereco.value : {}),
    },
    lugares: respostaLugares.value,
  };
};

/**
 * Uso:
 *   const { status, localizacao, lugares, erro, atualizar } =
 *     useLugaresProximos({ categorias: ["restaurante", "parque"], raioMetros: 3000 });
 *
 * status: "carregando" | "pronto" | "erro"
 * categorias: "restaurante" | "cafe" | "parque" | "museu" | "cultura" | "turismo"
 */
export default function useLugaresProximos({
  categorias = TODAS_CATEGORIAS,
  raioMetros = 3000,
  limite = 20,
} = {}) {
  // Identifica a busca atual; mudar categoria/raio gera uma busca nova
  const chave = JSON.stringify({ categorias: [...categorias].sort(), raioMetros, limite });

  const [resultado, setResultado] = useState(null);
  const [tentativa, setTentativa] = useState(0);

  useEffect(() => {
    if (lerCache(chave)) return;

    let cancelado = false; // ignora respostas de buscas antigas (ex.: trocou de filtro no meio)
    const opcoes = JSON.parse(chave);

    carregarDados(opcoes)
      .then((dados) => {
        if (cancelado) return;
        setResultado({ chave, ...dados, erro: null });
        salvarCache(chave, dados);
      })
      .catch((e) => {
        if (cancelado) return;
        setResultado({ chave, localizacao: null, lugares: [], erro: e?.message || "Não foi possível buscar lugares próximos." });
      });

    return () => {
      cancelado = true;
    };
  }, [chave, tentativa]);

  // Usa o resultado desta busca ou, se não houver, o que estiver em cache
  const atual = resultado?.chave === chave ? resultado : lerCache(chave);

  const atualizar = () => {
    apagarCache(chave);
    setResultado(null);
    setTentativa((t) => t + 1);
  };

  return {
    status: !atual ? "carregando" : atual.erro ? "erro" : "pronto",
    localizacao: atual?.localizacao || null,
    lugares: atual?.lugares || [],
    erro: atual?.erro || null,
    atualizar,
  };
}
