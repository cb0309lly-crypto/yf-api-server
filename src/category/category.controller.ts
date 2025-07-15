import { Controller, Get, Post, Put, Delete, Body, Param, Query, Request } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  create(@Body() body) {
    return this.categoryService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.categoryService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoryService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.categoryService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.categoryService.remove(id);
  }

  @Get('tree/list')
  getCategoryTree() {
    return this.categoryService.getCategoryTree();
  }

  @Get(':id/products')
  getCategoryProducts(@Param('id') id: string, @Query() query) {
    return this.categoryService.getCategoryProducts(id, query);
  }
} 