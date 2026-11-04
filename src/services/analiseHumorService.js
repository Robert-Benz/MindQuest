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
  // Capitaliza o mês
  const mesFormatado = nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1);
  
  return `${numeroSemana}ª semana de ${mesFormatado}`;
};

export async function analiseSemanal(uid) {
  try {
    const hoje = new Date();
    
    // Análise gerada apenas nos DOMINGOS
    if (hoje.getDay() !== 0) {
      console.log("[AnaliseHumorService] Hoje não é domingo. Nenhuma análise gerada.");
      return { gerouNova: false, analise: null };
    }

    // Identificador único para a análise de hoje (ex: analise_2026-11-08)
    const docIdHoje = `analise_${formatarDataLocal(hoje)}`;

    // 1. Verifica se a análise desta semana/hoje já foi gerada
    const refAnalises = collection(db, "usuarios", uid, "analisesSemanais");
    const snapAnalises = await getDocs(refAnalises);
    const jaExisteHoje = snapAnalises.docs.some(d => d.id === docIdHoje);

    if (jaExisteHoje) {
      console.log("[AnaliseHumorService] Análise desta semana já existe.");
      return { gerouNova: false, analise: null };
    }

    // 2. Define o intervalo dos últimos 7 dias (do domingo passado até agora)
    const dataFim = new Date(hoje); // Momento atual
    const dataInicio = new Date(hoje);
    dataInicio.setDate(hoje.getDate() - 7); // 7 dias atrás

    // 3. Busca todos os registros de humor do usuário
    const refHumor = collection(db, "usuarios", uid, "registrosHumor");
    const snapHumor = await getDocs(refHumor);
    const todosRegistros = snapHumor.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filtra os registros que caem dentro dos últimos 7 dias
    const registrosUltimaSemana = todosRegistros.filter(r => {
      const d = converteData(r.data || r.criadoEm);
      return d && d >= dataInicio && d <= dataFim;
    });

    console.log(`[AnaliseHumorService] Registros encontrados nos últimos 7 dias:`, registrosUltimaSemana.length);

    // Se o usuário não fez nenhum registro nos últimos 7 dias, não gera análise
    if (registrosUltimaSemana.length === 0) {
      console.log("[AnaliseHumorService] Nenhum registro nos últimos 7 dias. Análise não gerada.");
      return { gerouNova: false, analise: null };
    }

    // 4. Processa estatísticas da semana (Humores e Fatores)
    const contagemHumor = {};
    const contagemTags = {};
    const atividadesConcluidasSet = new Set();

    registrosUltimaSemana.forEach(r => {
      const h = r.humor || "Neutro";
      contagemHumor[h] = (contagemHumor[h] || 0) + 1;

      if (Array.isArray(r.fatores)) {
        r.fatores.forEach(f => {
          contagemTags[f] = (contagemTags[f] || 0) + 1;
        });
      }
    });

    const entradasHumor = Object.entries(contagemHumor);
    const maxFrequencia = Math.max(...entradasHumor.map(([_, count]) => count));
    const maisFrequentes = entradasHumor.filter(([_, count]) => count === maxFrequencia);

    let humorPredominante = "";
    let emojiPredominante = "✨";

    if (maisFrequentes.length > 1) {
      humorPredominante = "Variado";
      emojiPredominante = "⚖️";
    } else {
      humorPredominante = maisFrequentes[0][0];
      emojiPredominante = registrosUltimaSemana.find(r => r.humor === humorPredominante)?.emoji || "🙂";
    }

    const fatoresMaisComuns = Object.keys(contagemTags)
      .sort((a, b) => contagemTags[b] - contagemTags[a])
      .slice(0, 3);

    // 5. Chamada da IA passando o consolidado dos 7 dias
    let feedbackIA = "";
    try {
      feedbackIA = await geraRelatorioSemanal({
        totalRegistros: registrosUltimaSemana.length,
        humorPredominante,
        fatoresMaisComuns,
        atividadesConcluidas: []
      });
    } catch {
      feedbackIA = `Nesta semana seu humor predominante foi ${humorPredominante.toLowerCase()}. Respeite seus ciclos e acolha seus sentimentos.`;
    }

    // Gera o rótulo baseado na semana do mês (ex: 2ª semana de Novembro)
    const rotuloSemana = rotuloSemanaMes(hoje);

    const novaAnalise = {
      id: docIdHoje,
      rotulo: rotuloSemana,
      totalRegistros: registrosUltimaSemana.length,
      humorPredominante,
      emojiPredominante,
      fatoresMaisComuns,
      textoFeedbackIA: feedbackIA,
      geradoEm: new Date().toISOString()
    };

    await setDoc(doc(db, "usuarios", uid, "analisesSemanais", docIdHoje), novaAnalise);
    console.log("[AnaliseHumorService] Análise semanal gerada e gravada com sucesso:", novaAnalise);
    
    return { gerouNova: true, analise: novaAnalise };

  } catch (erro) {   // Mantido apenas se houver estrutura de try/catch padrão
    console.error("[AnaliseHumorService] Erro:", erro);
    return { gerouNova: false, analise: null };
  }
}