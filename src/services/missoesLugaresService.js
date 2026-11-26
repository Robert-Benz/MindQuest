// =========================================================================
// MISSÕES DE PASSEIO (Geoapify + OpenWeather)
// Só gera missões quando NÃO está chovendo e o horário local está entre 06h e 20h.
// =========================================================================

import { obterCoordenadas } from "./localizacaoService";
import { buscarClima, estaChovendo, obterHorarioLocal } from "./climaService";
import { buscarLugaresProximos } from "./lugaresService";

// Janela em que atividades fora de casa podem ser recomendadas e concluídas
export const HORA_INICIO_PASSEIO = 6;  // 06:00
export const HORA_FIM_PASSEIO = 20;    // até 19:59

const TEMPO_LIMITE_MS = 10000; // não deixa a tela de missões esperando demais

// Textos de cada tipo de missão (o {nome} é trocado pelo nome do lugar)
const MODELOS = {
  restaurante: { titulo: "Experimente uma refeição no {nome}", tempo: "45 min", xp: 20 },
  cafe: { titulo: "Experimente tomar um café no {nome}", tempo: "20 min", xp: 15 },
  parque: { titulo: "Faça uma caminhada no {nome}", tempo: "30 min", xp: 25 },
  museu: { titulo: "Visite o {nome}", tempo: "1 h", xp: 30 },
  cultura: { titulo: "Conheça o {nome}", tempo: "45 min", xp: 25 },
  turismo: { titulo: "Visite o {nome}", tempo: "30 min", xp: 20 },
};

const comTempoLimite = (promessa) =>
  Promise.race([
    promessa,
    new Promise((_, rejeitar) =>
      setTimeout(() => rejeitar(new Error("As APIs de localização/clima demoraram para responder.")), TEMPO_LIMITE_MS)
    ),
  ]);

// Está dentro da janela de atividades fora de casa (06h–20h)?
// Sem hora informada, usa o relógio do aparelho do usuário.
export const dentroDoHorarioExterno = (hora = new Date().getHours()) =>
  hora >= HORA_INICIO_PASSEIO && hora < HORA_FIM_PASSEIO;

export const TEXTO_HORARIO_EXTERNO = `${HORA_INICIO_PASSEIO}h–${HORA_FIM_PASSEIO}h`;

// Regra dos lugares próximos: sem chuva e entre 06h e 20h (no horário do local do usuário)
export const podeSugerirPasseio = (clima) => {
  if (!clima) return false; // sem clima confirmado, não arrisca mandar a pessoa para a rua
  const { horaNumero } = obterHorarioLocal(clima.fusoHorarioSegundos);
  return !estaChovendo(clima) && dentroDoHorarioExterno(horaNumero);
};

// =========================================================================
// ATIVIDADES FORA DE CASA EM GERAL (inclui as sugeridas pela IA)
// =========================================================================

// Palavras que indicam que a missão é fora de casa
const PALAVRAS_EXTERNAS =
  /caminhad|caminhe|\bcaminhar|ao ar livre|ar fresco|parque|passeio|passear|corrid|correr|pedal|bicicleta|\bbike\b|trilha|praia|visite|visitar|visita a|museu|exposi[çc][ãa]o|feira|pra[çc]a|jardim bot|sair de casa|saia de casa|\brua\b|quarteir|bairro|caf[eé] d[oa] |restaurante|cinema|teatro/i;

// A missão é fora de casa? Missões novas já vêm marcadas; as antigas são identificadas pelo texto.
export const ehAtividadeExterna = (missao) => {
  if (!missao) return false;
  if (typeof missao.aoArLivre === "boolean") return missao.aoArLivre;
  if (missao.lugar) return true;
  const texto = `${missao.titulo || missao.texto || ""} ${missao.descricao || ""}`;
  return PALAVRAS_EXTERNAS.test(texto);
};

// Atividades dentro de casa para completar as vagas fora do horário
const MISSOES_EM_CASA = [
  { titulo: "Alongamento Suave", descricao: "Alongue pescoço, ombros e costas com calma, sem sair de casa.", categoria: "Movimento", tempoEstimado: "8 min", xp: 10 },
  { titulo: "Diário de Gratidão", descricao: "Escreva três coisas, mesmo pequenas, que foram boas hoje.", categoria: "Reflexão", tempoEstimado: "5 min", xp: 10 },
  { titulo: "Chá e Pausa Consciente", descricao: "Prepare uma bebida quente e saboreie devagar, sem telas.", categoria: "Relaxamento", tempoEstimado: "10 min", xp: 10 },
  { titulo: "Organize um Cantinho", descricao: "Arrume uma gaveta ou mesa; um espaço em ordem acalma a mente.", categoria: "Rotina", tempoEstimado: "10 min", xp: 10 },
  { titulo: "Respiração 4-7-8", descricao: "Inspire por 4s, segure por 7s e solte por 8s. Repita 4 vezes.", categoria: "Relaxamento", tempoEstimado: "5 min", xp: 10 },
  { titulo: "Playlist do Momento", descricao: "Monte uma lista com 5 músicas que combinam com o seu dia.", categoria: "Criatividade", tempoEstimado: "10 min", xp: 10 },
];

