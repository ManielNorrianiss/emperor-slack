// Charge les fiches autorisées par lib/routing.ts. Rien d'autre.
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import type { Decision } from "./routing.js";

const RACINE = path.join(process.cwd(), "knowledge");

async function lire(fichier: string): Promise<string | null> {
  try {
    return await readFile(fichier, "utf8");
  } catch {
    return null;
  }
}

export async function reglesCommunes(): Promise<string> {
  return (await lire(path.join(RACINE, "regles-communes.md"))) ?? "";
}

export async function chargerFiches(decision: Extract<Decision, { action: "repondre" }>): Promise<string> {
  if (decision.public === "client") {
    // UNE seule fiche : la version client de CE client.
    const fiche = await lire(path.join(RACINE, decision.client, "client.md"));
    if (!fiche) throw new Error(`Fiche client introuvable pour « ${decision.client} »`);
    return fiche;
  }

  // Équipe GRO : toutes les fiches, version client et version équipe.
  const dossiers = (await readdir(RACINE, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();

  const morceaux: string[] = [];
  for (const client of dossiers) {
    const versionClient = await lire(path.join(RACINE, client, "client.md"));
    const versionEquipe = await lire(path.join(RACINE, client, "equipe.md"));
    if (!versionClient && !versionEquipe) continue;
    morceaux.push(
      `<client id="${client}">\n${versionClient ?? ""}\n\n${versionEquipe ?? ""}\n</client>`
    );
  }
  return morceaux.join("\n\n");
}
