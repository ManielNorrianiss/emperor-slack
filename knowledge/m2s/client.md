# Groupe M2S — le système monday (version client)

Le système suit un projet du terrain jusqu'à la livraison : estimation, appels d'offres, bons de commande, extras, factures, heures et budget, reliés à QuickBooks.

**Légende des colonnes** : 🤖 = remplie par une automatisation · ⚡ = déclenche une automatisation · rien = à remplir à la main · ⚠️ = erreur d'automatisation, intervention requise · ✅ = automatisation réussie.

## Qui fait quoi chez M2S

- **Sandra** : administration et comptabilité, administratrice monday. Approbation finale des factures, validation des heures et des fiches employés, création des BC, formulaires.
- **Benjamin** : estimations et budgets, administrateur budget. Valide les soumissions et leurs conditions, crée des BC sur chantier.
- **Pascal** (surintendant) : première vérification des factures (« Vue surintendant »), besoins de chantier.
- **Boîte info** : envoie les courriels automatiques. Les réponses sont redirigées au chargé de projet.

## 💼 Projets

- Étape du projet : En développement (terrains), En estimation, Chantier en cours, Livraison de projet, Projet terminé, Projet annulé / Perdu. Le développement est séparé du chantier pour ne pas compter deux fois.
- Le numéro de projet se crée à l'étape Estimation, une fois le lot, le nombre d'unités et la ville remplis : trois derniers chiffres du lot, puis une séquence.
- Type de facturation : Forfaitaire, Progressive, Cost + ou À définir. Décret : CCQ ou Hors CCQ.
- Le projet permanent « Dépense GÉNÉRAL » reçoit les factures sans chantier.
- Un projet terminé disparaît des choix dans le formulaire d'heures.
- Plans : colonnes préliminaire, permis et construction. L'envoi aux sous-traitants se fait à la main par statut, pour éviter d'envoyer une mauvaise version.

## 📐 Estimation | Appel d'offres

1. Le groupe du projet se crée depuis le tableau Projets. Choisir l'estimateur dans le projet.
2. Pour chaque poste : inscrire l'estimation, ou la quantité × le coût unitaire. Le budget initial se saisit une seule fois.
3. Préparer l'invitation : lier les soumissionnaires, description des travaux, pièces jointes, échéance, début des travaux.
4. Envoyer : Statut d'envoi → « ⚡ Inviter ». Un sous-élément se crée par soumissionnaire. Après l'envoi, le budget est figé pour garder la traçabilité.
5. Suivi dans les sous-éléments : « ⚡1er Rappel », « ⚡2e Rappel », « ⚡Soumission Incomplète » (courriel avec ce qui manque), « Non-Intéressé », ou « Reçue » avec le numéro, le montant et le PDF.
6. Choisir le gagnant : « ⚡Soumission Acceptée (Bon de commande) » crée le bon de commande, « ⚡Accepté pour Devis » la retient pour un devis, « ⚡Soumission Refusée » envoie un avis de non-retenue, « Fait à l'interne » si M2S fait les travaux.

- Mise à jour aux soumissionnaires (plans, date limite) : remplir la section Spécifications courriel, puis « ⚡ Envoyer MàJ ».
- Colonne Hard / Soft Cost (Hard Cost, Soft Cost, Dépense générale) pour filtrer.
- Forage et pompe d'un même puits : un seul numéro de soumission, montants additionnés, deux PDF joints.
- L'écart entre l'estimation et la soumission acceptée passe en contingence.

## 🏦 Postes budgétaires et charte comptable

- Une centaine de postes, regroupés en grands ensembles. Un poste = un seul compte QuickBooks.
- Une facture ne se répartit pas sur plusieurs postes ni sur plusieurs BC.
- Main-d'œuvre salariée et main-d'œuvre louée : deux postes distincts.
- Ajouter un poste : le créer ici et le lier à la charte comptable, l'ajouter au Suivi budgétaire (dupliquer depuis le modèle) et à l'Estimation, puis au projet actif (connexion budget à « À connecter »).
- « Applicable Entrées de temps ? » = Oui seulement pour les postes de main-d'œuvre.
- La charte comptable est le miroir du plan comptable QuickBooks. Pour changer un compte, passer par QuickBooks.
- À l'export d'une facture, le compte vient de la charte du bon de commande, sinon de celle du poste.

## 📦 Bons de commande

- Le BC se crée quand une soumission est acceptée. Signature électronique par lien PandaDoc. C'est le cadre contractuel : montant, conditions, portée.
- Les conditions de M2S sont dans le BC. Le document du sous-traitant est en pièce jointe. Le champ Notes B/C est obligatoire (écrire « aucun » si vide).
- Le numéro de BC doit figurer sur toute facture.
- BC de 5 000 $ et plus : dénonciation exigée avant le début des travaux. Quittance envoyée après chaque paiement.
- Crédit pour travaux non faits : un BC négatif, sans signature.
- Aucun paiement supplémentaire à un sous-traitant sans BC approuvé.
- Statut du B/C : Nouveau → ⚡Créer Pandadoc → B/C créé → ⚡Envoyer B/C → B/C envoyé → B/C Signé (ou Annulé).
- Si le sous-traitant se présente au chantier, cela vaut acceptation du bon, même sans signature.
- Documents à fournir, choisis dans le BC : licence RBQ, assurance responsabilité civile, attestation CNESST, état de situation CCQ, dénonciation.

