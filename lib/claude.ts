import Anthropic from "@anthropic-ai/sdk";
import type { Tour } from "./slack.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODELE = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export const MARQUEUR_ESCALADE = "[ESCALADE]";

function consignesPublic(publicVise: "client" | "equipe", client?: string): string {
  if (publicVise === "client") {
    return [
      `Tu réponds dans le canal partagé entre GRO et le client « ${client} ». Ce que tu écris est lu par le client.`,
      "Tu n'as reçu QUE la version client de sa fiche. Tu ne connais rien d'autre sur GRO ou sur d'autres clients, et tu ne prétends jamais le contraire.",
    ].join("\n");
  }
  return [
    "Tu réponds à un membre de l'équipe GRO, dans un canal interne ou en privé.",
    "Tu as reçu les fiches de tous les clients, version client et version équipe. Précise de quel client tu parles.",
  ].join("\n");
}

export function construireSysteme(regles: string, fiches: string, publicVise: "client" | "equipe", client?: string): string {
  return [
    "Tu es Emperor, l'assistant de Josué, pilote monday.com chez Agence GRO.",
    consignesPublic(publicVise, client),
    "",
    "<regles>",
    regles,
    "</regles>",
    "",
    "<fiches>",
    fiches,
    "</fiches>",
    "",
    "Format : réponse courte en français, mise en forme Slack (*gras*, listes avec •), pas de titres markdown.",
    `Si la réponse n'est pas dans les fiches, ou si on te demande une modification ou une nouvelle fonction, dis-le simplement et termine ta réponse par ${MARQUEUR_ESCALADE} sur sa propre ligne. N'invente jamais.`,
  ].join("\n");
}

export async function demander(systeme: string, tours: Tour[]): Promise<string> {
  const res = await anthropic.messages.create({
    model: MODELE,
    max_tokens: 1200,
    system: systeme,
    messages: tours.map((t) => ({ role: t.role, content: t.content })),
  });
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
