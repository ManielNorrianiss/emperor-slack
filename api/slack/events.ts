// Point d'entrée Vercel : Slack envoie ici chaque mention du bot et chaque message privé.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { waitUntil } from "@vercel/functions";
import { decider, detecterClients, type ConfigCanaux, type ConfigClients } from "../../lib/routing.js";
import { ficheClient, fichesEquipe, reglesCommunes } from "../../lib/knowledge.js";
import { construireSysteme, demander, MARQUEUR_ESCALADE } from "../../lib/claude.js";
import { estMembreGro, historiqueDuFil, nettoyer, repondre, signatureValide, slack, type Tour } from "../../lib/slack.js";

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

const MAX_CLIENTS_PAR_QUESTION = 3;

async function lireJson<T>(fichier: string): Promise<T> {
  return JSON.parse(await readFile(path.join(process.cwd(), "config", fichier), "utf8")) as T;
}

let canauxCache: ConfigCanaux | null = null;
let clientsCache: ConfigClients | null = null;
const configCanaux = async () => (canauxCache ??= await lireJson<ConfigCanaux>("canaux.json"));
const configClients = async () => (clientsCache ??= await lireJson<ConfigClients>("clients.json"));

let botUserId: string | null = null;
async function idDuBot(): Promise<string> {
  if (!botUserId) botUserId = (await slack.auth.test()).user_id ?? "";
  return botUserId;
}

// Un même événement ne doit être traité qu'une fois (Slack peut le renvoyer).
const vus = new Map<string, number>();
function dejaVu(id: string | undefined): boolean {
  if (!id) return false;
  const maintenant = Date.now();
  for (const [cle, quand] of vus) if (maintenant - quand > 10 * 60 * 1000) vus.delete(cle);
  if (vus.has(id)) return true;
  vus.set(id, maintenant);
  return false;
}

export async function POST(request: Request): Promise<Response> {
  const corps = await request.text();

  if (!signatureValide(corps, request.headers.get("x-slack-request-timestamp"), request.headers.get("x-slack-signature"))) {
    return new Response("signature invalide", { status: 401 });
  }

  const charge = JSON.parse(corps);

  // Vérification de l'URL lors de la configuration de l'app Slack.
  if (charge.type === "url_verification") return Response.json({ challenge: charge.challenge });

  // Slack renvoie l'événement s'il n'a pas eu de réponse assez vite : on ignore les reprises.
  if (request.headers.get("x-slack-retry-num") || dejaVu(charge.event_id)) return new Response("ok");

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
  const question = nettoyer(ev.text ?? "");
  if (!question) return;

  const decision = decider(await configCanaux(), {
    canal: ev.channel,
    typeCanal: ev.channel_type ?? (ev.channel.startsWith("D") ? "im" : "channel"),
    estMembreGro: await estMembreGro(ev.user!),
  });

  if (decision.action === "ignorer") return;
  if (decision.action === "refuser") {
    await repondre(ev.channel, filTs, decision.raison);
    return;
  }

  const bot = await idDuBot();
  let tours: Tour[] = ev.thread_ts ? await historiqueDuFil(ev.channel, ev.thread_ts, bot) : [];
  if (!tours.length || tours[tours.length - 1].role !== "user") tours = [...tours, { role: "user", content: question }];

  // Quels clients charger ?
  let clients: string[];
  if (decision.public === "client") {
    clients = [decision.client];
  } else if (decision.client) {
    clients = [decision.client];
  } else {
    const cfg = await configClients();
    const texteDuFil = tours.filter((t) => t.role === "user").map((t) => t.content).join("\n");
    clients = detecterClients(cfg, texteDuFil);
    if (clients.length === 0 || clients.length > MAX_CLIENTS_PAR_QUESTION) {
      // Aucun appel à l'API : on demande de préciser.
      const noms = Object.values(cfg.clients).map((c) => c.nom).join(", ");
      const message =
        clients.length === 0
          ? `De quel client parles-tu ? Je connais : ${noms}.`
          : `Tu nommes ${clients.length} clients. Pose ta question sur ${MAX_CLIENTS_PAR_QUESTION} clients au maximum à la fois.`;
      console.log("Emperor:", JSON.stringify({ canal: ev.channel, public: "equipe", clients, action: "preciser" }));
      await repondre(ev.channel, filTs, message);
      return;
    }
  }

  console.log("Emperor:", JSON.stringify({ canal: ev.channel, user: ev.user, public: decision.public, clients }));

  const [regles, fiches] = await Promise.all([
    reglesCommunes(),
    decision.public === "client" ? ficheClient(clients[0]) : fichesEquipe(clients),
  ]);
  const systeme = construireSysteme(regles, fiches, decision.public, clients);

  let reponse = await demander(systeme, tours);

  if (reponse.includes(MARQUEUR_ESCALADE)) {
    reponse = reponse.replaceAll(MARQUEUR_ESCALADE, "").trim();
    const josue = process.env.ESCALADE_USER_ID;
    if (josue) reponse += `\n\n<@${josue}>, peux-tu prendre le relais ?`;
  }

  await repondre(ev.channel, filTs, reponse || "Je n'ai pas de réponse pour l'instant.");
}
