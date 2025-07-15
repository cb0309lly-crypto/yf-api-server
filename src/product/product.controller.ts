import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { Product } from '../entity/product';
import { ProductService } from './product.service';
// import { CreateProductDto, UpdateProductDto, ProductListQueryDto } from './dto'; // 可后续补充

@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() body: Partial<Product>): Promise<Product> {
    return this.productService.addProduct(body);
  }

  @Put()
  async update(@Body() body: Partial<Product>) {
    return this.productService.updateProduct(body);
  }

  @Get('/list')
  async findAll(
    @Query('page') page = 1,
    @Query('pageSize') pageSize = 10,
    @Query('keyword') name?: string,
    @Query('categoryNo') categoryNo?: string,
    @Query('status') status?: string,
  ) {
    return this.productService.findAllPaged(Number(page), Number(pageSize), name, categoryNo, status);
  }

  @Delete('/:id')
  async remove(@Param('id') id: string) {
    // 软删除可在service实现，这里先简单返回
    // return this.productService.remove(id);
    return { message: `删除商品${id}功能待实现` };
  }

  @Get('/:id')
  async findOne(@Param('id') id: string) {
    return this.productService.findOne(id);
  }


}
