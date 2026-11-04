import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const MODELO_PADRAO = "gemini-3.1-flash-lite";

// Helper para tratar tanto respostas únicas (string) quanto múltiplas (array)
const formatarResposta = (resposta, fallback = "Geral") => {
  if (Array.isArray(resposta)) {
    return resposta.length > 0 ? resposta.join(", ") : fallback;
  }
  return resposta || fallback;
};

// =========================================================================
// 1. INSIGHT DIÁRIO
// =========================================================================
export const geraInsightDiario = async (respostasPerfil, humorHoje, totalAtividades = 0) => {
  const humor = humorHoje?.humor || "Bem";
  const nota = humorHoje?.nota || "";
  const fatores = formatarResposta(humorHoje?.fatores, "Geral");

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
      model: MODELO_PADRAO,
      generationConfig: { maxOutputTokens: 110, temperature: 0.75 },
    });

    const prefMusica = formatarResposta(respostasPerfil?.music, "música agradável");
    const prefFilmes = formatarResposta(respostasPerfil?.movies, "boas histórias");

    const prompt = `
      Você é a inteligência emocional do MindQuest. Fale diretamente com o usuário como um amigo próximo (2ª pessoa "você").

      CHECK-IN DE HOJE DO USUÁRIO:
      - Sentimento registrado: ${humor} ${humorHoje?.emoji || ""}
      - O que impactou o dia (tags): ${fatores}
      - Nota/Desabafo pessoal escrito: "${nota}"
      - Tarefas concluídas hoje: ${totalAtividades}

      GOSTOS DO USUÁRIO:
      - Música: ${prefMusica}
      - Filmes e Leituras: ${prefFilmes}

      DIRETRIZES DE COMUNICAÇÃO E PSICOEDUCAÇÃO:
      1. TOLERÂNCIA A PARADOXOS EMOCIONAIS: Nunca descarte o sentimento ruim apenas porque o cenário externo parece favorável.
      2. COMBATE TOTAL À POSITIVIDADE TÓXICA: Proibido usar jargões motivacionais ("sorria", "veja pelo lado bom").
      3. ANCORAGEM NO CORPO E NO PRESENTE (REGULAÇÃO SOMÁTICA): Quando houver ansiedade ou sobrecarga, convide a pessoa a aterrar.
      4. DESCONSTRUÇÃO DA AUTOCOBRANÇA: Se houver tarefas concluídas, valorize o esforço já feito.
      5. USO ÉTICO DAS PREFERÊNCIAS: Só mencione hobbies se isso servir como refúgio seguro.
      6. SINERGIA CLÍNICA: Se o usuário respondeu que "Sim, já faz acompanhamento", você pode ocasionalmente (e de forma muito sutil) sugerir que ele leve reflexões densas para a sessão de terapia.
      7. ESTRUTURA E FORMATO: Entregue exatamente entre 2 e 3 frases curtas e fluidas (máximo 40 palavras). Não use aspas, tópicos ou saudações robóticas.
    `;

    const resultado = await model.generateContent(prompt);
    const textoGerado = (await resultado.response).text().trim().replace(/^["'“”]+|["'“”]+$/g, "");

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
export const geraRelatorioSemanal = async (dadosSemana, dadosPerfil = {}) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODELO_PADRAO,
      generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
    });

    const prefFoco = formatarResposta(dadosPerfil?.objetivoPrincipal, "Equilíbrio emocional");
    const prefPersonalidade = formatarResposta(dadosPerfil?.personality, "Não informado");
    const fatores = formatarResposta(dadosSemana?.fatoresMaisComuns, "Variados");
    const atividades = formatarResposta(dadosSemana?.atividadesConcluidas, "Nenhuma registrada");

    const prompt = `
      Você é a inteligência artificial do aplicativo MindQuest.
      Gere uma análise semanal empática, acolhedora e breve (máximo de 2 parágrafos curtos) para o fechamento de semana.

      PERFIL DO USUÁRIO:
      - Foco principal: ${prefFoco}
      - Personalidade: ${prefPersonalidade}

      DADOS DA SEMANA:
      - Total de registros de humor: ${dadosSemana?.totalRegistros || 0}
      - Humor predominante: ${dadosSemana?.humorPredominante || "Estável"}
      - Fatores de maior impacto: ${fatores}
      - Atividades que realizou: ${atividades}

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
export const geraAtividades = async (
  dadosPerfil, 
  ultimoHumor, 
  atividadesExistentes = [],
  quantidade = 3
) => {
  try {
    const model = genAI.getGenerativeModel({
      model: MODELO_PADRAO,
      generationConfig: { maxOutputTokens: 800, temperature: 0.9 },
    });

    const titulosEvitar = atividadesExistentes.length > 0 
      ? `- ATENÇÃO: NÃO sugira nenhuma destas atividades já existentes: "${atividadesExistentes.join('", "')}". Gere novas atividades!` 
      : "";

    // Convertendo os arrays do perfil para textos puros
    const tempoLivre = formatarResposta(dadosPerfil?.time, "De 15 a 30 minutos");
    const prefMusica = formatarResposta(dadosPerfil?.music, "Relaxante");
    const prefLivros = formatarResposta(dadosPerfil?.livro, "Geral");
    const prefFilmes = formatarResposta(dadosPerfil?.movies, "Leves");
    const prefObjetivo = formatarResposta(dadosPerfil?.objetivoPrincipal, "Bem-estar");

    const prompt = `
      Você é o recomendador de hábitos do aplicativo MindQuest.
      Gere ${quantidade} missões leves, criativas e práticas para hoje considerando as informações:

      Contexto:
      - Tempo livre disponível por dia: ${tempoLivre}
      - Humor atual: ${ultimoHumor?.humor || "Neutro"} (${ultimoHumor?.emoji || "😐"})
      - Desabafo/Nota: "${ultimoHumor?.nota || "Sem anotações"}"
      - Objetivo do perfil: ${prefObjetivo}
      - Preferências de lazer: Música (${prefMusica}), Leitura (${prefLivros}), Filmes (${prefFilmes})
      ${titulosEvitar}
      - Sempre que a missão envolver música, leitura ou filmes, sugira uma obra ou artista real que combine com as preferências de lazer do usuário.

      REGRAS DE TEMPO (MUITO IMPORTANTE):
      Adapte a complexidade das missões para que o "tempoAtividade" caiba estritamente no "Tempo livre disponível por dia" do usuário.
      - Se for "Menos de 15 minutos", crie micro-hábitos ou pausas rápidas.
      - Se for "De 15 a 30 minutos", crie atividades curtas, mas significativas.
      - Se for "Mais de 1 hora", sinta-se livre para sugerir imersões maiores, mas mantenha a praticidade.
      - O campo "tempoAtividade" retornado no JSON deve refletir essas regras.

      Retorne APENAS um array JSON válido no seguinte formato exato, sem explicações antes ou depois e sem marcações markdown:
      [
        {
          "titulo": "Título curto da missão",
          "descricao": "Explicação acolhedora em 1 linha",
          "categoria": "Relaxamento",
          "tempoAtividade": "10 min",
          "xp": 15
        }
      ]
    `;

    const resultado = await model.generateContent(prompt);
    let texto = await resultado.response.text();
    
    texto = texto.replace(/```(?:json)?/gi, "").replace(/```/g, "").trim();
    
    return JSON.parse(texto);
  } catch (error) {
    console.error("Erro ao gerar atividades personalizadas com IA:", error);
    return [
      { titulo: "Pausa de Respiração Guiada", descricao: "Reserve 5 minutos para inspirar profundamente e relaxar o corpo.", categoria: "Relaxamento", tempoAtividade: "5 min", xp: 10 },
      { titulo: "Caminhada Desconectada", descricao: "Dê uma breve caminhada ao ar livre sem olhar o celular.", categoria: "Movimento", tempoAtividade: "15 min", xp: 15 },
      { titulo: "Momento Musical", descricao: "Ouça suas músicas favoritas.", categoria: "Criatividade", tempoAtividade: "8 min", xp: 10 }
    ].slice(0, quantidade);
  }
};