import type { Transform } from '@jrmc/adonis-etl'

type Product = {
  Nom: string
  Prix: number
  Couleur: string
  Taille: string
  Stock: number
  Description: string
  'Catégorie': string
}

export default class product_csv_to_db_transform implements Transform {
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
