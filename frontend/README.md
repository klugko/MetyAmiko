# MetyAmiko - Frontend

Interface web Next.js de MetyAmiko. Voir le [README principal](../README.md) pour le contexte du projet.

## Commandes

```bash
npm install       # Installer les dependances
npm run dev       # Serveur de dev (port 3000)
npm run build     # Build de production
npm run lint      # Linter ESLint
npx tsc --noEmit  # Verification des types
```

## Variables d'environnement

```bash
cp .env.example .env.local
```

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | URL de l'API backend (defaut : `http://localhost:8000/api/v1`) |
