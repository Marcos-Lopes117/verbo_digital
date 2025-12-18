import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { message, mensagem } = req.body;
    const textoFinal = message || mensagem;

    if (!textoFinal) {
      return res.status(400).json({ error: "Mensagem não informada" });
    }

    const basePath = path.join(process.cwd(), "prompts");
    const sistema = fs.readFileSync(path.join(basePath, "prompt_sistema.txt"), "utf8");
    const exemplos = fs.readFileSync(path.join(basePath, "respostas_modelo.txt"), "utf8");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

    const promptFinal = `
${sistema}
Exemplos de referência:
${exemplos}
Pergunta do usuário:
${textoFinal}
`;

    const result = await model.generateContent(promptFinal);
    const resposta = result.response.text();

    return res.status(200).json({ resposta, response: resposta });

  } catch (error) {
    console.error("Erro na API:", error);
    return res.status(500).json({ error: "Erro ao gerar resposta", detalhes: error.message });
  }
}