## ➕ Extras et changements

- Demande du client : approbation écrite du client avant les travaux.
- Imprévu : va en contingence, sans approbation du client, avec historique.
- Le flux : prix du sous-traitant → approbation du client → BC extra créé automatiquement → suivi budgétaire. Numéro = projet + séquence.
- Un extra non documenté et non approuvé avant les travaux = travaux suspendus. Le sous-traitant fait une facture distincte pour l'extra.
- Type : Contingence (absorbée par M2S, ni facturée ni envoyée au client) ou Extra (facturé au client).
- Statut de l'extra : ⚡ Générer PDF → Généré → ⚡ Envoyer au client → Envoyé → Approuvé ou Refusé.

## ✅ Approbation des factures payables

1. Envoyer la facture à l'adresse OCR. Si le numéro de BC est lu, le BC se relie tout seul ; sinon, rattacher à la main.
2. Valider à la main les données lues par l'OCR.
3. Pascal vérifie dans la « Vue surintendant » (colonne Vérification à faire) : À vérifier, En cours, Bloqué (commentaire obligatoire), Terminé.
4. Statut Payable : À traiter → Approbation Surintendant → Approuvé par Surintendant → « ⚡ Approuvée - À Exporter » (approbation finale de Sandra). Seule cette approbation envoie la facture vers QuickBooks. Après le paiement dans QuickBooks, le statut passe à « Payée ».

- Facture sans BC : rattacher au projet à la main, décision de Sandra.
- Le statut « Refusée » retire la facture du suivi, sans courriel automatique. Inscrire le motif dans « Raison du refus ».
- Export en erreur : le plus souvent un numéro de facture en double, ou un poste budgétaire non lié à la charte comptable.
- Factures RONA : regroupées chaque mois en une facture globale, répartie par projet.

## 📊 Suivi budgétaire

- Surtout en consultation. Il se remplit avec les soumissions acceptées, les BC, les factures payables et les heures.
- Budget révisé = estimation + extras client + contingence. La contingence (environ 5 % du contrat) a sa propre colonne. Coût total = payables + main-d'œuvre.
- Administrateurs : Benjamin et Sandra. Les autres sont en consultation, les colonnes sensibles sont verrouillées.

**Demande de déboursé, étape 1 (le chiffre)** : monday donne les dépenses à date, Excel fait le calcul.

1. Ouvrir la vue « Déboursé (export) » et filtrer sur le groupe du projet.
2. Exporter en Excel. Cet export fige le moment du déboursé.
3. Dans le fichier maître : coller « Coût total ($) » dans Dépenses à date. Déboursé courant = Dépenses à date − déboursés précédents.
4. Étape 2 : dans Approbation factures payables, vue « Assignation des déboursés », attribuer le numéro.

Toujours exporter **avant** de taguer les factures.

## 🚚 Fournisseurs, sous-traitants et conformité

- Une fiche par fournisseur. Créer en parallèle dans monday et QuickBooks peut faire des doublons.
- Inscription par formulaire avec champs obligatoires (TPS, TVQ, NEQ, RBQ, etc.).
- Conformité suivie : RBQ, CNESST, état CCQ, assurance responsabilité civile. Dépôt par courriel, validation par Sandra, rappels automatiques selon l'échéance. Les relances s'arrêtent à la clôture du BC.
- Avant de créer une fiche, vérifier les doublons (nom, NEQ, TPS). Ne jamais modifier l'ID comptable : les colonnes 🔄 se synchronisent avec QuickBooks.
- Trois courriels par fiche : général, facturation, appel d'offres.
- Rappels de conformité : journalier, hebdomadaire ou aux 2 semaines, jusqu'à réception de tous les documents.

## 📕 Employés et 🕛 entrées de temps

- Nouvel employé : formulaire, validé par Sandra avant la paie. Le NAS passe par un document protégé, jamais par courriel.
- Formulaire d'heures quotidien : projet et heures. « Envoyer un autre » pour un deuxième chantier. Confirmation par courriel.
- Le poste budgétaire est assigné automatiquement selon le métier. Courriel de rappel quotidien à 15 h aux employés concernés.
- Validation par Sandra ou le surintendant. Corrections par téléphone plutôt que par courriel.
- Export hebdomadaire par employé pour la paie. Frais de déplacement fixes par jour, réglables par employé.
- Statut d'une entrée : À approuver → À corriger ou Approuvée - À payer → Payée (ou Non valide / Annulée).
- Le taux horaire est figé au moment de la saisie : une hausse de taux ne change pas les entrées passées.

## Courriels et notifications

- Les courriels automatiques partent de la boîte info, 50 destinataires au maximum par envoi.
- Les notifications courriel de monday sont désactivées. Les mentions Teams restent actives.
- Une connexion en erreur : remettre le statut à « À connecter ».

## À venir ou à confirmer

- Échéancier de chantier : le tableau existe, mais ses courriels de confirmation aux sous-traitants ne sont pas encore actifs.
- Formulaire de soumission détaillé par métier : demandé, pas encore livré.
- Statut à l'arrivée dans QuickBooks (« Unpaid » ou « For Review ») et fréquence de synchronisation : à confirmer.
- Outil de mise à jour des fiches fournisseurs : décision à prendre.
- Dossier de dénonciations et quittances complet : phase 2.
- Vidéos de procédure : à venir.
