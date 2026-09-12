# Core Backend API

Express API for the core application services.

## Development

```sh
npm install
npm run db:migrate
npm run start:dev
```

The health endpoint is available at `GET /health` and returns `OK`.

Source code is grouped by feature. Controllers define routes, services own
business rules, and repositories isolate Drizzle and PostgreSQL from the rest
of each feature. External providers live behind interfaces in `src/utils`.

## Quality checks

```sh
npm run lint
npm run typecheck
npm run build
```
