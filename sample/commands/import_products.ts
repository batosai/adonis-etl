import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import { etl } from '@jrmc/adonis-etl'

export default class ImportProducts extends BaseCommand {
  static commandName = 'import:products'
  static description = ''

  static options: CommandOptions = {
    startApp: true,
  }

  async run() {
    this.logger.info('Hello world from "ImportProduct"')


    const productCsvSource = () => import('../etl/sources/product_csv_source.js')
    const productCsvToDbTransform = () => import('../etl/transforms/product_csv_to_db_transform.js')
    const productDbDestination = () => import('../etl/destinations/product_db_destination.js')

    await etl.run({
      source: productCsvSource,
      transform: productCsvToDbTransform,
      destination: productDbDestination
    })
  }
}
