<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CataPos Help Center

Repo nay gom:

- frontend Vite/React cho Help Center
- backend NestJS + Prisma cho cac API help center
- PostgreSQL cho du lieu

## Kien truc chinh

- Frontend: `frontend/`
- Backend: `backend/`
- Prisma + Database: `prisma/`

## Cau truc thu muc

```text
.
|-- frontend/               # React + Vite UI
|   |-- components/
|   |-- pages/
|   |-- services/
|   |-- App.tsx
|   |-- index.tsx
|   `-- types.ts
|-- backend/
|   |-- src/                # NestJS backend
|   |   |-- common/
|   |   |-- modules/
|   |   |-- prisma/
|   |   |-- app.module.ts
|   |   `-- main.ts
|   `-- tsconfig.backend.json
|-- prisma/                 # Prisma schema, migrations, seed
|   |-- migrations/
|   |-- schema.prisma
|   `-- seed.ts
|-- index.html
|-- vite.config.ts
`-- package.json
```

## API backend da co

- `GET /api/help-center/categories`
- `GET /api/help-center/articles`
- `GET /api/help-center/articles/:slug`
- `GET /api/help-center/search/suggestions`
- `GET /api/help-center/contextual-help`
- `POST /api/help-center/articles/:articleId/feedback`

Response duoc wrap theo format:

```json
{
  "data": "..."
}
```

Format nay khop voi frontend hien tai trong `frontend/services/helpCenterService.ts`.

## Chay local

### 1. Cai dependencies

```bash
npm install
```

### 2. Tao env

```bash
cp .env.example .env
```

Cap nhat `DATABASE_URL` trong `.env` theo PostgreSQL local cua ban.

Vi du:

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/catapos_help_center?schema=public"
JWT_SECRET="replace-with-a-secure-secret"
PORT="8000"
VITE_API_BASE_URL="http://localhost:8000"
```

### 3. Tao database PostgreSQL

Tao database `catapos_help_center` bang cach ban dang dung tren may, vi du qua `psql`, pgAdmin, TablePlus hoac mot Postgres local co san.

### 4. Generate Prisma Client va chay migration

```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
```

### 5. Seed du lieu mau

```bash
npm run prisma:seed
```

### 6. Chay backend

```bash
npm run dev:backend
```

Backend se chay tai `http://localhost:8000`.

### 7. Chay frontend

```bash
npm run dev:frontend
```

Frontend se chay tai `http://localhost:3000` va goi API den backend qua `VITE_API_BASE_URL`.

