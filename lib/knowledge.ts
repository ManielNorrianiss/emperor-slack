// Charge seulement les fiches autorisées par lib/routing.ts. Rien d'autre.
// Les fichiers sont gardés en mémoire tant que l'instance Vercel reste chaude.
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SLUG } from "./routing.js";

const RACINE = path.join(process.cwd(), "knowledge");
const cache = new Map<string, string | null>();

async function lire(relatif: string): Promise<string | null> {
  if (cache.has(relatif)) return cache.get(relatif)!;
  let contenu: string | null = null;
  try {
    contenu = await readFile(path.join(RACINE, relatif), "utf8");
  } catch {
    contenu = null;
  }
  cache.set(relatif, contenu);
  return contenu;
}

export async function reglesCommunes(): Promise<string> {
  return (await lire("regles-communes.md")) ?? "";
}

// Version client : UNE seule fiche, celle de CE client.
export async function ficheClient(client: string): Promise<string> {
  if (!SLUG.test(client)) throw new Error("nom de client invalide");
  const fiche = await lire(path.join(client, "client.md"));
  if (!fiche) throw new Error(`Fiche client introuvable pour « ${client} »`);
  return fiche;
}

// Version équipe : les deux fiches des clients demandés seulement.
export async function fichesEquipe(clients: string[]): Promise<string> {
  const morceaux: string[] = [];
  for (const client of clients) {
    if (!SLUG.test(client)) continue;
    const versionClient = await lire(path.join(client, "client.md"));
    const versionEquipe = await lire(path.join(client, "equipe.md"));
    if (!versionClient && !versionEquipe) continue;
    morceaux.push(`<client id="${client}">\n${versionClient ?? ""}\n\n${versionEquipe ?? ""}\n</client>`);
  }
  return morceaux.join("\n\n");
}
