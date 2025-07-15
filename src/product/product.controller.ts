import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { Product } from '../entity/product';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async addProduct(@Body() body: Partial<Product>): Promise<Product> {
    return this.productService.addProduct(body);
  }

  @Put()
  async editProduct(@Body() body: Partial<Product>) {
    return this.productService.updateProduct(body);
  }

  @Get('/:id')
  async getOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('/list')
  async getList(): Promise<Product[]> {
    return this.productService.findAll();
  }
}
