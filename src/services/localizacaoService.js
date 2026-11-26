// =========================================================================
// LOCALIZAÇÃO DO USUÁRIO
// 1. Geolocalização do navegador -> latitude/longitude (grátis, sem chave)
// 2. Geoapify Reverse Geocoding  -> transforma as coordenadas em cidade/bairro
//    Docs: https://apidocs.geoapify.com/docs/geocoding/reverse-geocoding/
// =========================================================================

export const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;

// Pede a localização ao navegador (o usuário precisa permitir)
export const obterCoordenadas = () =>
  new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Seu navegador não suporta geolocalização."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (posicao) =>
        resolve({
          latitude: posicao.coords.latitude,
          longitude: posicao.coords.longitude,
        }),
      (erro) => {
        const mensagens = {
          1: "Permissão de localização negada. Libere o acesso no navegador para ver o que há perto de você.",
          2: "Não foi possível identificar sua localização.",
          3: "A busca pela localização demorou demais. Tente novamente.",
        };
        reject(new Error(mensagens[erro.code] || "Erro ao obter localização."));
      },
      {
        enableHighAccuracy: false, // precisão de bairro já basta e economiza bateria
        timeout: 10000,
        maximumAge: 10 * 60 * 1000, // reaproveita uma posição de até 10 min atrás
      }
    );
  });

// Mensagens de erro comuns das APIs da Geoapify
export const mensagemErroGeoapify = (status, mensagemApi) => {
  const mensagens = {
    400: "Requisição inválida para a Geoapify.",
    401: "Chave da Geoapify inválida (verifique VITE_GEOAPIFY_API_KEY no .env).",
    403: "Chave da Geoapify sem permissão para esta API.",
    429: "Limite diário gratuito da Geoapify atingido. Tente novamente amanhã.",
  };
  return mensagens[status] || `Erro na Geoapify: ${mensagemApi || status}`;
};

export const verificarChaveGeoapify = () => {
  if (!GEOAPIFY_API_KEY) {
    throw new Error("Chave da Geoapify não configurada (VITE_GEOAPIFY_API_KEY no .env).");
  }
};

// Converte latitude/longitude em cidade, bairro, estado e país (Reverse Geocoding)
export const buscarEndereco = async (latitude, longitude) => {
  verificarChaveGeoapify();

  const url =
    "https://api.geoapify.com/v1/geocode/reverse" +
    `?lat=${latitude}&lon=${longitude}&lang=pt&format=json&apiKey=${GEOAPIFY_API_KEY}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(mensagemErroGeoapify(resposta.status, dados?.message));
  }

  const lugar = dados.results?.[0];
  if (!lugar) {
    throw new Error("Nenhum endereço encontrado para essa localização.");
  }

  return {
    cidade: lugar.city || lugar.town || lugar.village || lugar.county || null,
    bairro: lugar.suburb || lugar.district || null,
    estado: lugar.state_code || lugar.state || null,
    pais: lugar.country || null,
    enderecoCompleto: lugar.formatted || null,
  };
};