// Pode recomendar atividades fora de casa agora? (06h–20h e sem chuva)
// Se o clima não estiver disponível, vale só a regra do horário.
export const podeRecomendarAtividadeExterna = (clima) =>
  dentroDoHorarioExterno() && !estaChovendo(clima);

/**
 * Prepara as sugestões para salvar:
 * - marca cada uma com "aoArLivre"
 * - fora da janela 06h–20h ou com chuva, descarta as de fora de casa
 *   e completa com atividades em casa
 */
export const ajustarMissoesAoHorarioEClima = (sugestoes, quantidade, titulosExistentes = [], clima = null) => {
  const permitidoSair = podeRecomendarAtividadeExterna(clima);

  const marcadas = sugestoes.map((s) => ({ ...s, aoArLivre: ehAtividadeExterna(s) }));
  const aceitas = permitidoSair ? marcadas : marcadas.filter((s) => !s.aoArLivre);

  const usados = new Set([...titulosExistentes, ...aceitas.map((s) => s.titulo)]);
  const reservas = MISSOES_EM_CASA
    .filter((m) => !usados.has(m.titulo))
    .map((m) => ({ ...m, aoArLivre: false }));

  return [...aceitas, ...reservas].slice(0, quantidade);
};

// Sorteia entre os lugares mais próximos para as missões não serem sempre iguais
const sortearLugares = (lugares, quantidade) => {
  const maisProximos = lugares.slice(0, 10);
  for (let i = maisProximos.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [maisProximos[i], maisProximos[j]] = [maisProximos[j], maisProximos[i]];
  }
  return maisProximos.slice(0, quantidade);
};

const montarMissao = (lugar, clima) => {
  const modelo = MODELOS[lugar.categoria] || MODELOS.turismo;
  const climaTexto = clima?.descricao ? `${clima.descricao.toLowerCase()}, ${clima.temperatura}°C` : null;

  return {
    titulo: modelo.titulo.replace("{nome}", lugar.nome),
    descricao:
      `${lugar.categoriaSingular} a ${lugar.distanciaTexto} de você` +
      (climaTexto ? ` — o tempo está bom para sair (${climaTexto}).` : "."),
    categoria: "Passeio",
    tempoEstimado: modelo.tempo,
    xp: modelo.xp,
    aoArLivre: true,
    lugar: {
      id: lugar.id,
      nome: lugar.nome,
      categoria: lugar.categoria,
      endereco: lugar.endereco,
      distanciaTexto: lugar.distanciaTexto,
      linkMapa: lugar.linkMapa,
    },
  };
};

/**
 * Busca a localização e o clima atual (uma vez por geração de missões).
 * Retorna null se o usuário negar a localização, a API falhar ou demorar demais.
 */
export const obterContextoExterno = async () => {
  try {
    return await comTempoLimite(
      (async () => {
        const { latitude, longitude } = await obterCoordenadas();
        const clima = await buscarClima(latitude, longitude);
        return { latitude, longitude, clima };
      })()
    );
  } catch (error) {
    console.error("Localização/clima indisponível para as missões:", error);
    return null;
  }
};

/**
 * Gera missões de passeio em lugares próximos.
 * Retorna [] quando está chovendo, fora do horário ou se as APIs falharem
 * (assim as outras missões continuam sendo geradas normalmente).
 *
 * @param {object|null} contexto       resultado de obterContextoExterno()
 * @param {number}      quantidade     quantas missões de passeio gerar
 * @param {string[]}    lugaresUsados  ids de lugares que já viraram missão hoje
 */
export const geraMissoesDeLugares = async (contexto, { quantidade = 1, lugaresUsados = [] } = {}) => {
  if (quantidade <= 0 || !contexto || !podeSugerirPasseio(contexto.clima)) return [];

  try {
    const lugares = await comTempoLimite(buscarLugaresProximos(contexto.latitude, contexto.longitude));
    const disponiveis = lugares.filter((l) => !lugaresUsados.includes(l.id));

    return sortearLugares(disponiveis, quantidade).map((lugar) => montarMissao(lugar, contexto.clima));
  } catch (error) {
    console.error("Missões de passeio não geradas:", error);
    return [];
  }
};
