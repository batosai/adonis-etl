import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { etl } from '@jrmc/adonis-etl'

export default class ImportBooks extends BaseCommand {
  static commandName = 'import:books'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Hello world from "ImportBooks"')

    const bookCsvSource = () => import('../etl/sources/book_csv_source.js')
    const bookDbDestination = () => import('../etl/destinations/book_db_destination.js')

    await etl.run({
      source: bookCsvSource,
      destination: bookDbDestination
    })
  }
}
