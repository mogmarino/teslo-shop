import { Injectable } from '@nestjs/common';
import { ProductsService } from 'src/products/products.service';
import { initialData } from './data/seed-data';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class SeedService {

  constructor(
    private readonly productsService: ProductsService
  ){}

  async runSeed (user: User) {

    await this.insertNewProducts(user)
    return 'SEED EXECUTED'
  }

  private async insertNewProducts (user: User) {

    await this.productsService.deleteAllProducts()

    const products = initialData.products

    const insertPromises = []

    products.forEach(prodcut => {
      insertPromises.push(this.productsService.create(prodcut, user))
    })

    await Promise.all(insertPromises)

    return true
  }
}
