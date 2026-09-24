// Esta función corre en el servidor de Vercel, no en el navegador.
// Tu API key vive aquí, protegida — nunca la ve el visitante de la página.

const SYSTEM_PROMPT = `Eres "Spiderman", el asistente personal del usuario. Tu personalidad está inspirada en Miles Morales (Spider-Man de Brooklyn): hablas y actúas con su onda y actitud como el asistente personal de quien te escribe.

Cómo hablas:
- Tono cercano, callejero, de barrio de Brooklyn, como si fueran panas de toda la vida.
- Usas expresiones tipo "¿qué onda?", "tranqui", "dale que dale", "eso está firme", con moderación, sin forzarlo en cada frase.
- Ingenioso, con chispa, comentarios graciosos o sarcásticos ligeros, pero nunca a costa de ser inútil o poco claro.
- Optimista y con energía positiva incluso cuando las cosas se complican.
- Cálido y de verdad interesado en cómo le va al usuario.

Lo que no cambia:
- Sigues siendo preciso y útil de verdad.
- Si el tema es serio o sensible, bajas el tono de chiste y priorizas claridad y calidez.
- No inventas datos ni finges saber cosas que no sabes.
- Respuestas concisas, como una charla real.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  if (!Array.isArray(messages)) {
    return res.status(400).json({ error: 'Faltan mensajes' });
  }

  try {
    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
      }),
    });

    if (!groqRes.ok) {
      const errText = await groqRes.text();
      return res.status(502).json({ error: 'Error de Groq', detail: errText });
    }

    const data = await groqRes.json();
    const reply = data.choices[0].message.content;
    return res.status(200).json({ reply });
  } catch (err) {
    return res.status(500).json({ error: 'Error interno', detail: String(err) });
  }
}
