import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { Product } from '../entity/product';
import { ProductService } from './product.service';

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  addProduct(@Body() body: Partial<Product>): Promise<Product> {
    return this.productService.addProduct(body);
  }

  @Put()
  editProduct(@Body() body: Partial<Product>) {
    return this.productService.updateProduct(body);
  }

  @Get('/:id')
  getOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }

  @Get('/list')
  getList() {
    return this.productService.findAll();
  }
}
