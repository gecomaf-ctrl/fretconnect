# FretConnect CI — Déploiement sur Render (Static Site)

Guide pas-à-pas pour mettre en ligne la **version de démonstration** (app web,
données fictives) sur [Render](https://render.com).

> Le déploiement ne concerne que l'**application web**. Le backend
> (`artifacts/api-server`) n'est pas nécessaire pour la démo.

---

## 0. Ce qui a été préparé

| Fichier | Rôle |
|---|---|
| `render.yaml` | Blueprint Render : décrit le Static Site, le build et les règles de routage. |
| `artifacts/mobile/package.json` | `build` = `expo export --platform web` (génère `artifacts/mobile/dist`). |
| `package.json` | `packageManager: pnpm@11.10.0` (version reproductible sur Render). |
| `.gitignore` | `.env` et `dist/` ignorés (aucun secret ne part sur GitHub). |

Le build a été **validé en local** : `pnpm --filter @workspace/mobile run build`
produit bien `dist/index.html` + `dist/_expo/static/js/web/entry-*.js`.

---

## 1. Pousser le code sur GitHub

Le dépôt local contient des changements **non commités** (refactor local,
suppression des fichiers Replit, ajout de `render.yaml`, etc.). Il faut les
committer puis pousser.

```bash
# Se placer dans le dépôt
git status

# Ajouter les changements (⚠️ .env est ignoré, il ne sera pas ajouté)
git add -A
git commit -m "chore: prepare Render static site deployment (web demo)"

# Ajouter le remote GitHub (une seule fois) puis pousser
git remote add origin https://github.com/<votre-compte>/<votre-repo>.git
git push -u origin main
```

> 💡 Vérifiez que `.env` **n'apparaît pas** dans `git status` : il est ignoré.
> Si vous avez un doute : `git check-ignore .env` doit renvoyer `.env`.

---

## 2. Créer le service sur Render

### Option A — Blueprint (recommandé, tout est automatique)

1. Render Dashboard → **New** → **Blueprint**.
2. Sélectionnez votre dépôt GitHub.
3. Render détecte `render.yaml` → **Apply**. Le service `fretconnect-ci` se crée
   et le premier déploiement démarre.

### Option B — Manuel (Static Site)

Render Dashboard → **New** → **Static Site**, puis renseignez :

| Champ | Valeur |
|---|---|
| Branch | `main` |
| Build Command | `pnpm install --frozen-lockfile && pnpm --filter @workspace/mobile run build` |
| Publish Directory | `artifacts/mobile/dist` |

Puis, dans **Environment**, ajoutez :

| Key | Value |
|---|---|
| `NODE_VERSION` | `24.21.0` |
| `COREPACK_ENABLE_DOWNLOAD_PROMPT` | `0` |
| `CI` | `1` |
| `EXPO_NO_TELEMETRY` | `1` |

Et dans **Redirects/Rewrites**, ajoutez une règle :

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | **Rewrite** |

> ⚠️ L'action doit être **Rewrite** (et non Redirect) : l'app est une SPA
> (`expo-router`, sortie `single`), le routage se fait côté navigateur.

---

## 3. Vérifier le déploiement

Une fois le build terminé, ouvrez l'URL `https://<nom-du-service>.onrender.com`.

Checklist rapide :
- [ ] L'écran d'onboarding s'affiche (carrousel).
- [ ] **Connexion rapide (mode test)** fonctionne et mène à l'accueil.
- [ ] La navigation par le **menu latéral** (burger) fonctionne.
- [ ] Recharger directement une URL profonde (ex. `/wallet`) ne renvoie pas 404
      → la règle *Rewrite* est bien prise en compte.
- [ ] La carte de suivi s'affiche (nécessite Internet pour les tuiles OSM).

---

## 4. Mises à jour

Chaque `git push` sur `main` déclenche automatiquement un nouveau build.
(Render → *Auto-Deploy* est activé par défaut.)

Pour forcer un redéploiement : *Manual Deploy* → *Deploy latest commit*.

---

## 5. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `ERR_PNPM_...` / catalogue non reconnu | pnpm trop ancien sur le runner | Vérifier que `packageManager: pnpm@11.10.0` est bien présent à la racine ; sinon forcer `corepack enable && pnpm install ...` dans le Build Command. |
| `tsc` / `expo` non trouvé | Dépendances de dev non installées | `pnpm install` (sans `--prod`) installe bien les `devDependencies`. |
| Page blanche / 404 sur les routes profondes | Règle de rewrite manquante | Ajouter `/*` → `/index.html` en **Rewrite**. |
| Carte vide | Pas d'accès réseau aux tuiles OpenStreetMap | Normal : les cartes utilisent Leaflet + tuiles OSM en ligne. |
| Anciennes données persistées | `localStorage` du navigateur | Vider le stockage du site ou utiliser une navigation privée. |

---

## 6. Notes

- **Coût** : un Static Site Render est gratuit et servi via CDN.
- **Secrets** : aucun secret n'est requis pour cette démo. `.env` reste local.
- **Passage en production** : il faudra alors ajouter le backend
  (`artifacts/api-server` en Web Service + variables Supabase) et brancher les
  appels API dans le mobile (voir la section 5 de `DEMO.md`).
