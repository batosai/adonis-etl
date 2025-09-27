import { Destination } from '@jrmc/adonis-etl'
// import Book from '#models/book'
import db from '@adonisjs/lucid/services/db'

type BookData = {
  name: string
}

export default class book_db_destination implements Destination {
  async write(rows: BookData[]) {
    // await Book.createMany(rows)
    console.log(rows)

    await db
    .table('books')
    .multiInsert(rows)

    return rows
  }
}
