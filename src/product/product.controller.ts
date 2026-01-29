import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Product, ProductStatus } from '../entity/product';
import { ProductService } from './product.service';
import {
  BatchImportProductDto,
  BatchImportResultDto,
  CreateProductDto,
  ProductDetailDto,
  ProductIdDto,
  QueryProductDto,
  UpdateProductDto,
} from './dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('商品管理')
@ApiBearerAuth()
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  // ========== 管理端接口（需要鉴权）==========

  @Post()
  @ApiOperation({ summary: '创建商品（管理端）' })
  async create(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return this.productService.addProduct(createProductDto);
  }

  @Post('/batch-import')
  @ApiOperation({ summary: '批量导入商品（管理端）' })
  async batchImport(
    @Body() batchImportDto: BatchImportProductDto,
  ): Promise<BatchImportResultDto> {
    return this.productService.batchImport(batchImportDto.products);
  }

  @Put()
  @ApiOperation({ summary: '更新商品（管理端）' })
  async update(@Body() updateProductDto: UpdateProductDto) {
    return this.productService.updateProduct(updateProductDto);
  }

  @Delete('/:id')
  @ApiOperation({ summary: '删除商品（管理端）' })
  async remove(@Param() params: ProductIdDto) {
    return this.productService.remove(params.id);
  }

  // ========== 小程序端接口（开放访问）==========

  @Public()
  @Get('/list')
  @ApiOperation({ summary: '获取商品列表（小程序端-无需登录）' })
  async findAll(@Query() queryProductDto: QueryProductDto) {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      categoryNo,
      status,
      name,
    } = queryProductDto;

    // 限制每页最大数量，防止恶意请求
    const limitedPageSize = Math.min(pageSize, 50);

    // 小程序端只返回上架商品（status = 1）
    const publicStatus = status === undefined ? ProductStatus.ACTIVE : status;

    return this.productService.findAllPaged(
      page,
      limitedPageSize,
      keyword || name,
      categoryNo,
      publicStatus,
    );
  }

  @Public()
  @Get('/search/popular')
  @ApiOperation({ summary: '获取热门搜索词（小程序端-无需登录）' })
  async getPopularKeywords(@Query('limit') limit?: string) {
    const pageLimit = Math.min(Number(limit) || 10, 20);
    return this.productService.getPopularKeywords(pageLimit);
  }

  @Public()
  @Get('/search/history')
  @ApiOperation({ summary: '获取搜索历史（小程序端-无需登录）' })
  getSearchHistory() {
    return [];
  }

  @Public()
  @Get('/:id')
  @ApiOperation({ summary: '获取商品详情（小程序端-无需登录）' })
  async findOne(@Param() params: ProductIdDto): Promise<ProductDetailDto> {
    return this.productService.findOne(params.id);
  }
}
