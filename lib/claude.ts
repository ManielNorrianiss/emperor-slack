import Anthropic from "@anthropic-ai/sdk";
import type { Tour } from "./slack.js";

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const MODELE = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

export const MARQUEUR_ESCALADE = "[ESCALADE]";

function consignesPublic(publicVise: "client" | "equipe", clients: string[]): string {
  if (publicVise === "client") {
    return [
      `Tu réponds dans le canal partagé entre GRO et le client « ${clients[0]} ». Ce que tu écris est lu par le client.`,
      "Tu n'as reçu QUE la version client de sa fiche. Tu ne connais rien d'autre sur GRO ou sur d'autres clients, et tu ne prétends jamais le contraire.",
    ].join("\n");
  }
  return [
    "Tu réponds à un membre de l'équipe GRO, dans un canal interne ou en privé.",
    `Tu as reçu la version client et la version équipe de : ${clients.join(", ")}. Si la question porte sur un autre client, dis que tu n'as pas sa fiche sous les yeux et demande de le nommer.`,
  ].join("\n");
}

// Le prompt système ne dépend que du public et des clients chargés : il est identique
// d'une question à l'autre, donc Anthropic peut le garder en cache (moins cher, plus rapide).
export function construireSysteme(
  regles: string,
  fiches: string,
  publicVise: "client" | "equipe",
  clients: string[]
): Anthropic.TextBlockParam[] {
  const texte = [
    "Tu es Emperor, l'assistant de Josué, pilote monday.com chez Agence GRO.",
    consignesPublic(publicVise, clients),
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
  return [{ type: "text", text: texte, cache_control: { type: "ephemeral" } }];
}

export async function demander(systeme: Anthropic.TextBlockParam[], tours: Tour[]): Promise<string> {
  const res = await anthropic.messages.create({
    model: MODELE,
    max_tokens: 1200,
    system: systeme,
    messages: tours.map((t) => ({ role: t.role, content: t.content })),
  });
  const u = res.usage;
  console.log(
    "Emperor: jetons",
    JSON.stringify({ entree: u.input_tokens, cache_lu: u.cache_read_input_tokens, cache_ecrit: u.cache_creation_input_tokens, sortie: u.output_tokens })
  );
  return res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}
