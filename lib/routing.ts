// Décide quelles fiches le bot a le droit de charger pour un message donné.
// C'est ici que l'étanchéité entre clients est garantie : le modèle ne reçoit
// jamais un fichier que ces fonctions n'ont pas autorisé.

export type Public = "client" | "equipe";

export interface CanalConfig {
  client?: string;
  public: Public;
}

export interface ConfigCanaux {
  canaux: Record<string, CanalConfig>;
}

export interface ClientConfig {
  nom: string;
  alias: string[];
}

export interface ConfigClients {
  clients: Record<string, ClientConfig>;
}

export interface Contexte {
  canal: string;
  typeCanal: string;
  estMembreGro: boolean;
}

export type Decision =
  | { action: "repondre"; public: "client"; client: string }
  | { action: "repondre"; public: "equipe"; client?: string }
  | { action: "refuser"; raison: string }
  | { action: "ignorer" };

export const SLUG = /^[a-z0-9-]{2,40}$/;

export function decider(config: ConfigCanaux, ctx: Contexte): Decision {
  // Message privé : seulement pour les membres de GRO, en mode équipe.
  if (ctx.typeCanal === "im") {
    if (!ctx.estMembreGro) {
      return { action: "refuser", raison: "Je réponds en privé seulement à l'équipe GRO. Pose ta question dans le canal partagé avec GRO." };
    }
    return { action: "repondre", public: "equipe" };
  }

  const canal = config.canaux[ctx.canal];
  if (!canal) return { action: "ignorer" };

  if (canal.public === "client") {
    // Canal client : toujours la version client, même si c'est quelqu'un de GRO
    // qui pose la question, parce que le client lit la réponse.
    if (!canal.client || !SLUG.test(canal.client)) return { action: "ignorer" };
    return { action: "repondre", public: "client", client: canal.client };
  }

  if (canal.public === "equipe") {
    if (!ctx.estMembreGro) return { action: "refuser", raison: "Ce canal est réservé à l'équipe GRO." };
    if (canal.client !== undefined) {
      if (!SLUG.test(canal.client)) return { action: "ignorer" };
      return { action: "repondre", public: "equipe", client: canal.client };
    }
    return { action: "repondre", public: "equipe" };
  }

  return { action: "ignorer" };
}

function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

// Repère les clients nommés dans un texte (question + fil), par alias entier.
// Le plus récent mentionné en premier n'a pas d'importance : on renvoie l'ordre alphabétique.
export function detecterClients(config: ConfigClients, texte: string): string[] {
  const t = ` ${normaliser(texte)} `;
  const trouves: string[] = [];
  for (const [slug, c] of Object.entries(config.clients)) {
    if (!SLUG.test(slug)) continue;
    const alias = [slug, c.nom, ...c.alias].map(normaliser).filter(Boolean);
    if (alias.some((a) => t.includes(` ${a} `))) trouves.push(slug);
  }
  return trouves.sort();
}
