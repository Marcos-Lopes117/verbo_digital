import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { mensagem } = req.body;

    if (!mensagem) {
      return res.status(400).json({ error: "Mensagem não informada" });
    }

    // Caminho absoluto para os prompts
    const basePath = path.join(process.cwd(), "prompts");

    const sistema = fs.readFileSync(
      path.join(basePath, "prompt_sistema.txt"),
      "utf8"
    );

    const exemplos = fs.readFileSync(
      path.join(basePath, "respostas_modelo.txt"),
      "utf8"
    );

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

    const model = genAI.getGenerativeModel({
      model: "gemini-3-flash-preview"
    });

    const promptFinal = `
${sistema}

Exemplos de referência:
${exemplos}

Pergunta do usuário:
${mensagem}
`;

    const result = await model.generateContent(promptFinal);
    const resposta = result.response.text();

    return res.status(200).json({ resposta });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro ao gerar resposta" });
  }
}
