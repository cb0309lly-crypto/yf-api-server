import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, CategoryQueryDto, CategoryIdDto } from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('分类管理')
@ApiBearerAuth()
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @ApiOperation({ summary: '创建分类' })
  create(@Body() body: CreateCategoryDto) {
    return this.categoryService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取分类列表' })
  findAll(@Query() query: CategoryQueryDto) {
    return this.categoryService.findAll(query);
  }

  @Get('tree/list')
  @ApiOperation({ summary: '获取分类树' })
  getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @Get(':id')
  @ApiOperation({ summary: '获取分类详情' })
  findOne(@Param() params: CategoryIdDto) {
    return this.categoryService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新分类' })
  update(@Param() params: CategoryIdDto, @Body() body: UpdateCategoryDto) {
    return this.categoryService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除分类' })
  remove(@Param() params: CategoryIdDto) {
    return this.categoryService.remove(params.id);
  }

  @Get(':id/products')
  @ApiOperation({ summary: '获取分类下的商品' })
  getCategoryProducts(@Param() params: CategoryIdDto, @Query() query: any) {
    return this.categoryService.getCategoryProducts(params.id, query);
  }
}
