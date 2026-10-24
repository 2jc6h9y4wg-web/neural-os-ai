// Netlify Function: proxies chat requests to Hugging Face without exposing HF_TOKEN.
export default async (request) => {
  if (request.method === "GET") {
    return Response.json({ ok: true, service: "NEURAL OS cloud chat" });
  }

  if (request.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  const token = process.env.HF_TOKEN;
  if (!token) {
    return Response.json({ error: "На сервере не настроен HF_TOKEN." }, { status: 500 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Некорректный JSON-запрос." }, { status: 400 });
  }

  const incoming = Array.isArray(body.messages) ? body.messages : [];
  const allowedRoles = new Set(["system", "user", "assistant"]);
  const messages = incoming
    .filter((m) => m && allowedRoles.has(m.role) && typeof m.content === "string")
    .slice(-21)
    .map((m) => ({
      role: m.role,
      content: m.content.slice(0, 6000),
    }));

  if (!messages.length || !messages.some((m) => m.role === "user")) {
    return Response.json({ error: "Добавьте текст запроса." }, { status: 400 });
  }

  try {
    const upstream = await fetch("https://router.huggingface.co/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "Qwen/Qwen2.5-7B-Instruct:fastest",
        messages,
        max_tokens: 350,
        temperature: 0.7,
        stream: false,
      }),
    });

    const data = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      console.error("Hugging Face upstream error:", upstream.status, JSON.stringify(data).slice(0, 1200));
      return Response.json(
        { error: upstream.status === 429
            ? "Лимит запросов облачного ИИ временно исчерпан. Попробуйте позже."
            : "Облачный ИИ не смог обработать запрос. Проверьте доступ и лимиты Hugging Face." },
        { status: upstream.status === 429 ? 429 : 502 }
      );
    }

    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return Response.json({ error: "Модель вернула пустой ответ." }, { status: 502 });
    }

    return Response.json({ reply: reply.slice(0, 12000) });
  } catch (error) {
    console.error("Chat function failed:", error);
    return Response.json({ error: "Не удалось связаться с облачным ИИ." }, { status: 502 });
  }
};
