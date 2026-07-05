---
name: adonis-etl
description: Build ETL (Extract, Transform, Load) pipelines in AdonisJS applications with @jrmc/adonis-etl. Use when the user wants to import/export/migrate data (CSV, XLSX, JSON, API, database) in an AdonisJS project, or asks to create or scaffold ETL source, transform, or destination components.
---

# Build ETL pipelines in AdonisJS with @jrmc/adonis-etl

`@jrmc/adonis-etl` is the AdonisJS adapter (v6 and v7) for the `@jrmc/etl` library. It re-exports the ETL engine and types, and adds a `make:etl` scaffolding command.

For core ETL concepts (input shapes, inline functions, `[LazyImport, options]` tuples, generic recipes), see the `etl-pipeline` skill from the `@jrmc/etl` package. This skill covers what is specific to AdonisJS.

## Installation

```bash
node ace add @jrmc/adonis-etl
```

This registers the package commands in `adonisrc.ts`.

## Imports (AdonisJS projects)

Always import from `@jrmc/adonis-etl`, never from `@jrmc/etl` directly:

```ts
import { etl } from '@jrmc/adonis-etl'
import type { Source, Transform, Destination } from '@jrmc/adonis-etl'
```

## File locations

Components live under the directory configured in `adonisrc.ts` via `directories.etl`, with fallback `app/etl/`:

```ts
// adonisrc.ts
export default defineConfig({
  directories: {
    etl: 'etl', // optional — files go to etl/ instead of app/etl/
  },
})
```

Layout: `<etl-dir>/sources/`, `<etl-dir>/transforms/`, `<etl-dir>/destinations/`. Optionally add an import alias in `package.json`: `"#etl/*": "./etl/*.js"`.

## Creating components

The `node ace make:etl <name>` command exists but is **interactive** (multiselect + prompts). As an agent, create the files manually instead, following the exact naming convention:

| Component | File name | Class name |
|---|---|---|
| Source | `{process}_{source_type}_source.ts` | `{Process}{SourceType}Source` |
| Transform | `{process}_{source_type}_to_{destination_type}_transform.ts` | `{Process}{SourceType}To{DestinationType}Transform` |
| Destination | `{process}_{destination_type}_destination.ts` | `{Process}{DestinationType}Destination` |

Example for process `import-product`, source `csv`, destination `db`:

- `sources/import_product_csv_source.ts` → `ImportProductCsvSource`
- `transforms/import_product_csv_to_db_transform.ts` → `ImportProductCsvToDbTransform`
- `destinations/import_product_db_destination.ts` → `ImportProductDbDestination`

Each file default-exports a class implementing the matching interface:

```ts
// sources/import_product_csv_source.ts
import type { Source } from '@jrmc/adonis-etl'

export default class ImportProductCsvSource implements Source {
  async *each() {
    // yield items one by one, or yield whole batches (arrays)
  }
}
```

```ts
// transforms/import_product_csv_to_db_transform.ts
import type { Transform } from '@jrmc/adonis-etl'

export default class ImportProductCsvToDbTransform implements Transform {
  async process(row: unknown) {
    return row
  }
}
```

```ts
// destinations/import_product_db_destination.ts
import type { Destination } from '@jrmc/adonis-etl'

export default class ImportProductDbDestination implements Destination {
  async write(row: unknown) {
    // persist; the return value is collected into etl.run's result array
  }
}
```

## Running a pipeline: Ace command with `startApp: true`

Run pipelines from an Ace command. **`startApp: true` is required** to boot the application — without it the IoC container is not ready and Lucid models / `db` service will fail:

```ts
// commands/import_products.ts
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { etl } from '@jrmc/adonis-etl'

export default class ImportProducts extends BaseCommand {
  static commandName = 'import:products'
  static description = 'Import products from CSV'

  static options: CommandOptions = {
    startApp: true, // required for Lucid/db access
  }

  async run() {
    await etl.run({
      source: () => import('../etl/sources/import_product_csv_source.js'),
      transform: () => import('../etl/transforms/import_product_csv_to_db_transform.js'),
      destination: () => import('../etl/destinations/import_product_db_destination.js'),
    })
  }
}
```

`transform` is optional — omit it for direct source → destination pipelines. Relative imports must use the `.js` extension (ESM), even in TypeScript files.

## Persistence: Lucid model vs query builder

- Per-item pipeline → Lucid model: `await Product.create(row)` (hooks, timestamps, serialization).
- Batch pipeline → query builder for speed: `await db.table('products').multiInsert(rows)` (no model hooks).

Keep source/transform/destination consistent: if the source yields arrays (batches), the destination receives arrays.

## Large volumes

For very large imports, consider dispatching ETL runs to a job queue (BullMQ, AdonisJS Queue) for async execution, worker distribution, and retries.

## References

- [references/recipes.md](references/recipes.md) — two complete AdonisJS recipes: batched CSV → database via `multiInsert`, and CSV → transform → Lucid model. Read when implementing a concrete pipeline.
