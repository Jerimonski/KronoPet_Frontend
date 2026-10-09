// Endpoint de correo SOLO para desarrollo: `POST /api/mail/send` en el
// servidor de Vite reenvía el correo a Resend. La API key queda en el
// proceso de Node (variables sin prefijo VITE_ no llegan al navegador).
// En producción este endpoint lo implementa el backend.

import type { IncomingMessage, ServerResponse } from "node:http";
import type { Connect, Plugin } from "vite";

interface MailEnv {
  RESEND_API_KEY?: string;
  RESEND_FROM?: string;
}

interface MailBody {
  to?: unknown;
  subject?: unknown;
  html?: unknown;
  text?: unknown;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function readJson(req: IncomingMessage): Promise<MailBody> {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 200_000) reject(new Error("Cuerpo demasiado grande."));
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}") as MailBody);
      } catch {
        reject(new Error("JSON inválido."));
      }
    });
    req.on("error", reject);
  });
}

function reply(res: ServerResponse, status: number, body: object) {
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(body));
}

export function mailDevServer(env: MailEnv): Plugin {
  const handler: Connect.NextHandleFunction = async (req, res, next) => {
    if (req.url !== "/api/mail/send") return next();
    if (req.method !== "POST") return reply(res, 405, { error: "Método no permitido." });
    if (!env.RESEND_API_KEY) {
      return reply(res, 503, {
        error: "Falta RESEND_API_KEY en .env.local (reinicia `npm run dev` después de agregarla).",
      });
    }

    let body: MailBody;
    try {
      body = await readJson(req);
    } catch (err) {
      return reply(res, 400, { error: (err as Error).message });
    }
    const { to, subject, html, text } = body;
    if (typeof to !== "string" || !EMAIL_RE.test(to) || typeof subject !== "string" || typeof html !== "string") {
      return reply(res, 400, { error: "Se requieren `to` (un correo), `subject` y `html`." });
    }

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: env.RESEND_FROM || "KronoPet <onboarding@resend.dev>",
          to: [to],
          subject,
          html,
          text: typeof text === "string" ? text : undefined,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as { id?: string; message?: string };
      if (!response.ok) {
        return reply(res, 502, { error: `Resend: ${data.message ?? `error ${response.status}`}` });
      }
      return reply(res, 200, { id: data.id });
    } catch {
      return reply(res, 502, { error: "No se pudo conectar con Resend." });
    }
  };

  return {
    name: "kronopet-mail-dev-server",
    configureServer: (server) => void server.middlewares.use(handler),
    configurePreviewServer: (server) => void server.middlewares.use(handler),
  };
}
