import { createHmac, timingSafeEqual } from "node:crypto";
import { WebClient } from "@slack/web-api";

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Vérifie que la requête vient bien de Slack (signature + fraîcheur de 5 minutes).
export function signatureValide(corpsBrut: string, horodatage: string | null, signature: string | null): boolean {
  const secret = process.env.SLACK_SIGNING_SECRET;
  if (!secret || !horodatage || !signature) return false;
  const age = Math.abs(Date.now() / 1000 - Number(horodatage));
  if (!Number.isFinite(age) || age > 300) return false;
  const attendu = "v0=" + createHmac("sha256", secret).update(`v0:${horodatage}:${corpsBrut}`).digest("hex");
  const a = Buffer.from(attendu);
  const b = Buffer.from(signature);
  return a.length === b.length && timingSafeEqual(a, b);
}

// Membre de GRO = compte du Slack de GRO, pas invité, pas externe (Slack Connect).
// En cas de doute ou d'erreur : NON.
export async function estMembreGro(userId: string): Promise<boolean> {
  const equipeGro = process.env.GRO_TEAM_ID;
  if (!equipeGro) return false;
  try {
    const { user } = await slack.users.info({ user: userId });
    if (!user) return false;
    const u = user as typeof user & { is_stranger?: boolean };
    return (
      u.team_id === equipeGro &&
      !u.is_bot &&
      !u.deleted &&
      !u.is_restricted &&
      !u.is_ultra_restricted &&
      !u.is_stranger
    );
  } catch {
    return false;
  }
}

export interface Tour {
  role: "user" | "assistant";
  content: string;
}

// Les derniers messages du fil, pour que le bot suive la conversation.
export async function historiqueDuFil(canal: string, filTs: string, botUserId: string): Promise<Tour[]> {
  try {
    const res = await slack.conversations.replies({ channel: canal, ts: filTs, limit: 20 });
    const tours: Tour[] = [];
    for (const m of res.messages ?? []) {
      const texte = nettoyer(m.text ?? "");
      if (!texte) continue;
      const role = m.user === botUserId || m.bot_id ? "assistant" : "user";
      const precedent = tours[tours.length - 1];
      if (precedent && precedent.role === role) precedent.content += "\n\n" + texte;
      else tours.push({ role, content: texte });
    }
    while (tours.length && tours[0].role === "assistant") tours.shift();
    return tours;
  } catch {
    return [];
  }
}

// Retire les mentions du bot (<@U123>) du texte.
export function nettoyer(texte: string): string {
  return texte.replace(/<@[A-Z0-9]+>/g, "").trim();
}

export async function repondre(canal: string, filTs: string, texte: string): Promise<void> {
  await slack.chat.postMessage({ channel: canal, thread_ts: filTs, text: texte, unfurl_links: false });
}
