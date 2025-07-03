# Data Migrations

This folder contains one-time data migration scripts for database maintenance and cleanup.

## Structure

- `data/` - One-time data migrations (player merges, data cleanup, etc.)
- Future: `schema/` - Schema migrations (if needed outside of Prisma)

## Naming Convention

Use the format: `YYYY-MM-DD-description.{sql|ts}`

Examples:
- `2025-07-03-merge-duplicate-player.sql`
- `2025-07-15-update-season-rankings.ts`

## Usage

### SQL Migrations
Run SQL files directly in your database client (pgAdmin, psql, etc.)

### TypeScript Migrations
Run from the project root:
```bash
tsx scripts/migrations/data/YYYY-MM-DD-script-name.ts
```
