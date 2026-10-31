// Point d'entrée Vercel : Slack envoie ici chaque mention du bot et chaque message privé.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { waitUntil } from "@vercel/functions";
import { decider, type ConfigCanaux } from "../../lib/routing.js";
import { chargerFiches, reglesCommunes } from "../../lib/knowledge.js";
import { construireSysteme, demander, MARQUEUR_ESCALADE } from "../../lib/claude.js";
import { estMembreGro, historiqueDuFil, nettoyer, repondre, signatureValide, slack } from "../../lib/slack.js";

interface EvenementSlack {
  type: string;
  subtype?: string;
  user?: string;
  bot_id?: string;
  text?: string;
  channel: string;
  channel_type?: string;
  ts: string;
  thread_ts?: string;
}

let configCache: ConfigCanaux | null = null;
async function config(): Promise<ConfigCanaux> {
  if (!configCache) {
    const brut = await readFile(path.join(process.cwd(), "config", "canaux.json"), "utf8");
    configCache = JSON.parse(brut) as ConfigCanaux;
  }
  return configCache;
}

let botUserId: string | null = null;
async function idDuBot(): Promise<string> {
  if (!botUserId) botUserId = (await slack.auth.test()).user_id ?? "";
  return botUserId;
}

export async function POST(request: Request): Promise<Response> {
  const corps = await request.text();

  if (!signatureValide(corps, request.headers.get("x-slack-request-timestamp"), request.headers.get("x-slack-signature"))) {
    return new Response("signature invalide", { status: 401 });
  }

  const charge = JSON.parse(corps);

  // Vérification de l'URL lors de la configuration de l'app Slack.
  if (charge.type === "url_verification") {
    return Response.json({ challenge: charge.challenge });
  }

  // Slack renvoie l'événement s'il n'a pas eu de réponse assez vite : on ignore les reprises.
  if (request.headers.get("x-slack-retry-num")) return new Response("ok");

  const ev: EvenementSlack | undefined = charge.event;
  if (ev && charge.type === "event_callback") {
    const estMention = ev.type === "app_mention";
    const estPrive = ev.type === "message" && ev.channel_type === "im" && !ev.subtype;
    if ((estMention || estPrive) && ev.user && !ev.bot_id) {
      // On répond tout de suite à Slack (moins de 3 s), le travail continue en arrière-plan.
      waitUntil(traiter(ev).catch((e) => console.error("Emperor: erreur", e)));
    }
  }

  return new Response("ok");
}

async function traiter(ev: EvenementSlack): Promise<void> {
  const filTs = ev.thread_ts ?? ev.ts;
  const membreGro = await estMembreGro(ev.user!);
  const decision = decider(await config(), {
    canal: ev.channel,
    typeCanal: ev.channel_type ?? (ev.channel.startsWith("D") ? "im" : "channel"),
    estMembreGro: membreGro,
  });

  console.log("Emperor:", JSON.stringify({ canal: ev.channel, user: ev.user, decision }));

  if (decision.action === "ignorer") return;
  if (decision.action === "refuser") {
    await repondre(ev.channel, filTs, decision.raison);
    return;
  }

  const question = nettoyer(ev.text ?? "");
  if (!question) return;

  const [regles, fiches, bot] = await Promise.all([reglesCommunes(), chargerFiches(decision), idDuBot()]);
  const systeme = construireSysteme(
    regles,
    fiches,
    decision.public,
    decision.public === "client" ? decision.client : undefined
  );

  let tours = ev.thread_ts ? await historiqueDuFil(ev.channel, ev.thread_ts, bot) : [];
  if (!tours.length || tours[tours.length - 1].role !== "user") {
    tours = [...tours, { role: "user", content: question }];
  }

  let reponse = await demander(systeme, tours);

  if (reponse.includes(MARQUEUR_ESCALADE)) {
    reponse = reponse.replaceAll(MARQUEUR_ESCALADE, "").trim();
    const josue = process.env.ESCALADE_USER_ID;
    if (josue) reponse += `\n\n<@${josue}>, peux-tu prendre le relais ?`;
  }

  await repondre(ev.channel, filTs, reponse || "Je n'ai pas de réponse pour l'instant.");
}
