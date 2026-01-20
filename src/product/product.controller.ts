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
  ProductDetailDto,
  BatchImportProductDto,
  BatchImportResultDto,
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

  @Post('/batch-import')
  @ApiOperation({ summary: '批量导入商品' })
  async batchImport(
    @Body() batchImportDto: BatchImportProductDto,
  ): Promise<BatchImportResultDto> {
    return this.productService.batchImport(batchImportDto.products);
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
  async findOne(@Param() params: ProductIdDto): Promise<ProductDetailDto> {
    return this.productService.findOne(params.id);
  }

  @Get('/search/popular')
  @ApiOperation({ summary: '获取热门搜索词' })
  async getPopularKeywords(@Query('limit') limit?: string) {
    const pageLimit = Number(limit) || 10;
    return this.productService.getPopularKeywords(pageLimit);
  }

  @Get('/search/history')
  @ApiOperation({ summary: '获取搜索历史' })
  async getSearchHistory() {
    return [];
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除商品' })
  async remove(@Param() params: ProductIdDto) {
    return this.productService.remove(params.id);
  }
}
