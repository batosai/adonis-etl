import type { Source } from '@jrmc/adonis-etl'
import fs from 'node:fs'
import csv from 'csv-parser'

export default class product_csv_source implements Source {
  async *each() {
    // Optimized version for large files (500k+ rows)
    const stream = fs.createReadStream('etl/resources/products.csv', {
      highWaterMark: 128 * 1024 // 128KB buffer optimized for millions of rows
    }).pipe(csv())

    for await (const data of stream) {
      yield data
    }
  }
}
