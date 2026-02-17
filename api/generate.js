import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE;

    if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE) {
      return res.status(500).json({ error: "Missing environment variables" });
    }

    const supabase = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE
    );

    const promptText = `
Придумай уникальный AI-промт для YouTube канала.
Структура: хук, проблема, решение, призыв к действию.
Тематика: заработок с помощью ИИ в 2026 году.
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: promptText }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const generated =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "Ошибка генерации";

    await supabase.from("prompts").insert([
      {
        title: "AI YouTube сценарий",
        text: generated,
        category: "YouTube"
      }
    ]);

    return res.status(200).json({ success: true });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
