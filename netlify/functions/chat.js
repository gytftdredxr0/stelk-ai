// Proxy seguro hacia Hugging Face Inference Providers.
// El token de HF vive SOLO en la variable de entorno HF_TOKEN de Netlify,
// nunca llega al navegador del usuario.

const ALLOWED_MODELS = new Set([
  "openai/gpt-oss-20b",   // Pollant 1.0
  "openai/gpt-oss-120b",  // Olcus 2.1
]);

exports.handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }

  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: JSON.stringify({ error: "Método no permitido" }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "JSON inválido" }) };
  }

  const { model, messages, max_tokens } = payload;

  if (!ALLOWED_MODELS.has(model)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Motor no permitido" }) };
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Faltan mensajes" }) };
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Falta configurar la variable de entorno HF_TOKEN en Netlify." }),
    };
  }

  try {
    const upstream = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: Math.min(max_tokens || 500, 4096),
        temperature: 0.7,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return {
        statusCode: upstream.status,
        headers,
        body: JSON.stringify({ error: data.error || "Error de Hugging Face", details: data }),
      };
    }

    const content = data.choices?.[0]?.message?.content ?? "";
    return { statusCode: 200, headers, body: JSON.stringify({ content }) };
  } catch (err) {
    return { statusCode: 502, headers, body: JSON.stringify({ error: "Error al contactar con Hugging Face: " + String(err) }) };
  }
};
