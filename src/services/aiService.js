import { GoogleGenerativeAI } from "@google/generative-ai";

console.log("Minha chave carregada:", import.meta.env.VITE_GEMINI_API_KEY);

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

export const gerarInsightDiario = async (dadosUsuario, humorHoje) => {
  try {
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      Você é a inteligência emocional do aplicativo MindQuest. Seu objetivo é ser um ombro amigo, extremamente humano, empático e acolhedor.
      
      O usuário acabou de fazer o check-in diário. 
      
      CONTEXTO DO DIA (PRIORIDADE MÁXIMA):
      - Humor: ${humorHoje.humor} ${humorHoje.emoji}
      - Desabafo/Nota que o usuário escreveu: "${humorHoje.nota || "Nenhum desabafo escrito."}"
      - Clima de hoje: ${humorHoje.clima?.condicao || "Não informado"}
      - Dia: ${humorHoje.tipoDia || "Dia comum"}
      
      PERFIL DO USUÁRIO (Use apenas se fizer sentido para consolar ou distrair):
      - Foco principal: ${dadosUsuario.objetivoPrincipal || "Bem-estar"}
      - Estilo de filme: ${dadosUsuario.generoFilme || "Leve"}
      - Estilo de música: ${dadosUsuario.generoMusical || "Relaxante"}
      - Leitura favorita: ${dadosUsuario.generoLivro || "Mistério/Suspense"}
      
      INSTRUÇÕES ESTRITAS:
      1. Se o usuário escreveu um "Desabafo/Nota", DÊ PRIORIDADE ABSOLUTA A ISSO. Valide os sentimentos dele imediatamente. (Ex: se ele perdeu um pet, sinta muito por isso).
      2. NUNCA seja "positividade tóxica". Se o usuário estiver triste, frustrado ou com raiva, seja compreensivo e não force alegria.
      3. Use as informações de clima, dia ou perfil (filmes/livros) como uma sugestão suave e natural para ajudar no momento, MAS SÓ se couber no contexto.
      4. Escreva em parágrafo único, como se fosse uma mensagem de WhatsApp de um amigo muito querido.
      5. Máximo de 3 ou 4 linhas. Não use negritos, tópicos ou títulos.
    `;

    const resultado = await model.generateContent(prompt);
    const respostaTexto = await resultado.response.text();
    
    return respostaTexto;
  } catch (error) {
    console.error("Erro detalhado da API do Gemini:", error);
    return "Houve uma falha de conexão com a Inteligência Artificial. Por favor, verifique se a chave de API está correta no arquivo .env!";
  }
};