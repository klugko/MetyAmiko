# MetyAmiko

Un assistant de recrutement propulse par l'IA. Tu uploades des CV, tu definis ton offre, et MetyAmiko te sort un classement des meilleurs candidats avec des scores detailles et un resume IA pour chacun.

Pas de magie noire : le systeme parse les CV (PDF ou DOCX), extrait les competences via Claude, puis score chaque candidat par rapport aux criteres de ton offre. En quelques minutes au lieu de quelques heures.

---

## A quoi ca ressemble

Le workflow est simple :

1. Tu crees une offre avec les competences requises (ponderes de 1 a 5)
2. Tu uploades les CV des candidats (un par un ou en batch, drag & drop)
3. L'IA analyse chaque CV et extrait les donnees structurees
4. Le moteur de matching score chaque candidat et genere un resume
5. Tu consultes les resultats tries par pertinence, tu filtres, tu exportes

Chaque matching produit :
- Un **score global** (0-100) decompose en competences / experience / pertinence
- Une liste de **points forts** et **points faibles** concrets
- Un **resume IA** de 2-3 phrases pour chaque candidat

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | Next.js (App Router) + TailwindCSS + shadcn/ui |
| Backend | FastAPI (Python 3.12) + SQLAlchemy + Alembic |
| Base de donnees | PostgreSQL 16 |
| Stockage fichiers | Supabase Storage |
| IA | Claude API (Haiku pour le parsing, Sonnet pour le matching) |
| CI/CD | GitHub Actions |
| Infra locale | Docker Compose |

---

## Prerequis

