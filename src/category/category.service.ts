import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryStatus } from '../entity/category';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async create(body) {
    const category = this.categoryRepository.create(body as any) as unknown as Category;
    if (body.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { no: body.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      category.categoryLevel = parent.categoryLevel + 1;
    } else {
      category.categoryLevel = 1;
    }
    return this.categoryRepository.save(category);
  }

  findAll(query) {
    const { page = 1, limit = 10, status, parentId } = query;
    const queryBuilder = this.categoryRepository.createQueryBuilder('category');

    if (status) {
      queryBuilder.andWhere('category.status = :status', { status });
    }

    if (parentId) {
      queryBuilder.andWhere('category.parentId = :parentId', { parentId });
    }

    queryBuilder
      .orderBy('category.sort', 'ASC')
      .addOrderBy('category.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.categoryRepository.findOne({
      where: { no: id },
      relations: ['products'],
    });
  }

  async update(id: string, body) {
    if (body.parentId) {
      const parent = await this.categoryRepository.findOne({
        where: { no: body.parentId },
      });
      if (!parent) {
        throw new BadRequestException('父分类不存在');
      }
      body.categoryLevel = parent.categoryLevel + 1;
    }
    return this.categoryRepository.update(id, body);
  }

  async remove(id: string) {
    const childCount = await this.categoryRepository.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException('请先删除子分类');
    }
    return this.categoryRepository.delete(id);
  }

  getCategoryTree() {
    return this.categoryRepository.find({
      where: {
        status: CategoryStatus.ACTIVE,
        // 只返回一级分类
        categoryLevel: 1,
      },
      order: { sort: 'ASC', createdAt: 'DESC' },
    });
  }

  async getCategoryProducts(id: string, query) {
    const { page = 1, limit = 10 } = query;

    // 先查询分类，确保分类存在
    const category = await this.categoryRepository.findOne({
      where: { no: id },
    });

    if (!category) {
      throw new BadRequestException('分类不存在');
    }

    const queryBuilder = this.categoryRepository.manager
      .createQueryBuilder()
      .select('product')
      .from('yf_db_product', 'product')
      .where('product.category_no = :categoryId', { categoryId: id })
      .andWhere('product.status = :status', { status: '已上架' })
      .orderBy('product.created_at', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [list, total] = await queryBuilder.getManyAndCount();

    return {
      list,
      total,
      page: Number(page),
      limit: Number(limit),
    };
  }
}
