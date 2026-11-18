import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { geraRelatorioSemanal } from "./aiService";

// Converte qualquer formato de data do Firestore/JS
const converteData = (valor) => {
  if (!valor) return null;
  if (typeof valor.toDate === "function") return valor.toDate();
  if (valor.seconds) return new Date(valor.seconds * 1000);
  const d = new Date(valor);
  return isNaN(d.getTime()) ? null : d;
};

// Formata data local (YYYY-MM-DD) sem deslocamento de UTC
const formatarDataLocal = (d) => {
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, "0");
  const dia = String(d.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
};

// Descobre qual é a semana do mês (ex: 1ª semana de Novembro)
const rotuloSemanaMes = (data) => {
  const dia = data.getDate();
  const numeroSemana = Math.ceil(dia / 7);
  const nomeMes = data.toLocaleDateString("pt-BR", { month: "long" });
  const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  
  return `${numeroSemana}ª semana de ${mesFormatado}`;
};

// Ordem de prioridade para desempate (quanto maior o valor, maior a prioridade)
const PRIORIDADE_HUMOR = {
  "feliz": 5,
  "neutro": 4,
  "triste": 3,
  "tristeza": 3,
  "raiva": 2,
  "ansioso": 1,
  "ansiedade": 1
};

// Emojis padrão caso algum registro não tenha o campo emoji salvo
const EMOJI_PADRAO = {
  "feliz": "😊",
  "neutro": "😐",
  "triste": "😢",
  "tristeza": "😢",
  "raiva": "😠",
  "ansioso": "😰",
  "ansiedade": "😰"
};

export async function analiseSemanal(uid) {
  try {
    const hoje = new Date();
    
    // Calcula a data do último domingo (se hoje for domingo, subtrai 0; se for segunda, volta 1 dia, etc.)
    const ultimoDomingo = new Date(hoje);
    ultimoDomingo.setDate(hoje.getDate() - hoje.getDay());
    ultimoDomingo.setHours(23, 59, 59, 999);

    // Identificador único baseado no domingo de fechamento (ex: analise_2026-11-15)
    const docIdSemana = `analise_${formatarDataLocal(ultimoDomingo)}`;

    // 1. Verifica se a análise referente ao último domingo já foi gerada
    const refAnalises = collection(db, "usuarios", uid, "analisesSemanais");
    const snapAnalises = await getDocs(refAnalises);
    const jaExiste = snapAnalises.docs.some(d => d.id === docIdSemana);

    if (jaExiste) {
      console.log(`[AnaliseHumorService] Análise da semana (${docIdSemana}) já existe.`);
      return { gerouNova: false, analise: null };
    }

    // 2. Define o intervalo dos 7 dias referentes àquela semana encerrada
    const dataFim = new Date(ultimoDomingo);
    const dataInicio = new Date(ultimoDomingo);
    dataInicio.setDate(ultimoDomingo.getDate() - 7);
    dataInicio.setHours(0, 0, 0, 0);

    // 3. Busca todos os registros de humor do usuário
    const refHumor = collection(db, "usuarios", uid, "registrosHumor");
    const snapHumor = await getDocs(refHumor);
    const todosRegistros = snapHumor.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filtra os registros que caem dentro daquela janela semanal
    const registrosSemana = todosRegistros.filter(r => {
      const d = converteData(r.data || r.criadoEm);
      return d && d >= dataInicio && d <= dataFim;
    });

    console.log(`[AnaliseHumorService] Registros encontrados para ${docIdSemana}:`, registrosSemana.length);

    // Se o usuário não fez nenhum registro naquela semana, não gera análise
    if (registrosSemana.length === 0) {
      console.log("[AnaliseHumorService] Nenhum registro na janela semanal. Análise não gerada.");
      return { gerouNova: false, analise: null };
    }

    // 4. Processa estatísticas da semana (Humores e Fatores)
    const contagemHumor = {};
    const contagemTags = {};

    registrosSemana.forEach(r => {
      const h = r.humor || "Neutro";
      contagemHumor[h] = (contagemHumor[h] || 0) + 1;

      if (Array.isArray(r.fatores)) {
        r.fatores.forEach(f => {
          contagemTags[f] = (contagemTags[f] || 0) + 1;
        });
      }
    });

    // Ordena primeiro pela maior quantidade; em caso de empate, usa a ordem de prioridade
    const entradasOrdenadas = Object.entries(contagemHumor).sort(([humorA, countA], [humorB, countB]) => {
      if (countB !== countA) {
        return countB - countA; // Maior frequência primeiro
      }
      const pesoA = PRIORIDADE_HUMOR[humorA.toLowerCase().trim()] || 0;
      const pesoB = PRIORIDADE_HUMOR[humorB.toLowerCase().trim()] || 0;
      return pesoB - pesoA; // Maior prioridade primeiro em caso de empate
    });

    const humorPredominante = entradasOrdenadas[0][0];
    const chaveNormalizada = humorPredominante.toLowerCase().trim();
    const emojiPredominante = 
      registrosSemana.find(r => r.humor === humorPredominante)?.emoji || 
      EMOJI_PADRAO[chaveNormalizada] || 
      "🙂";

    const fatoresMaisComuns = Object.keys(contagemTags)
      .sort((a, b) => contagemTags[b] - contagemTags[a])
      .slice(0, 3);

    // 5. Chamada da IA passando o consolidado dos 7 dias
    let feedbackIA = "";
    try {
      feedbackIA = await geraRelatorioSemanal({
        totalRegistros: registrosSemana.length,
        humorPredominante,
        fatoresMaisComuns,
        atividadesConcluidas: []
      });
    } catch {
      feedbackIA = `Nesta semana seu humor predominante foi ${humorPredominante.toLowerCase()}. Respeite seus ciclos e acolha seus sentimentos.`;
    }

    // Gera o rótulo baseado no domingo de fechamento daquela semana
    const rotuloSemana = rotuloSemanaMes(ultimoDomingo);

    const novaAnalise = {
      id: docIdSemana,
      rotulo: rotuloSemana,
      totalRegistros: registrosSemana.length,
      humorPredominante,
      emojiPredominante,
      fatoresMaisComuns,
      textoFeedbackIA: feedbackIA,
      geradoEm: new Date().toISOString()
    };

    await setDoc(doc(db, "usuarios", uid, "analisesSemanais", docIdSemana), novaAnalise);
    console.log("[AnaliseHumorService] Análise semanal gerada e gravada com sucesso:", novaAnalise);
    
    return { gerouNova: true, analise: novaAnalise };

  } catch (erro) {
    console.error("[AnaliseHumorService] Erro:", erro);
    return { gerouNova: false, analise: null };
  }
}