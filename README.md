# Nawy Apartments

A small full-stack apartment marketplace built for the Nawy Software Engineer hiring assignment. It focuses on the requested workflow: browse units, search by unit name/number/project, inspect details, and add an apartment through a validated API.

## Quick start

Requirements: Docker Desktop with Docker Compose.

```bash
docker compose up --build
```

- Web app: http://localhost:3000
- REST API: http://localhost:4000/api
- Health check: http://localhost:4000/health

The database schema and sample apartments are created automatically on the first run. To reset the sample database, run `docker compose down -v` and start again.

## Architecture

This repository is a pnpm workspace with two independently deployable applications:

- `apps/api`: Express + TypeScript REST API. Routes only handle HTTP concerns, the service owns business rules, and the repository isolates PostgreSQL queries.
- `apps/web`: Next.js App Router frontend. Server-rendered data is used for fast first paint; the listing search is a small client component with URL-backed state.
- PostgreSQL 16: schema constraints protect core invariants, while parameterized queries prevent SQL injection.

This amount of layering keeps the assignment testable and maintainable without introducing infrastructure that the current scope does not need.

## API

### `GET /api/apartments`

Query parameters: `search` (unit name, unit number, or project), `bedrooms`, `minPrice`, `maxPrice`, `page` (default 1), `limit` (default 12, max 50).

### `GET /api/apartments/:id`

Returns one apartment or a consistent `404` error response.

### `POST /api/apartments`

Accepts JSON with `unitName`, `unitNumber`, `project`, `location`, `price`, `bedrooms`, `bathrooms`, `areaSqm`, `description`, `imageUrl`, and optional `status`. Unknown or invalid fields return `422` with field-level details. Duplicate unit numbers return `409`.

Example:

```bash
curl -X POST http://localhost:4000/api/apartments \
  -H "Content-Type: application/json" \
  -d '{"unitName":"Garden Residence","unitNumber":"GR-204","project":"Solana","location":"New Cairo","price":7200000,"bedrooms":3,"bathrooms":2,"areaSqm":168,"description":"A bright apartment overlooking landscaped gardens with a generous reception area.","imageUrl":"https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80"}'
```

All list responses include pagination metadata. Errors share the shape `{ "error": { "code", "message", "details?" } }`.

## Local development

With Node.js 20+ and pnpm installed:

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

For the API outside Docker, expose a PostgreSQL database and set `DATABASE_URL`. Copy `.env.example` if you want to override defaults.

## Verification

The API test suite covers listing and pagination, combined search and filters, details, creation, malformed identifiers, and validation failures. Before submitting a change, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

The same production-shaped stack can then be checked with `docker compose up --build`.

## Decisions and trade-offs

- Prices are stored as integer EGP amounts to avoid floating-point rounding errors.
- Search is intentionally case-insensitive and indexed with PostgreSQL trigram indexes for realistic growth.
- Image URLs are stored rather than uploaded; media storage is outside the assignment scope.
- Authentication is omitted because the brief asks for a public add API. In production, creation would be protected by role-based authorization, request throttling, and audit logs.
- API tests exercise both the service and HTTP boundaries with an in-memory repository, keeping them fast and deterministic. The Docker smoke test covers the PostgreSQL integration; a production pipeline should also add disposable-database integration tests and browser-level tests.
