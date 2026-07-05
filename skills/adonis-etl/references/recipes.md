# AdonisJS ETL recipes

Two complete, working pipelines (taken from the package's `sample/` app). Both assume `directories.etl: 'etl'` in `adonisrc.ts`; adjust paths if using the default `app/etl/`.

CSV parsing uses the `csv-parser` package: `npm install csv-parser`.

## Recipe 1 — Batched CSV → database (high volume, no transform)

Best for large files (millions of rows): the source yields batches (arrays), the destination bulk-inserts with the query builder. No Lucid model hooks run.

### Source — `etl/sources/book_csv_source.ts`

```ts
import type { Source } from '@jrmc/adonis-etl'
import fs from 'node:fs'
import csv from 'csv-parser'

export default class BookCsvSource implements Source {
  async *each() {
    const stream = fs
      .createReadStream('etl/resources/books.csv', {
        highWaterMark: 128 * 1024, // 128KB buffer for very large files
      })
      .pipe(csv())

    let batch = []
    const BATCH_SIZE = 500 // keep moderate to respect SQLite parameter limits

    for await (const data of stream) {
      batch.push(data)

      if (batch.length >= BATCH_SIZE) {
        yield batch
        batch = []
      }
    }

    if (batch.length > 0) {
      yield batch
    }
  }
}
```

### Destination — `etl/destinations/book_db_destination.ts`

```ts
import type { Destination } from '@jrmc/adonis-etl'
import db from '@adonisjs/lucid/services/db'

type BookData = {
  name: string
}

export default class BookDbDestination implements Destination {
  async write(rows: BookData[]) {
    await db.table('books').multiInsert(rows)
    return rows
  }
}
```

### Command — `commands/import_books.ts`

```ts
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { etl } from '@jrmc/adonis-etl'

export default class ImportBooks extends BaseCommand {
  static commandName = 'import:books'
  static description = 'Import books from CSV'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    await etl.run({
      source: () => import('../etl/sources/book_csv_source.js'),
      destination: () => import('../etl/destinations/book_db_destination.js'),
    })
  }
}
```

Run with `node ace import:books`.

## Recipe 2 — CSV → transform → Lucid model (per-row)

Best when rows need reshaping (e.g. renaming CSV headers to model columns) and model hooks/timestamps matter. Slower than batching: one insert per row.

### Source — `etl/sources/product_csv_source.ts`

```ts
import type { Source } from '@jrmc/adonis-etl'
import fs from 'node:fs'
import csv from 'csv-parser'

export default class ProductCsvSource implements Source {
  async *each() {
    const stream = fs
      .createReadStream('etl/resources/products.csv', {
        highWaterMark: 128 * 1024,
      })
      .pipe(csv())

    for await (const data of stream) {
      yield data
    }
  }
}
```

### Transform — `etl/transforms/product_csv_to_db_transform.ts`

Maps CSV column names (here French headers) to model attributes:

```ts
import type { Transform } from '@jrmc/adonis-etl'

type Product = {
  Nom: string
  Prix: number
  Couleur: string
  Taille: string
  Stock: number
  Description: string
  Catégorie: string
}

export default class ProductCsvToDbTransform implements Transform {
  async process(row: Product) {
    return {
      name: row.Nom,
      price: row.Prix,
      color: row.Couleur,
      size: row.Taille,
      quantity: row.Stock,
      description: row.Description,
      category: row['Catégorie'],
    }
  }
}
```

### Destination — `etl/destinations/product_db_destination.ts`

```ts
import type { Destination } from '@jrmc/adonis-etl'
import Product from '#models/product'

type ProductData = {
  name: string
  price: number
  color: string
  size: string
  quantity: number
  description: string
  category: string
}

export default class ProductDbDestination implements Destination {
  async write(row: ProductData) {
    await Product.create(row)
    return row
  }
}
```

### Command — `commands/import_products.ts`

```ts
import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { etl } from '@jrmc/adonis-etl'

export default class ImportProducts extends BaseCommand {
  static commandName = 'import:products'
  static description = 'Import products from CSV'

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    await etl.run({
      source: () => import('../etl/sources/product_csv_source.js'),
      transform: () => import('../etl/transforms/product_csv_to_db_transform.js'),
      destination: () => import('../etl/destinations/product_db_destination.js'),
    })
  }
}
```

Run with `node ace import:products`.

## Choosing between the two

| Criterion | Recipe 1 (batch + multiInsert) | Recipe 2 (per-row + Lucid) |
|---|---|---|
| Volume | Millions of rows | Small/medium |
| Model hooks, timestamps | ✗ | ✓ |
| Column remapping | Do it in the source or add a transform | Transform |
| Speed | Fast | Slower |

To combine both strengths (batch + Lucid), yield batches from the source and use `Model.createMany(rows)` in the destination.
