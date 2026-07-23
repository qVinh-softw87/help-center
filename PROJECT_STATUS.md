# CataPos Help Center - Project Status

## Overview
This is a help center system for CataPos with backend (NestJS + Prisma) and frontend (React + Vite).

## Project Structure
```
help-center/
├── backend/                  # NestJS backend
│   ├── src/
│   │   ├── common/          # Filters, interceptors
│   │   ├── modules/         # Core modules (auth, help-center)
│   │   ├── prisma/          # Prisma service
│   │   └── main.ts
│   └── tsconfig.backend.json
├── frontend/                 # React frontend
│   ├── components/          # Reusable components
│   ├── contexts/            # React contexts (AuthContext)
│   ├── pages/               # Page components
│   ├── services/            # API services
│   ├── App.tsx
│   └── index.tsx
├── prisma/                   # Prisma schema, migrations, seed
├── uploads/                  # File upload directory
├── public/
├── .env.example
├── package.json
└── vite.config.ts
```

## Backend Status
### ✅ Completed
- **NestJS backend structure** with core modules
- **Prisma + PostgreSQL** integration
- **Auth module**: JWT authentication, guards, decorators
- **RBAC**: Role-based access control (ADMIN/STAFF)
- **Help center module**:
  - Public APIs for categories, articles, search, feedback
  - Admin CRUD APIs for categories/articles
  - Article image upload (local storage)
- **Response interceptor and exception filter**
- **CORS and validation pipe**
- **Soft delete for articles**
- **isActive for users**
- **Cache module** with invalidation on CRUD operations
- **Swagger API docs** at `/api/docs`
- **Seed data**

### ⏳ Pending
- Unit tests for all modules
- Cloud storage (S3/MinIO) for file uploads
- Refresh token

## Frontend Status
### ✅ Completed
- **React + Vite + React Router** setup
- **Core components**: Header, Footer, SearchBar, ContextualHelp, RouteGuard
- **Pages**: HomePage, ArticleList, ArticleDetail, LoginPage
- **Auth**: AuthContext, useAuth hook, authService
- **API services**: helpCenterService, authService (with mock fallback)
- **i18n support** (vi/en)
- **Markdown rendering**

### ⏳ Pending
- Admin dashboard page
- UI/UX improvements
- Unit tests for components

## Database Status
### ✅ Completed
- **Prisma schema**
- **Migrations**: Base migration + add soft delete + add isActive
- **Seed data**

## How to Run
### Prerequisites
- Node.js
- PostgreSQL

### Steps
1. Install dependencies: `npm install`
2. Create `.env` from `.env.example`
3. Configure DATABASE_URL, JWT_SECRET, PORT, VITE_API_BASE_URL, UPLOAD_DIR, MAX_FILE_SIZE
4. Generate Prisma Client: `npm run prisma:generate`
5. Run migrations: `npm run prisma:migrate`
6. Seed data: `npm run prisma:seed`
7. Run backend: `npm run dev:backend`
8. Run frontend: `npm run dev:frontend`

## Demo Accounts
- Admin: admin@example.com / 123456
- Staff: staff@example.com / 123456

## Notes
- Frontend uses mock data as fallback if backend is unreachable
- API feedback requires login
- Multi-language support (vi/en)
- File uploads stored locally in `uploads/`
- Cache automatically invalidated on article/category changes
