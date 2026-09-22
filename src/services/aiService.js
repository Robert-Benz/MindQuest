import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Modelo estável e rápido para todas as rotas
const MODELO_PADRAO = "gemini-3.1-flash-lite";

// =========================================================================
// 1. INSIGHT DIÁRIO
// =========================================================================
export const gerarInsightDiario = async (respostasPerfil, humorHoje, totalAtividades = 0) => {
  const humor = humorHoje?.humor || "Bem";
  const nota = humorHoje?.nota || "";
  const fatores = Array.isArray(humorHoje?.fatores) ? humorHoje.fatores.join(", ") : (humorHoje?.fatores || "Geral");

  // Assinatura de Cache: Se o humor, a nota, as tags ou a contagem de tarefas não mudarem, não chama a API
  const assinaturaAtual = JSON.stringify({ humor, nota, fatores, totalAtividades });
  const cacheKey = "mindquest_insight_cache";
  const cacheSigKey = "mindquest_insight_sig";

  const cacheTexto = localStorage.getItem(cacheKey);
  const cacheSig = localStorage.getItem(cacheSigKey);

  if (cacheTexto && cacheSig === assinaturaAtual) {
    return cacheTexto;
  }

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-lite",
      generationConfig: {
        maxOutputTokens: 110,
        temperature: 0.75,
      },
    });

    const prompt = `
      Você é a inteligência emocional do MindQuest. Fale diretamente com o usuário como um amigo próximo (2ª pessoa "você").

      CHECK-IN DE HOJE DO USUÁRIO:
      - Sentimento registrado: ${humor} ${humorHoje?.emoji || ""}
      - O que impactou o dia (tags): ${fatores}
      - Nota/Desabafo pessoal escrito: "${nota}"
      - Tarefas concluídas hoje: ${totalAtividades}

      GOSTOS DO USUÁRIO:
      - Música: ${respostasPerfil?.music || "música agradável"}
      - Filmes e Leituras: ${respostasPerfil?.movies || respostasPerfil?.livro || "boas histórias"}

      DIRETRIZES DE COMUNICAÇÃO E PSICOEDUCAÇÃO:

      1. TOLERÂNCIA A PARADOXOS EMOCIONAIS:
         - Reconheça que sentimentos contraditórios coexistem. Estar de férias ou num momento bom e ainda assim sentir ansiedade, culpa ou exaustão é normal.
         - Nunca descarte o sentimento ruim apenas porque o cenário externo parece favorável.

      2. COMBATE TOTAL À POSITIVIDADE TÓXICA E COACHING:
         - Proibido usar jargões motivacionais ("sorria", "deixe para lá", "supere", "foco na vitória", "veja pelo lado bom").
         - Se o estado for difícil (Ansioso, Triste, Raiva), o objetivo NÃO é consertar a emoção, e sim dar permissão para senti-la sem culpa.

      3. ANCORAGEM NO CORPO E NO PRESENTE (REGULAÇÃO SOMÁTICA):
         - Quando houver ansiedade ou sobrecarga, convide a pessoa a aterrar: soltar os ombros, respirar sem pressa ou reduzir estímulos.
         - Nunca sugira estímulos hiperativos (música estridente, filmes agitados, correr para produzir) quando o usuário estiver em estado de alerta.

      4. DESCONSTRUÇÃO DA AUTOCOBRANÇA:
         - Não faça o descanso parecer mais uma tarefa ou meta a cumprir ("você precisa relaxar"). Descansar também inclui aceitar o tédio, a lentidão ou a mente inquieta.
         - Se houver tarefas concluídas (${totalAtividades}), valorize o esforço já feito como suficiente. Se não houver nenhuma, reforce que pausar não é fracasso.

      5. USO ÉTICO DAS PREFERÊNCIAS:
         - Só mencione hobbies (música, livros) se isso servir como refúgio seguro e condizer com o humor. Se for forçado, ignore as preferências e foque no acolhimento verbal.

      6. ESTRUTURA E FORMATO:
         - Entregue exatamente entre 2 e 3 frases curtas e fluidas (máximo 40 palavras).
         - Não use aspas, tópicos ou saudações robóticas.
    `;

    const resultado = await model.generateContent(prompt);
    const response = await resultado.response;
    const textoGerado = response.text().trim().replace(/^["'“”]+|["'“”]+$/g, "");

    localStorage.setItem(cacheKey, textoGerado);
    localStorage.setItem(cacheSigKey, assinaturaAtual);

    return textoGerado;
  } catch (error) {
    console.error("Erro detalhado no Insight:", error);
    if (humor.toLowerCase().includes("ansioso") || humor.toLowerCase().includes("raiva") || humor.toLowerCase().includes("triste")) {
      return "Respire fundo e dê um passo de cada vez. Respeitar o seu próprio ritmo hoje já é uma vitória valiosa.";
    }

    return "Que o seu dia encontre momentos de calma e clareza. Siga em frente no seu próprio ritmo! ✨";
  }
};

