import { Source } from '@jrmc/adonis-etl'
import fs from 'node:fs'
import csv from 'csv-parser'

export default class book_csv_source implements Source {
  async *each() {
    const stream = fs.createReadStream('etl/resources/books.csv', {
      highWaterMark: 128 * 1024 // 128KB for very large files
    }).pipe(csv())

    let batch = []
    const BATCH_SIZE = 500 // Reduced batch size to work better with SQLite limits

    for await (const data of stream) {
      batch.push(data)

      if (batch.length >= BATCH_SIZE) {
        yield batch
        batch = []
      }
    }

    // Yield remaining elements
    if (batch.length > 0) {
      yield batch
    }
  }
}
