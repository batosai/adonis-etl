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

export default class product_db_destination implements Destination {
  async write(row: ProductData) {
    await Product.create(row)
    console.log(row)
    return row
  }
}
