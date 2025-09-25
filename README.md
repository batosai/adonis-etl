# @jrmc/adonis-etl

[![npm version](https://badge.fury.io/js/%40jrmc%2Fadonis-etl.svg)](https://badge.fury.io/js/%40jrmc%2Fadonis-etl)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

AdonisJS ETL skaffold commands package - Generate ETL (Extract, Transform, Load) components for your AdonisJS applications.

## Features

- 🚀 **Interactive CLI** - Guided command to create ETL components
- 📦 **Component Generation** - Generate Source, Transform, and Destination classes
- 🎯 **Smart Naming** - Automatic class naming based on your ETL process
- 🔧 **TypeScript Ready** - Full TypeScript support with proper interfaces
- 📁 **Organized Structure** - Files are created in proper directories (`app/etl/`)

## Installation

```bash
node ace add @jrmc/adonis-etl
```

### Generate ETL Components

Run the interactive command to create your ETL components:

```bash
node ace make:etl my-process
```

The command will guide you through:

1. **Selecting components** - Choose which ETL components to create:
   - Source (data extraction)
   - Transform (data transformation)
   - Destination (data loading)

2. **Defining source type** - Specify your data source (e.g., `database`, `api`, `file`)

3. **Defining destination type** - Specify your data destination (e.g., `database`, `api`, `file`)

### Example

```bash
$ node ace make:etl import-product

? Which ETL components do you want to create? › 
❯◉ Source
 ◉ Transform  
 ◉ Destination

? What is the source type? (e.g., database, api, file) › csv
? What is the destination type? (e.g., database, api, file) › db

✅ ETL files created successfully for: import-product
```

This will create:

- `app/etl/sources/import_product_csv_source.ts`
- `app/etl/transforms/import_product_csv_to_db_transform.ts`
- `app/etl/destinations/import_product_db_destination.ts`

## Generated Files

### Source Component

```typescript
import { Source } from '@jrmc/adonis-etl'

export default class ImportProductCsvSource implements Source {
  async *each() {
    // Implement your data extraction logic here
  }
}
```

### Transform Component

```typescript
import { Transform } from '@jrmc/adonis-etl'

export default class ImportProductCsvToDbTransform implements Transform {
  async process(row: unknown) {
    // Implement your data transformation logic here
    return row
  }
}
```

### Destination Component

```typescript
import { Destination } from '@jrmc/adonis-etl'

export default class ImportProductDbDestination implements Destination {
  async write(row: unknown) {
    // Implement your data loading logic here
  }
}
```

## Dependencies

This package requires:
- `@jrmc/etl` - The core ETL library
- AdonisJS 6.x
- Node.js 22.17.0+

## File Structure

Generated files are organized in the following structure:

```
app/
└── etl/
    ├── sources/
    │   └── your_source_files.ts
    ├── transforms/
    │   └── your_transform_files.ts
    └── destinations/
        └── your_destination_files.ts
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

**Jeremy Chaufourier**
- Email: jeremy@chaufourier.fr
- GitHub: [@batosai](https://github.com/batosai)

## Changelog

### 1.0.0-alpha.1
- Initial release
- Interactive ETL component generation
- Support for Source, Transform, and Destination components
- TypeScript support
