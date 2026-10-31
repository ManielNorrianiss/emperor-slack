// Décide quelles fiches le bot a le droit de charger pour un message donné.
// C'est ici que l'étanchéité entre clients est garantie : le modèle ne reçoit
// jamais un fichier que cette fonction n'a pas autorisé.

export type Public = "client" | "equipe";

export interface CanalConfig {
  client?: string;
  public: Public;
}

export interface ConfigCanaux {
  canaux: Record<string, CanalConfig>;
}

export interface Contexte {
  canal: string;
  typeCanal: "im" | "channel" | "group" | "mpim" | string;
  estMembreGro: boolean;
}

export type Decision =
  | { action: "repondre"; public: "client"; client: string }
  | { action: "repondre"; public: "equipe" }
  | { action: "refuser"; raison: string }
  | { action: "ignorer" };

const SLUG = /^[a-z0-9-]{2,40}$/;

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
    if (!ctx.estMembreGro) {
      return { action: "refuser", raison: "Ce canal est réservé à l'équipe GRO." };
    }
    return { action: "repondre", public: "equipe" };
  }

  return { action: "ignorer" };
}
