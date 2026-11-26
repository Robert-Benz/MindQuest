// =========================================================================
// LUGARES PRÓXIMOS (Geoapify Places API)
// Docs: https://apidocs.geoapify.com/docs/places/
// =========================================================================

import { GEOAPIFY_API_KEY, mensagemErroGeoapify, verificarChaveGeoapify } from "./localizacaoService";

// Categorias oferecidas ao usuário -> categorias da Geoapify
export const CATEGORIAS_LUGARES = {
  restaurante: { nome: "Restaurantes", singular: "Restaurante", geoapify: ["catering.restaurant"] },
  cafe: { nome: "Cafés", singular: "Café", geoapify: ["catering.cafe"] },
  parque: { nome: "Parques", singular: "Parque", geoapify: ["leisure.park"] },
  museu: { nome: "Museus", singular: "Museu", geoapify: ["entertainment.museum"] },
  cultura: { nome: "Cultura", singular: "Espaço cultural", geoapify: ["entertainment.culture"] }, // teatros, galerias, centros culturais
  turismo: { nome: "Pontos turísticos", singular: "Ponto turístico", geoapify: ["tourism.attraction", "tourism.sights"] },
};

export const TODAS_CATEGORIAS = Object.keys(CATEGORIAS_LUGARES);

// Descobre qual das nossas categorias corresponde às categorias devolvidas pela API
const identificarCategoria = (categoriasApi = []) =>
  TODAS_CATEGORIAS.find((chave) =>
    CATEGORIAS_LUGARES[chave].geoapify.some((cat) =>
      categoriasApi.some((c) => c === cat || c.startsWith(`${cat}.`))
    )
  ) || "turismo";

// Distância em metros entre dois pontos (fórmula de Haversine)
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
  const raioTerra = 6371000;
  const rad = (graus) => (graus * Math.PI) / 180;
  const dLat = rad(lat2 - lat1);
  const dLon = rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon / 2) ** 2;
  return Math.round(raioTerra * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
};

export const formatarDistancia = (metros) =>
  metros < 1000 ? `${metros} m` : `${(metros / 1000).toFixed(1).replace(".", ",")} km`;

/**
 * Busca lugares próximos para o usuário visitar.
 *
 * @param {number} latitude
 * @param {number} longitude
 * @param {object} opcoes
 *   categorias: chaves de CATEGORIAS_LUGARES (padrão: todas)
 *   raioMetros: distância máxima da busca (padrão: 3 km)
 *   limite:     quantidade máxima de lugares (padrão: 20)
 */
export const buscarLugaresProximos = async (
  latitude,
  longitude,
  { categorias = TODAS_CATEGORIAS, raioMetros = 3000, limite = 20 } = {}
) => {
  verificarChaveGeoapify();

  const categoriasApi = categorias
    .flatMap((chave) => CATEGORIAS_LUGARES[chave]?.geoapify || [])
    .join(",");

  if (!categoriasApi) {
    throw new Error("Escolha pelo menos uma categoria de lugar.");
  }

  // Atenção: a Geoapify usa a ordem longitude,latitude nos filtros
  const url =
    "https://api.geoapify.com/v2/places" +
    `?categories=${categoriasApi}` +
    `&filter=circle:${longitude},${latitude},${raioMetros}` +
    `&bias=proximity:${longitude},${latitude}` +
    `&limit=${limite}&lang=pt&apiKey=${GEOAPIFY_API_KEY}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!resposta.ok) {
    throw new Error(mensagemErroGeoapify(resposta.status, dados?.message));
  }

  const vistos = new Set();

  return (dados.features || [])
    .map(({ properties: p }) => {
      const categoria = identificarCategoria(p.categories);
      const distanciaMetros = p.distance ?? calcularDistancia(latitude, longitude, p.lat, p.lon);

      return {
        id: p.place_id,
        nome: p.name,
        categoria,
        categoriaNome: CATEGORIAS_LUGARES[categoria].nome,
        categoriaSingular: CATEGORIAS_LUGARES[categoria].singular,
        endereco: p.address_line2 || p.formatted || "",
        latitude: p.lat,
        longitude: p.lon,
        distanciaMetros,
        distanciaTexto: formatarDistancia(distanciaMetros),
        site: p.website || p.datasource?.raw?.website || null,
        telefone: p.contact?.phone || p.datasource?.raw?.phone || null,
        horarioFuncionamento: p.opening_hours || p.datasource?.raw?.opening_hours || null,
        // Link para abrir o lugar no app de mapas do celular (não usa API paga)
        linkMapa: `https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lon}`,
      };
    })
    // Lugares sem nome não ajudam o usuário; também evita repetidos
    .filter((lugar) => {
      if (!lugar.nome || vistos.has(lugar.id)) return false;
      vistos.add(lugar.id);
      return true;
    })
    .sort((a, b) => a.distanciaMetros - b.distanciaMetros);
};
