import { gerarDesenho } from "../../lib/desenho.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") {
    return new Response("Método não permitido", { status: 405, headers: { Allow: "POST" } });
  }

  let corpo;
  try {
    corpo = await request.json();
  } catch {
    return new Response("JSON inválido", { status: 400 });
  }
  const numero = corpo && corpo.numero;
  if (!Number.isInteger(numero) || numero < 1 || numero > 100) {
    return new Response("numero deve ser inteiro entre 1 e 100", { status: 400 });
  }

  const m = (request.headers.get("Authorization") || "").match(/^Bearer (.+)$/);
  if (!m) return new Response("Token ausente", { status: 401 });

  let info;
  try {
    const r = await fetch(
      "https://oauth2.googleapis.com/tokeninfo?id_token=" + encodeURIComponent(m[1])
    );
    if (r.status !== 200) return new Response("Token inválido", { status: 401 });
    info = await r.json();
  } catch {
    return new Response("Token inválido", { status: 401 });
  }

  if (
    info.aud !== env.GOOGLE_CLIENT_ID ||
    String(info.email_verified) !== "true" ||
    !info.email
  ) {
    return new Response("Token não aceito", { status: 401 });
  }

  return new Response(gerarDesenho(numero, info.email), {
    status: 200,
    headers: { "Content-Type": "image/svg+xml" }
  });
}
