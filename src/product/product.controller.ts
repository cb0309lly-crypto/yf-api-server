import { Controller, Get, Post, Put, Delete, Body, Param, Query, UsePipes } from '@nestjs/common';
import { Product } from '../entity/product';
import { ProductService } from './product.service';
import { CreateProductDto, UpdateProductDto, QueryProductDto, ProductIdDto } from './dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';

@Controller('product')
@UsePipes(new ValidationPipe())
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.addProduct(createProductDto);
  }

  @Put()
  async update(@Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(updateProductDto);
  }

  @Get('/list')
  async findAll(@Query() queryProductDto: QueryProductDto) {
    const { page = 1, pageSize = 10, keyword, categoryNo, status, companyNo, name } = queryProductDto;
    return this.productService.findAllPaged(page, pageSize, keyword || name, categoryNo, status);
  }

  @Delete('/:id')
  async remove(@Param() params: ProductIdDto) {
    // 软删除可在service实现，这里先简单返回
    // return this.productService.remove(params.id);
    return { message: `删除商品${params.id}功能待实现` };
  }

  @Get('/:id')
  async findOne(@Param() params: ProductIdDto) {
    return this.productService.findOne(params.id);
  }


}
