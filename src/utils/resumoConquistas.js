import {collection,doc,getDoc,getCountFromServer,query,where} from "firebase/firestore";
import { configConquistas } from "./conquistas";

export async function buscaMetricas(db, uid, userData) {
  const dados =
    userData ?? (await getDoc(doc(db, "usuarios", uid))).data() ?? {};

  const [humores, missoes] = await Promise.all([
    getCountFromServer(collection(db, "usuarios", uid, "registrosHumor")),
    getCountFromServer(
      query(
        collection(db, "usuarios", uid, "atividades"),
        where("concluida", "==", true)
      )
    ),
  ]);

  return {
    totalHumores: humores.data().count,
    totalMissoes: missoes.data().count,
    nivelApp: Math.floor((dados.xp || 0) / 100) + 1,
    temTerapeuta: dados.terapeuta ? 1 : 0,
  };
}

// Calcula o estado de uma badge (nível alcançado, próximo nível, progresso...)
export function estadoConquista(categoria, metricas) {
  let valorAtual = 0;
  if (categoria.tipo === "humor") valorAtual = metricas.totalHumores;
  if (categoria.tipo === "missoes") valorAtual = metricas.totalMissoes;
  if (categoria.tipo === "nivelApp") valorAtual = metricas.nivelApp;
  if (categoria.tipo === "terapeuta")
    valorAtual = metricas.temTerapeuta ? Math.max(1, metricas.totalHumores) : 0;

  let nivelAlcancado = 0;
  let proximoNivel = categoria.niveis[0];

  for (let i = 0; i < categoria.niveis.length; i++) {
    if (valorAtual >= categoria.niveis[i].meta) {
      nivelAlcancado = categoria.niveis[i].lvl;
      proximoNivel = categoria.niveis[i + 1] || null;
    } else {
      proximoNivel = categoria.niveis[i];
      break;
    }
  }

  const nivelInfo =
    nivelAlcancado > 0
      ? categoria.niveis.find((n) => n.lvl === nivelAlcancado)
      : categoria.niveis[0];

  const metaAtual = proximoNivel ? proximoNivel.meta : nivelInfo.meta;
  const progressoPercent = proximoNivel
    ? Math.min(100, Math.round((valorAtual / metaAtual) * 100))
    : 100;

  return {
    desbloqueado: nivelAlcancado > 0,
    nivelAlcancado,
    maxNivel: categoria.niveis.length,
    titulo: nivelAlcancado > 0 ? nivelInfo.titulo : categoria.nomeBase,
    descricao:
      nivelAlcancado > 0
        ? nivelInfo.desc
        : `Próximo objetivo: ${categoria.niveis[0].desc}`,
    valorAtual,
    metaAtual,
    proximoNivel,
    progressoPercent,
  };
}

// Resumo geral: níveis conquistados somados / níveis possíveis somados
export function calcularResumoConquistas(metricas) {
  let total = 0;
  let ganhos = 0;

  configConquistas.forEach((c) => {
    total += c.niveis.length;
    ganhos += estadoConquista(c, metricas).nivelAlcancado;
  });

  return {
    ganhos,
    total,
    percent: total ? Math.round((ganhos / total) * 100) : 0,
  };
}
