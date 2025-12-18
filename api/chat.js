import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  // Configuração de CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Método não permitido" });

  try {
    const { message, mensagem } = req.body;
    const textoFinal = message || mensagem;

    if (!textoFinal) {
      console.error("DEBUG: Requisição sem corpo de mensagem.");
      return res.status(400).json({ error: "Mensagem não informada" });
    }

    // 1. Validação da Chave de API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("DEBUG ERRO: GEMINI_API_KEY não encontrada no process.env");
      return res.status(500).json({ error: "Configuração ausente: GEMINI_API_KEY" });
    }

    // --- PROMPTS ---
    const sistema = `Você é o VERBO DIGITAL... (seu texto completo)`;
    const exemplos = `1 Exemplo — CONSOL0... (seu texto completo)`;

    // 2. Inicialização do Modelo
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // NOTA: Recomendo mudar para "gemini-1.5-flash" se o erro 500 persistir
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const promptFinal = `${sistema}\n\nExemplos de referência:\n${exemplos}\n\nPergunta do usuário:\n${textoFinal}`;

    console.log("DEBUG: Enviando prompt para o Google Gemini...");

    const result = await model.generateContent(promptFinal);
    
    // 3. Validação da Resposta
    if (!result || !result.response) {
      throw new Error("O Google Gemini retornou uma resposta vazia.");
    }

    const resposta = result.response.text();
    console.log("DEBUG: Resposta gerada com sucesso.");

    return res.status(200).json({ resposta, response: resposta });

  } catch (error) {
    // ESTE LOG APARECERÁ NO DASHBOARD DA VERCEL (Aba Logs)
    console.error("========== ERRO NA API CHAT ==========");
    console.error("Mensagem:", error.message);
    console.error("Stack:", error.stack);
    
    // Se o erro vier do Google, ele pode ter detalhes extras
    if (error.response) {
      console.error("Detalhes do Google:", JSON.stringify(error.response, null, 2));
    }
    console.error("======================================");

    return res.status(500).json({ 
      error: "Erro interno no servidor", 
      tipo: error.name,
      detalhes: error.message 
    });
  }
}