- Python 3.12+
- Node.js 20+
- PostgreSQL 16 (ou Docker)
- Un compte [Supabase](https://supabase.com) (gratuit suffit)
- Une cle API [Anthropic](https://console.anthropic.com)

---

## Installation

### 1. Cloner le repo

```bash
git clone https://github.com/klugko/MetyAmiko.git
cd MetyAmiko
```

### 2. Configurer les variables d'environnement

```bash
cp .env.example .env
```

Ouvre `.env` et remplis les valeurs. Les essentielles :

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `SECRET_KEY` | Cle secrete pour les tokens JWT (genere un truc long et aleatoire) |
| `SUPABASE_URL` | URL de ton projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Cle service role Supabase (pas la anon key) |
| `ANTHROPIC_API_KEY` | Ta cle API Anthropic |

Le reste a des valeurs par defaut qui marchent en local.

### 3. Lancer la base de donnees

**Avec Docker (recommande) :**

```bash
docker compose up -d db redis
```

**Sans Docker :** assure-toi que PostgreSQL tourne en local sur le port 5432 et que la base `metyamiko` existe.

### 4. Lancer le backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Creer les tables
alembic upgrade head

# Lancer le serveur
uvicorn app.main:app --reload --port 8000
```

L'API est disponible sur `http://localhost:8000`. La doc Swagger est sur `http://localhost:8000/docs`.

### 5. Lancer le frontend

```bash
cd frontend
npm install
npm run dev
```

L'app est disponible sur `http://localhost:3000`.

### 6. Configurer Supabase Storage

Dans ton dashboard Supabase :
1. Va dans **Storage**
2. Cree un bucket nomme `cv-uploads`
3. Mets-le en **private** (acces par URL signee uniquement)

---

## Lancer avec Docker Compose (tout en un)

Si tu veux tout lancer d'un coup sans installer Python/Node en local :

```bash
cp .env.example .env
# Remplis les valeurs dans .env
docker compose up --build
```

Ca lance PostgreSQL, Redis, le backend FastAPI et le frontend Next.js. L'app sera sur `http://localhost:3000`.

---

## Structure du projet

```
MetyAmiko/
├── backend/                  # API FastAPI
│   ├── app/
│   │   ├── api/v1/          # Endpoints (auth, offers, cvs, matching, dashboard, skills)
│   │   ├── core/            # Config, database, securite
│   │   ├── models/          # Modeles SQLAlchemy (User, Offer, CV, Matching, Skill)
│   │   ├── schemas/         # Schemas Pydantic (validation request/response)
│   │   └── services/        # Logique metier (parsing CV, matching IA, storage)
│   ├── alembic/             # Migrations de base de donnees
│   ├── tests/               # Tests pytest
│   └── requirements.txt
├── frontend/                 # App Next.js
│   └── src/
│       ├── app/
│       │   ├── (auth)/      # Pages login et register
│       │   └── (dashboard)/ # Pages protegees (dashboard, offers, profile)
│       ├── components/      # Composants UI (sidebar, shadcn)
│       └── lib/             # API client, auth context, utilitaires
├── .github/workflows/       # CI GitHub Actions
├── docker-compose.yml
└── .env.example
```

---

## Endpoints API

L'API est versionee sous `/api/v1`. Tous les endpoints sauf auth necessitent un token JWT dans le header `Authorization: Bearer <token>`.

### Auth
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/auth/register` | Creer un compte |
| POST | `/auth/login` | Se connecter (retourne un JWT) |
| GET | `/auth/me` | Profil de l'utilisateur connecte |
| PATCH | `/auth/me` | Modifier son profil |

### Offres
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/offers` | Creer une offre |
| GET | `/offers` | Lister ses offres (pagination, recherche, filtres) |
| GET | `/offers/:id` | Detail d'une offre |
| PATCH | `/offers/:id` | Modifier une offre |
| DELETE | `/offers/:id` | Supprimer une offre (soft delete) |
| POST | `/offers/:id/duplicate` | Dupliquer une offre |

### CV
| Methode | Route | Description |
|---------|-------|-------------|
| POST | `/offers/:id/cvs` | Uploader un CV (PDF/DOCX) |
| POST | `/offers/:id/cvs/batch` | Uploader plusieurs CV |
| GET | `/offers/:id/cvs` | Lister les CV d'une offre |
| POST | `/offers/:id/cvs/:cvId/retry` | Relancer le parsing d'un CV en erreur |

### Matching
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/offers/:id/matchings` | Resultats de matching (tries par score) |
| POST | `/offers/:id/matchings/run` | Lancer le matching |
| POST | `/offers/:id/matchings/rematch` | Recalculer tous les scores |

### Dashboard
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/dashboard/stats` | Statistiques globales |

### Skills
| Methode | Route | Description |
|---------|-------|-------------|
| GET | `/skills?q=python` | Recherche de competences (autocomplete) |

---

## Tests

### Backend

```bash
cd backend
pytest tests/ -v
```

18 tests couvrent l'authentification, le CRUD des offres, et le dashboard. Les tests utilisent SQLite en memoire, pas besoin de PostgreSQL.

### Frontend

```bash
cd frontend
npm run lint        # ESLint
npx tsc --noEmit    # Type checking
npm run build       # Build de production
```

---

## CI/CD

Le pipeline GitHub Actions tourne sur chaque push et PR vers `main` :

**Backend :**
- Lint avec ruff
- Tests pytest

**Frontend :**
- ESLint
- Type checking TypeScript
- Build de production

---

## Comment ca marche sous le capot

### Parsing de CV

Quand un CV est uploade :
1. Le fichier est stocke sur Supabase Storage
2. Le texte brut est extrait (pypdf pour les PDF, python-docx pour les DOCX)
3. Le texte est envoye a Claude Haiku qui extrait les donnees structurees : nom, email, competences, experiences, formation
4. Les donnees sont enregistrees en base

### Matching IA

Quand le matching est lance :
1. Pour chaque CV parse, on construit un prompt avec le contexte de l'offre et le profil du candidat
2. Claude Sonnet analyse la correspondance et retourne un score detaille
3. Les poids des competences de l'offre sont pris en compte
4. Le resultat (scores, resume, forces/faiblesses) est enregistre

Le system prompt est mis en cache cote Anthropic pour eviter de le re-traiter a chaque appel (economie de tokens quand on matche plusieurs CV pour la meme offre).

---

## Decisions techniques

**Pourquoi FastAPI plutot que les API routes Next.js ?**
Separation claire frontend/backend. Le backend peut etre deploye independamment, scale separement, et etre reutilise par d'autres clients (app mobile, integrationsitierces).

**Pourquoi deux modeles Claude ?**
Haiku pour le parsing de CV parce que c'est une tache d'extraction relativement simple et Haiku est 10x moins cher. Sonnet pour le matching parce que le scoring demande un raisonnement plus fin sur la pertinence.

**Pourquoi SQLAlchemy plutot qu'un ORM plus leger ?**
Maturite, typage, migrations Alembic, et c'est le standard de facto en Python. On aurait pu utiliser Tortoise ou SQLModel mais SQLAlchemy a moins de surprises en production.

**Pourquoi le soft delete sur les offres ?**
Les matchings et CV sont lies aux offres. Supprimer en dur casserait les references. Le soft delete garde l'historique intact tout en cachant l'offre de l'interface.

---

## Licence

Ce projet est prive. Tous droits reserves.
