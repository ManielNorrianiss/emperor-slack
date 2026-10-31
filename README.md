# Emperor — bot Slack de Josué (GRO)

Emperor répond aux questions des clients et de l'équipe GRO sur les systèmes monday, à partir des fiches du dossier `knowledge/`.

## Comment il décide quoi lire

- **Canal partagé avec un client** : il charge seulement `knowledge/<client>/client.md`, peu importe qui pose la question (le client lit la réponse).
- **Canal interne GRO ou message privé** : seulement pour un membre de GRO. Il charge toutes les fiches, version client et version équipe.
- **Canal absent de `config/canaux.json`** : il ne répond pas.
- Quand il ne sait pas, il le dit et t'identifie dans le fil.

Cette règle est dans le code (`lib/routing.ts`) et testée (`npm test`). Le modèle ne reçoit jamais une fiche que le code n'a pas autorisée.

## Mise en ligne (environ une heure)

### 1. Vercel

1. Sur vercel.com : **Add New → Project**, importe ce dépôt GitHub. Garde les réglages par défaut, puis **Deploy**.
2. Note l'adresse du projet, par exemple `https://emperor-slack.vercel.app`.

### 2. L'app Slack

1. Sur api.slack.com/apps : **Create New App → From an app manifest**, choisis le Slack de GRO.
2. Colle le contenu de `slack-manifest.yml`, en remplaçant `REMPLACER-PAR-TON-PROJET` par l'adresse Vercel.
3. **Install to Workspace**.
4. Copie deux valeurs :
   - *OAuth & Permissions* → **Bot User OAuth Token** (commence par `xoxb-`)
   - *Basic Information* → **Signing Secret**

### 3. Les variables dans Vercel

Dans le projet Vercel : **Settings → Environment Variables**.

| Nom | Valeur |
| --- | --- |
| `SLACK_BOT_TOKEN` | le jeton `xoxb-…` |
| `SLACK_SIGNING_SECRET` | le Signing Secret |
| `ANTHROPIC_API_KEY` | ta clé API Anthropic (console.anthropic.com) |
| `GRO_TEAM_ID` | l'identifiant du Slack de GRO (commence par `T`) |
| `ESCALADE_USER_ID` | ton identifiant Slack (commence par `U`) |
| `ANTHROPIC_MODEL` | facultatif, `claude-sonnet-5-5` par défaut |

Pour trouver `GRO_TEAM_ID` : ouvre Slack dans le navigateur, l'adresse contient `/client/T…/`.
Pour trouver ton `U…` : clique sur ta photo → **Profil** → **⋯** → **Copier l'ID de membre**.

Redéploie ensuite (**Deployments → ⋯ → Redeploy**) pour que les variables soient prises.

### 4. Brancher les canaux

1. Dans `config/canaux.json`, remplace `C_REMPLACER_M2S` par l'identifiant du canal partagé avec M2S, et `C_REMPLACER_INTERNE` par un canal interne GRO.
   Identifiant d'un canal : clic droit sur le canal → **Copier le lien**, la fin commence par `C`.
2. Invite Emperor dans chaque canal : `/invite @Emperor`.
3. Pousse le changement sur GitHub. Vercel redéploie tout seul.

### 5. Tester

- Dans le canal interne : `@Emperor comment on approuve une facture chez M2S ?`
- Dans le canal M2S : `@Emperor combien d'heures reste-t-il à la banque ?` → il doit refuser d'en parler et t'appeler.
- Les journaux sont dans Vercel → **Logs** (une ligne `Emperor:` par message, avec la décision prise).

## Ajouter un client

1. Crée `knowledge/<client>/client.md` (ce que le client peut voir) et `knowledge/<client>/equipe.md` (interne).
   Le nom du dossier : minuscules, chiffres et tirets seulement (ex. `bgc`, `groupe-module`).
2. Ajoute son canal dans `config/canaux.json` avec `"client": "<client>"` et `"public": "client"`.
3. Invite Emperor dans le canal.

## Pour développer

```
npm install
npm test         # règles d'étanchéité
npm run typecheck
```
