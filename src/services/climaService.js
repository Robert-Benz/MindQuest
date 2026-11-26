// =========================================================================
// CLIMA E HORÁRIO (OpenWeather - Current Weather API)
// Docs: https://openweathermap.org/current
// =========================================================================

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

const capitalizar = (texto = "") => texto.charAt(0).toUpperCase() + texto.slice(1);

// Busca o clima atual a partir da latitude/longitude
export const buscarClima = async (latitude, longitude) => {
  if (!OPENWEATHER_API_KEY) {
    throw new Error("Chave do OpenWeather não configurada (VITE_OPENWEATHER_API_KEY).");
  }

  const url =
    "https://api.openweathermap.org/data/2.5/weather" +
    `?lat=${latitude}&lon=${longitude}&units=metric&lang=pt_br&appid=${OPENWEATHER_API_KEY}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!resposta.ok) {
    const mensagens = {
      401: "Chave do OpenWeather inválida ou ainda não ativada (chaves novas levam até 2 horas para funcionar).",
      429: "Limite de uso da API do OpenWeather atingido.",
    };
    throw new Error(mensagens[resposta.status] || `Erro no OpenWeather: ${dados.message || resposta.status}`);
  }

  const tempo = dados.weather?.[0] || {};

  return {
    descricao: capitalizar(tempo.description),          // ex.: "Céu limpo"
    condicao: tempo.main,                               // ex.: "Clear", "Rain" (bom para lógica/ícones)
    icone: tempo.icon ? `https://openweathermap.org/img/wn/${tempo.icon}@2x.png` : null,
    periodo: tempo.icon?.endsWith("n") ? "noite" : "dia",
    temperatura: Math.round(dados.main?.temp),          // °C
    sensacaoTermica: Math.round(dados.main?.feels_like),
    minima: Math.round(dados.main?.temp_min),
    maxima: Math.round(dados.main?.temp_max),
    umidade: dados.main?.humidity,                      // %
    vento: Math.round((dados.wind?.speed || 0) * 3.6),  // m/s -> km/h
    cidade: dados.name || null,                         // reserva caso a Geoapify falhe
    fusoHorarioSegundos: dados.timezone,                // diferença em segundos em relação ao UTC
    nascerDoSol: dados.sys?.sunrise,                    // timestamp UNIX (segundos)
    porDoSol: dados.sys?.sunset,
    atualizadoEm: dados.dt,
  };
};

// Converte um timestamp para o horário local da localização do usuário
const dataNoFuso = (fusoHorarioSegundos, timestampMs = Date.now()) =>
  new Date(timestampMs + fusoHorarioSegundos * 1000);

const formatar = (data, opcoes) =>
  data.toLocaleString("pt-BR", { timeZone: "UTC", ...opcoes });

// Horário atual no local do usuário, ex.: { hora: "14:35", data: "quinta-feira, 26 de novembro" }
export const obterHorarioLocal = (fusoHorarioSegundos) => {
  // Sem fuso do OpenWeather, usa o horário do próprio aparelho
  if (fusoHorarioSegundos === undefined || fusoHorarioSegundos === null) {
    const agora = new Date();
    return {
      hora: agora.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
      data: agora.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" }),
      horaNumero: agora.getHours(),
    };
  }

  const agora = dataNoFuso(fusoHorarioSegundos);
  return {
    hora: formatar(agora, { hour: "2-digit", minute: "2-digit" }),
    data: formatar(agora, { weekday: "long", day: "numeric", month: "long" }),
    horaNumero: agora.getUTCHours(),
  };
};

// Formata nascer/pôr do sol no fuso do usuário, ex.: "05:21"
export const formatarHorarioSol = (timestampSegundos, fusoHorarioSegundos) =>
  timestampSegundos
    ? formatar(dataNoFuso(fusoHorarioSegundos || 0, timestampSegundos * 1000), {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

// Saudação de acordo com a hora local
export const obterSaudacao = (horaNumero) => {
  if (horaNumero >= 5 && horaNumero < 12) return "Bom dia";
  if (horaNumero >= 12 && horaNumero < 18) return "Boa tarde";
  return "Boa noite";
};

// =========================================================================
// REGRAS USADAS PELO CHECK-IN DE HUMOR E PELAS MISSÕES
// =========================================================================

// Condições do OpenWeather que contam como "chuva" (garoa, chuva, tempestade e neve)
const CONDICOES_CHUVA = ["Rain", "Drizzle", "Thunderstorm", "Snow"];

export const estaChovendo = (clima) => CONDICOES_CHUVA.includes(clima?.condicao);

// Converte o clima da API nas 3 opções já usadas no app (Calendário/Histórico leem esse texto)
export const climaParaCategoria = (clima) => {
  if (estaChovendo(clima)) return "Chuvoso";
  if (clima?.condicao === "Clear") return "Ensolarado";
  return "Nublado"; // nuvens, neblina, névoa, fumaça...
};
