/**
 * @jrmc/adonis-etl
 *
 * @license MIT
 * @copyright Jeremy Chaufourier <jeremy@chaufourier.fr>
 */

// import { stubsRoot } from '../../stubs/main.js'
import { args, BaseCommand } from '@adonisjs/core/ace'
import string from '@adonisjs/core/helpers/string'
import { stubsRoot } from '../../stubs/main.js'

export default class MakeEtl extends BaseCommand {
  static commandName = 'make:etl'
  static description = 'Create a new ETL files (source, transform, destination)'

  @args.string({ description: 'Name of the ETL process' })
  declare name: string

  async run() {
    // Ask which ETL components to create
    const components = await this.prompt.multiple('Which ETL components do you want to create?', [
      'Source',
      'Transform',
      'Destination'
    ], {
      validate: (value) => {
        if (!value || value.length === 0) {
          return 'You must select at least one component'
        }
        return true
      }
    })

    // Ask for source details if source is selected
    let sourceDetails = null
    if (components.includes('Source') || components.includes('Transform')) {
      sourceDetails = await this.prompt.ask('What is the source type? (e.g., database, api, file)', {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Source type is required'
          }
          return true
        }
      })
    }

    // Ask for destination details if destination is selected
    let destinationDetails = null
    if (components.includes('Destination') || components.includes('Transform')) {
      destinationDetails = await this.prompt.ask('What is the destination type? (e.g., database, api, file)', {
        validate: (value) => {
          if (!value || value.trim().length === 0) {
            return 'Destination type is required'
          }
          return true
        }
      })
    }

    const codemods = await this.createCodemods()
    let className = null

    // Create the selected components
    for (const component of components) {
      if (component === 'Source') {
        className = [
          string.snakeCase(this.name),
          string.snakeCase(sourceDetails!),
          'source',
        ].join('_')
      } else if (component === 'Destination') {
        className = [
          string.snakeCase(this.name),
          string.snakeCase(destinationDetails!),
          'destination',
        ].join('_')
      } else if (component === 'Transform') {
        className = [
          string.snakeCase(this.name),
          string.snakeCase(sourceDetails!),
          'to',
          string.snakeCase(destinationDetails!),
          'transform',
        ].join('_')
      }

      const stubPath = `make/etl/${component.toLowerCase()}s/main.ts.stub`

      await codemods.makeUsingStub(stubsRoot, stubPath, {
        className
      })
    }

    this.logger.success(`ETL files created successfully for: ${this.name}`)
  }
}
