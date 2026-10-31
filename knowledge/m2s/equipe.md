# Groupe M2S — version équipe GRO (jamais montrée au client)

M2S est un mandat NTR-EG en banque de 100 h. Il reste environ 25 à 30 h au 16 octobre 2026, et les rencontres client sont retirées de l'agenda à partir du 27 novembre.

## Le mandat

- Produit : NTR-EG, banque d'heures de 100 h, taux de 100 $/h. Connexion QuickBooks en forfaitaire.
- Consommation : environ 52 h au 18 sept., 66 à 77 h au 8 oct. La cible était de finir entre 80 et 85 h.
- Compte monday du client : groupem2s-company. Un ancien espace monday n'a pas pu être supprimé ; le support est saisi.
- Gestion M2S déplacée au jeudi. En septembre, la consigne était de réduire M2S pour libérer du temps.

## Portée du CDC

- Inclus : Projets, Estimation | Appels d'offres, Bons de commande, Extras & changements, Suivi budgétaire, Postes budgétaires, Charte comptable, Factures payables (OCR), Fournisseurs, Conformité, Employés, Entrées de temps, connexion QBO, Looms de formation (14 modules).
- Exclu : Échéancier de chantier. Il reste « en attente » dans le tableau P.
- Automatisations prévues au CDC : numéro de projet, de BC et d'extra (Pipedream / Zap), courriels d'appel d'offres et de rappel, création du BC à l'acceptation, PandaDoc pour BC et extras, liens au budget (soumissions, BC, extras, factures, heures), stamp des taux horaires, synchros QBO (charte, fournisseurs dans les deux sens, payables vers QBO).
- Hors CDC, demandé par M2S : formulaire de soumission par métier, plusieurs CC sur les courriels, formulaire où les sous-traitants entrent leurs prix, automatisation des équipements loués.

## Coûts estimés des demandes en suspens

- Une nouvelle demande coûte en général 6 à 7 h. Plusieurs CC : environ 50 h de dev. Envoi massif de mises à jour : environ 1 h.
- Équipements loués : 10 à 30 h. App sur mesure : 10 à 12 h ou 2 000 à 3 000 $.
- Outils envisagés : Superform (hésitation sur le coût et la dépendance), Bastia (environ 2 000 $ par année).
- Consigne de Charles : limiter les nouvelles demandes, sans présenter la solution comme trop compliquée.

## Bugs et irritants connus

- Erreur API « Field limit exceeded » sur un projet, non résolue (30 oct.).
- Factures exportées dans la mauvaise catégorie QBO : Zapier à vérifier.
- Synchro fournisseurs QBO incomplète (téléphone, courriel, adresse) : signalée au dev QBO.
- Pascal ne voyait pas les tableaux à cause d'une deuxième URL (22 oct.).
- Tests de courriels bloqués faute d'adresse professionnelle.
- Un siège monday est facturé à GRO par erreur ; remboursement de l'ancien compte demandé.

## Relevé dans le compte M2S (30 oct.)

- **Données personnelles** : Employés contient NAS, dates de naissance, adresses, spécimens de chèque, permis. Clients contient des particuliers. Emperor ne cite jamais ces données.
- **Courriel « Nouvel employé »** : il part vers une adresse externe et contient le NAS, l'adresse, le syndicat, le métier et le décret. À faire valider par M2S.
- **Conformité Sous-Traitants** est visible par tout le compte (« everyone ») ; les autres tableaux sont réservés aux collaborateurs.
- **Automatisations non connectées** : devis, contrats et sondage (Projets), sommaire de facturation (Factures et Entrées de temps cost +), courriels de l'Échéancier. Elles ne tournent pas.
- **Pipedream** génère les PDF et les PandaDoc des BC et des extras : une panne là bloque ces documents.
- **Extras** : une automatisation passe un sous-élément à « Reçu » quand son prix unitaire change. À vérifier.
- **Données de test GRO** encore présentes dans Employés.

## Contexte client à manier avec soin

- M2S vit un litige de paiement avec un de ses propres clients. Ne pas l'aborder.
- Sandra apprend vite mais a besoin d'accompagnement pour exploiter le système seule.
- La dénonciation obligatoire est exigée par M2S, même si GRO la juge difficile à imposer juridiquement.
- Taux de main-d'œuvre de M2S : 86,51 $/h charpentier, 58,47 $/h manœuvre, ajustés chaque 1er mai.

## Contacts GRO sur ce mandat

- Josué : pilote.
- Charles Roy : architecture et choix techniques.
- Tommy Lizotte : dev monday et Zapier.
- Yoann : lien QuickBooks.

## À confirmer

- Le rôle exact de Benjamin (président ?).
- Les droits sur le Suivi budgétaire, pas encore présentés au client.
- La clause « présence sur chantier = acceptation » dans les BC (validation juridique).
- Les documents de conformité retirés pour l'instant (plan de prévention, études, Revenu Québec) : à revoir avec le comptable.
- Les automatisations non connectées : à réactiver ou à retirer.
