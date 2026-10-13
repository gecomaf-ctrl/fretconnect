# FretConnect CI — Guide de démonstration (version présentation)

Cette version sert à **présenter le fonctionnement de l'application**. Toutes
les données sont fictives (mocks) et stockées localement dans le navigateur —
aucun backend n'est requis.

> Objectif : naviguer dans les parcours sans manipulation technique, en
> s'appuyant sur les deux raccourcis « mode test » intégrés.

---

## 1. Lancer la démo

```bash
pnpm install          # une seule fois
pnpm demo:web         # démarre l'app web
```

Puis ouvrir **http://localhost:8081** dans un navigateur.

> ℹ️ Les cartes de suivi utilisent **Leaflet + OpenStreetMap** (chargés via
> Internet). Prévoyez une connexion réseau pendant la démonstration.

**Réinitialiser la démo :** se déconnecter (menu latéral → *Se déconnecter*),
puis refaire la connexion rapide. Les données reviennent à leur état initial.

---

## 2. Raccourcis intégrés (à connaître)

| Raccourci | Où | Effet |
|---|---|---|
| **Connexion rapide (mode test)** | Écran d'accueil (onboarding) et écran de connexion | Connecte instantanément le compte de démo **Kofi Mensah** (Expéditeur, wallet 245 000 FCFA) |
| **[Test] Simuler approbation du compte chauffeur** | Profil, après avoir soumis le dossier KYC | Valide le compte chauffeur et le rend actif (missions, wallet 446 250 FCFA) |

Ces boutons remplacent ce qui, en production, serait fait par l'API /
l'administration.

> Les informations saisies (fret publié, dossier KYC) restent en mémoire de
> session ; elles ne sont pas persistées entre deux connexions.

---

## 3. Scénarios à démontrer

### A. Onboarding & authentification
1. Au démarrage : carrousel de présentation (3 slides) → **Suivant** → **Commencer**.
2. Option 1 : **Créer un compte** → formulaire → OTP.
3. Option 2 : **Se connecter** → soit identifiants, soit **Connexion par OTP**, soit **Connexion rapide (mode test)**.

### B. Parcours Expéditeur complet
1. Accueil Expéditeur : onglets *Vue globale*, *Propositions chauffeurs*, *En livraison*.
2. **Propositions chauffeurs** : comparer les devis, puis **Accepter** (→ confirmation + redirection wallet), **Refuser**, ou **Négocier** (→ chat).
3. **Publier un nouveau fret** (bouton bas d'écran) : renseigner trajet, marchandise, budget → publication.
4. **Mes frets** (onglet Frets / menu) : filtres *Tous / En attente / En transit / Livrés* → ouvrir le détail d'un fret (`f1`, `f2`…).

### C. Suivi GPS live
1. Accueil Expéditeur, bloc **« En livraison »** → ouvrir le suivi (`f3` est *in transit*).
2. Écran carte : trajet Abidjan → Yamoussoukro, position du camion, arrêts (péage, ravitaillement, pesage), statut.
3. Détail mission côté chauffeur : suivi dédié également disponible.

### D. Wallet & transactions
1. Menu latéral → **Wallet** (ou bouton de solde en haut d'écran).
2. Vérifier solde, gains/retraits, statistiques, historique des transactions.
3. Le wallet affiché dépend du **compte actif** (Expéditeur ou Chauffeur).

### E. Parcours Chauffeur complet (KYC → missions)
1. Profil → carte **Compte Chauffeur** → **Créer** (ou menu latéral → *Créer mon compte chauffeur*).
2. Parcours KYC en **7 étapes** : identité, pièce, permis, véhicule, documents véhicule, entreprise (optionnel), récapitulatif → **Soumettre**.
3. Retour au profil → bouton **[Test] Simuler approbation du compte chauffeur**.
4. Basculer sur le **compte Chauffeur** (sélecteur de compte) → l'accueil change d'univers (Espace Chauffeur).
5. **Missions disponibles** → ouvrir une mission → **Postuler** → détail mission.
6. Écrans dédiés : **Mon véhicule**, **Revenus**.

### F. Chat & notifications
1. Menu / onglet **Messages** → ouvrir une conversation → envoyer un message.
2. Onglet **Notifications** → marquer comme lu / **Tout lire**.
   (Le contenu s'adapte au compte actif : Expéditeur ou Chauffeur.)

---

## 4. Points d'attention pour la présentation

- **Menu latéral** : la barre d'onglets est masquée, la navigation passe par le
  menu burger (haut à gauche). C'est le point d'entrée principal.
- **Compte actif** : le même utilisateur possède deux univers (Expéditeur /
  Chauffeur). Le sélecteur de compte est dans le menu latéral et sur le profil.
- **Cartes** : nécessitent une connexion Internet (tuiles OpenStreetMap).
- **Données** : fictives, donc volontairement « pré-remplies » pour que chaque
  écran soit démontrable sans attendre.

---

## 5. Prochaine étape (passage en production)

Cette version est une **maquette interactive**. La mise en production
consistera notamment à :

- implémenter les routes métier de `artifacts/api-server` (aujourd'hui limité à `/api/healthz`) ;
- brancher l'authentification réelle (Supabase) à la place du login simulé ;
- remplacer progressivement les mocks (`data/mockData.ts`) par les appels API (`lib/api-client-react`) ;
- alimenter le schéma Drizzle (`lib/db`) et publier les contrats OpenAPI.
