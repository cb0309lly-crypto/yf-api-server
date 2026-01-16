import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { Product } from '../entity/product';
import { ProductService } from './product.service';
import {
  CreateProductDto,
  UpdateProductDto,
  QueryProductDto,
  ProductIdDto,
} from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('商品管理')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @ApiOperation({ summary: '创建商品' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.addProduct(createProductDto);
  }

  @Put()
  @ApiOperation({ summary: '更新商品' })
  async update(@Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(updateProductDto);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取商品列表' })
  async findAll(@Query() queryProductDto: QueryProductDto) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryNo,
      status,
      companyNo,
      name,
    } = queryProductDto;
    return this.productService.findAllPaged(
      page,
      pageSize,
      keyword || name,
      categoryNo,
      status,
    );
  }

  @Get('/:id')
  @ApiOperation({ summary: '获取商品详情' })
  async findOne(@Param() params: ProductIdDto) {
    return this.productService.findOne(params.id);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除商品' })
  async remove(@Param() params: ProductIdDto) {
    // 软删除可在service实现，这里先简单返回
    // return this.productService.remove(params.id);
    return { message: `删除商品${params.id}功能待实现` };
  }
}