// =========================================================================
// 2. RELATÓRIO SEMANAL
// =========================================================================
export const gerarRelatorioSemanalIA = async (dadosSemana, dadosPerfil = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODELO_PADRAO,
      generationConfig: {
        maxOutputTokens: 500, // Ajustado: 100 tokens cortaria o texto no meio
        temperature: 0.7,
      },
    });

    const prompt = `
      Você é a inteligência artificial do aplicativo MindQuest.
      Gere uma análise semanal empática, acolhedora e breve (máximo de 2 parágrafos curtos) para o fechamento de semana.

      PERFIL DO USUÁRIO:
      - Foco principal: ${dadosPerfil?.objetivoPrincipal || "Equilíbrio emocional"}
      - Personalidade: ${dadosPerfil?.personality || "Não informado"}

      DADOS DA SEMANA:
      - Total de registros de humor: ${dadosSemana?.totalRegistros || 0}
      - Humor predominante: ${dadosSemana?.humorPredominante || "Estável"}
      - Fatores de maior impacto: ${dadosSemana?.fatoresMaisComuns?.join(", ") || "Variados"}
      - Atividades que realizou: ${dadosSemana?.atividadesConcluidas?.join(", ") || "Nenhuma registrada"}

      DIRETRIZES:
      - Valide o estado emocional sem julgamentos.
      - Relacione os fatores com o humor sentido.
      - Encerre com um incentivo prático para a semana seguinte.
      - Texto corrido, sem títulos ou marcadores.
    `;

    const resultado = await model.generateContent(prompt);
    return (await resultado.response).text().trim();
  } catch (error) {
    console.error("Erro ao gerar relatório semanal:", error);
    return "Notamos que seus dias trouxeram reflexões importantes sobre sua rotina. Respeite o seu ritmo e acolha seus sentimentos. Uma nova semana é uma oportunidade para recomeçar com leveza! ✨";
  }
};

// =========================================================================
// 3. GERAÇÃO DE ATIVIDADES PERSONALIZADAS
// =========================================================================
export const gerarAtividadesPersonalizadas = async (
  dadosPerfil, 
  ultimoHumor, 
  atividadesExistentes = []
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODELO_PADRAO,
      generationConfig: {
        maxOutputTokens: 800,
        temperature: 0.9, // Aumentado para gerar ideias diferentes e variadas
      },
    });

    const titulosEvitar = atividadesExistentes.length > 0 
      ? `- ATENÇÃO: NÃO sugira nenhuma destas atividades já existentes: "${atividadesExistentes.join('", "')}". Gere coisas novas!` 
      : "";

    const prompt = `
      Você é o recomendador de hábitos do aplicativo MindQuest.
      Gere 3 missões leves, criativas e práticas para hoje considerando as informações:

      Contexto:
      - Humor atual: ${ultimoHumor?.humor || "Neutro"} (${ultimoHumor?.emoji || "😐"})
      - Desabafo/Nota: "${ultimoHumor?.nota || "Sem anotações"}"
      - Objetivo do perfil: ${dadosPerfil?.objetivoPrincipal || "Bem-estar"}
      - Preferências de lazer: Música (${dadosPerfil?.music || "Relaxante"}), Leitura (${dadosPerfil?.livro || "Geral"}), Filmes (${dadosPerfil?.movies || "Leves"})
      ${titulosEvitar}

      Retorne APENAS um array JSON válido no seguinte formato exato, sem explicações antes ou depois e sem marcações markdown:
      [
        {
          "titulo": "Título curto da missão",
          "descricao": "Explicação acolhedora em 1 linha",
          "categoria": "Relaxamento",
          "tempoEstimado": "10 min",
          "xp": 15
        }
      ]
    `;

    const resultado = await model.generateContent(prompt);
    let texto = await resultado.response.text();
    
    // Limpeza confiável do bloco de código JSON
    texto = texto.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    return JSON.parse(texto);
  } catch (error) {
    console.error("Erro ao gerar atividades personalizadas com IA:", error);
    return [
      {
        titulo: "Pausa de Respiração Guiada",
        descricao: "Reserve 5 minutos para inspirar profundamente e relaxar o corpo.",
        categoria: "Relaxamento",
        tempoEstimado: "5 min",
        xp: 10,
      },
      {
        titulo: "Caminhada Desconectada",
        descricao: "Dê uma breve caminhada ao ar livre sem olhar o celular.",
        categoria: "Movimento",
        tempoEstimado: "15 min",
        xp: 15,
      },
      {
        titulo: "Momento Musical",
        descricao: "Ouça duas músicas que te tragam sensação de calma ou ânimo.",
        categoria: "Criatividade",
        tempoEstimado: "8 min",
        xp: 10,
      },
    ];
  }
};