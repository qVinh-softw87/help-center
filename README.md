<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# CataPos Help Center

Repo nay gom:

- frontend Vite/React cho Help Center
- backend NestJS + Prisma cho cac API help center
- PostgreSQL de chay local

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
|-- docker-compose.yml
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

### 2. Chay PostgreSQL

```bash
docker compose up -d postgres
```

### 3. Tao env

```bash
cp .env.example .env
```

### 4. Generate Prisma Client va migrate

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

Frontend se chay tai `http://localhost:3000` va goi API den backend local.

## Nhung phan quan trong de hoc

- `backend/src/modules/help-center/help-center.controller.ts`: routing va request handling
- `backend/src/modules/help-center/help-center.service.ts`: business logic
- `backend/src/prisma/prisma.service.ts`: Prisma client + Nest lifecycle
- `prisma/schema.prisma`: thiet ke co so du lieu
- `backend/src/common/interceptors/response.interceptor.ts`: response format cho FE

## Nhung gi repo nay da bo sung de hoan chinh hon

- Prisma schema cho `Category`, `Article`, `Feedback`
- Postgres local bang Docker Compose
- seed du lieu mau
- scripts backend/prisma trong `package.json`
- backend tsconfig rieng
- response wrapper khop frontend
