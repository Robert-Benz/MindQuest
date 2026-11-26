import { useCallback, useEffect, useState } from "react";
import { obterCoordenadas, buscarEndereco } from "../services/localizacaoService";
import { buscarClima, obterHorarioLocal, obterSaudacao } from "../services/climaService";

// Guarda o resultado por 10 minutos para não chamar as APIs a cada troca de tela
const CHAVE_CACHE = "mindquest_localizacao_clima";
const VALIDADE_CACHE_MS = 10 * 60 * 1000;

const lerCache = () => {
  try {
    const salvo = JSON.parse(sessionStorage.getItem(CHAVE_CACHE));
    if (salvo && Date.now() - salvo.salvoEm < VALIDADE_CACHE_MS) return salvo;
  } catch {
    // sessionStorage indisponível ou corrompido: ignora o cache
  }
  return null;
};

const salvarCache = (dados) => {
  try {
    sessionStorage.setItem(CHAVE_CACHE, JSON.stringify({ ...dados, salvoEm: Date.now() }));
  } catch {
    // sem cache, segue normalmente
  }
};

// Pede a localização e chama as duas APIs ao mesmo tempo.
// Se uma falhar, a outra ainda aparece.
const carregarDados = async () => {
  const { latitude, longitude } = await obterCoordenadas();

  const [respostaEndereco, respostaClima] = await Promise.allSettled([
    buscarEndereco(latitude, longitude),
    buscarClima(latitude, longitude),
  ]);

  const clima = respostaClima.status === "fulfilled" ? respostaClima.value : null;
  const endereco = respostaEndereco.status === "fulfilled" ? respostaEndereco.value : null;

  if (respostaEndereco.status === "rejected") console.error("Geoapify:", respostaEndereco.reason);
  if (respostaClima.status === "rejected") console.error("OpenWeather:", respostaClima.reason);

  if (!clima && !endereco) {
    throw respostaClima.reason || respostaEndereco.reason;
  }

  return {
    clima,
    localizacao: {
      latitude,
      longitude,
      ...endereco,
      // Se a Geoapify falhar, usa a cidade que o OpenWeather devolve
      cidade: endereco?.cidade || clima?.cidade || null,
    },
  };
};

/**
 * Uso:
 *   const { status, localizacao, clima, horario, saudacao, erro, atualizar } = useLocalizacaoClima();
 *
 * status: "carregando" | "pronto" | "erro"
 * ativo:  false = não pede localização nem chama as APIs (ex.: ao editar um registro antigo)
 */
export default function useLocalizacaoClima({ ativo = true } = {}) {
  const cache = lerCache();

  const [status, setStatus] = useState(cache ? "pronto" : "carregando");
  const [localizacao, setLocalizacao] = useState(cache?.localizacao || null);
  const [clima, setClima] = useState(cache?.clima || null);
  const [erro, setErro] = useState(null);
  const [, setTique] = useState(0); // força nova renderização para o relógio andar

  // Atualiza o estado só quando as APIs respondem
  const buscar = useCallback(() => {
    carregarDados()
      .then(({ localizacao: novaLocalizacao, clima: novoClima }) => {
        setLocalizacao(novaLocalizacao);
        setClima(novoClima);
        setErro(null);
        setStatus("pronto");
        salvarCache({ localizacao: novaLocalizacao, clima: novoClima });
      })
      .catch((e) => {
        setErro(e?.message || "Não foi possível carregar a localização e o clima.");
        setStatus("erro");
      });
  }, []);

  // Primeira carga: só chama as APIs se não houver cache válido
  useEffect(() => {
    if (ativo && !lerCache()) buscar();
  }, [ativo, buscar]);

  // Relógio: renderiza de novo a cada 30 segundos
  useEffect(() => {
    const intervalo = setInterval(() => setTique((t) => t + 1), 30 * 1000);
    return () => clearInterval(intervalo);
  }, []);

  // Botão "atualizar": ignora o cache e busca de novo
  const atualizar = () => {
    setStatus("carregando");
    setErro(null);
    buscar();
  };

  const horario = obterHorarioLocal(clima?.fusoHorarioSegundos);

  return {
    status,
    localizacao,
    clima,
    horario,
    saudacao: obterSaudacao(horario.horaNumero),
    erro,
    atualizar,
  };
}
