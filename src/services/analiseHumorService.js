import { collection, getDocs, doc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import { gerarRelatorioSemanalIA } from "./aiService";

// Converte qualquer formato de data do Firestore/JS
const converterParaData = (valor) => {
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

export async function analiseSemanal(uid) {
  try {
    const hoje = new Date();
    const docIdHoje = `analise_${formatarDataLocal(hoje)}`;

    // 1. Verifica se a análise de hoje já foi gerada
    const refAnalises = collection(db, "usuarios", uid, "analisesSemanais");
    const snapAnalises = await getDocs(refAnalises);
    const jaExisteHoje = snapAnalises.docs.some(d => d.id === docIdHoje);

    if (jaExisteHoje) {
      console.log("[AnaliseHumorService] Análise de hoje já existe.");
      return { gerouNova: false, analise: null };
    }

    // 2. Busca registros do dia anterior (ontem)
    const refHumor = collection(db, "usuarios", uid, "registrosHumor");
    const snapHumor = await getDocs(refHumor);
    
    const ontem = new Date(hoje);
    ontem.setDate(hoje.getDate() - 1);
    const dataOntemLocal = formatarDataLocal(ontem);

    const todosRegistros = snapHumor.docs.map(d => ({ id: d.id, ...d.data() }));

    const registosOntem = todosRegistros.filter(r => {
      const d = converterParaData(r.data || r.criadoEm);
      return d && formatarDataLocal(d) === dataOntemLocal;
    });

    console.log(`[AnaliseHumorService] Buscando registros de ontem (${dataOntemLocal}):`, registosOntem);

    // Se ontem não teve registro, não gera
    if (registosOntem.length === 0) {
      console.log("[AnaliseHumorService] Nenhum registro encontrado para ontem.");
      return { gerouNova: false, analise: null };
    }

    // 3. Frequência e desempate
    const contagemHumor = {};
    const contagemTags = {};

    registosOntem.forEach(r => {
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
      emojiPredominante = registosOntem.find(r => r.humor === humorPredominante)?.emoji || "🙂";
    }

    const fatoresMaisComuns = Object.keys(contagemTags)
      .sort((a, b) => contagemTags[b] - contagemTags[a])
      .slice(0, 3);

    // 4. Chamada da IA
    let feedbackIA = "";
    try {
      feedbackIA = await gerarRelatorioSemanalIA({
        totalRegistros: registosOntem.length,
        humorPredominante,
        fatoresMaisComuns,
        atividadesConcluidas: []
      });
    } catch {
      feedbackIA = `No dia de ontem notou-se um estado de humor ${humorPredominante.toLowerCase()}. Respeite seus ciclos e acolha seus sentimentos.`;
    }

    const dataRotulo = ontem.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" });
    const novaAnalise = {
      id: docIdHoje,
      rotulo: `Análise do dia ${dataRotulo}`,
      totalRegistros: registosOntem.length,
      humorPredominante,
      emojiPredominante,
      fatoresMaisComuns,
      textoFeedbackIA: feedbackIA,
      geradoEm: new Date().toISOString()
    };

    await setDoc(doc(db, "usuarios", uid, "analisesSemanais", docIdHoje), novaAnalise);
    console.log("[AnaliseHumorService] Análise gerada e gravada com sucesso:", novaAnalise);
    
    return { gerouNova: true, analise: novaAnalise };

  } catch (erro) {
    console.error("[AnaliseHumorService] Erro:", erro);
    return { gerouNova: false, analise: null };
  }
}