# FretConnect CI 🇨🇮

Plateforme logistique et de mise en relation fret (expéditeurs et transporteurs) en Côte d'Ivoire.

---

## 🚀 Démarrage & Commandes

### Prérequis
- [Node.js](https://nodejs.org/) (v20+ ou v24)
- [pnpm](https://pnpm.io/) (`npm install -g pnpm`)
- Un projet [Supabase](https://supabase.com/) (pour la base PostgreSQL)

### 1. Installation des dépendances
```bash
pnpm install
```

### 2. Configuration des variables d'environnement
Copiez `.env.example` en `.env` et renseignez votre URL de base de données Supabase :
```bash
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
```

### 3. Pousser le schéma vers Supabase (Drizzle Kit)
```bash
pnpm --filter @workspace/db run push
```

### 4. Lancer les applications
- **Application Mobile (Expo)** :
  ```bash
  pnpm --filter @workspace/mobile run dev
  # ou pour lancer sur un émulateur / appareil spécifique :
  pnpm --filter @workspace/mobile run android
  pnpm --filter @workspace/mobile run ios
  pnpm --filter @workspace/mobile run web
  ```
- **Serveur API (Express 5)** :
  ```bash
  pnpm --filter @workspace/api-server run dev
  ```
- **Vérification TypeScript globale** :
  ```bash
  pnpm run typecheck
  ```

---

## 🛠️ Stack Technique

- **Monorepo** : pnpm workspaces, Node.js, TypeScript 5.9
- **Mobile** : React Native 0.86, React 19, Expo SDK 57, Expo Router
- **Backend API** : Express 5, Pino Logger, esbuild
- **Base de Données** : Supabase (PostgreSQL), Drizzle ORM, Drizzle-Zod
- **Spécifications API** : OpenAPI 3.1 & Orval

