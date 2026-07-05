# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Cursor, Copilot, etc.) when working with code in this repository.

## Overview

`@jrmc/adonis-etl` is an AdonisJS 6 package that provides a scaffolding command (`make:etl`) to generate ETL (Extract, Transform, Load) components. It wraps and re-exports the core ETL library `@jrmc/etl` (the actual `etl.run()` engine lives there, not here).

## Commands

```bash
npm run build        # clean + tsc + copy stubs + adonis-kit index (postbuild)
npm run typecheck    # tsc --noEmit
npm run format       # prettier --write .
```

There is no test suite in the package itself. The `sample/` directory is a full AdonisJS app used for manual testing (`node ace import:books`, `node ace import:products` inside `sample/`).

## Architecture

- `index.ts` — public API: re-exports `etl` and types from `@jrmc/etl`, plus `configure`.
- `configure.ts` — runs on `node ace add @jrmc/adonis-etl`; registers `@jrmc/adonis-etl/commands` in the consumer's `adonisrc.ts`.
- `commands/make/etl.ts` — the interactive `make:etl` command. Prompts for components (Source/Transform/Destination) and source/destination types, builds PascalCase class names, then generates files via `codemods.makeUsingStub`.
- `stubs/make/etl/{sources,transforms,destinations}/main.ts.stub` — templates. The output path respects `app.rcFile.directories['etl']` (fallback `app/etl/`); file names are derived from the class name in snake_case inside the stub itself.
- `sample/` — demo AdonisJS app with two working ETL pipelines (books: source→destination with batching; products: source→transform→destination via Lucid model).

## Naming convention (do not break — fixed in 1.0.2)

For process `import-product`, source `csv`, destination `db`:
- Source: `ImportProductCsvSource` → `import_product_csv_source.ts`
- Transform: `ImportProductCsvToDbTransform` → `import_product_csv_to_db_transform.ts`
- Destination: `ImportProductDbDestination` → `import_product_db_destination.ts`

## Build/publish specifics

- ESM only (`"type": "module"`); internal imports must use the `.js` extension.
- Stubs are copied verbatim to `build/stubs/` by `copy-stubs` — any new stub directory must keep the `make/etl/<component>s/main.ts.stub` layout expected by `commands/make/etl.ts`.
- `postbuild` runs `adonis-kit index build/commands` to generate the commands manifest — required for the package's `./commands` export.
- Publishing is automated: a push to `main` with a bumped `package.json` version creates a tag and publishes to npm (GitHub Actions `npm-publish.yml`). Bump the version deliberately.
- Node 22.17.0 (volta pin).
