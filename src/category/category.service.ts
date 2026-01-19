import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category, CategoryStatus } from '../entity/category';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  create(body) {
    const category = this.categoryRepository.create(body);
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

  update(id: string, body) {
    return this.categoryRepository.update(id, body);
  }

  remove(id: string) {
    return this.categoryRepository.delete(id);
  }

  getCategoryTree() {
    return this.categoryRepository
      .find({
        where: { status: CategoryStatus.ACTIVE },
        order: { sort: 'ASC', createdAt: 'DESC' },
      })
      .then((list) => {
        const nodeMap = new Map();
        const roots = [];

        list.forEach((item) => {
          nodeMap.set(item.no, { ...item, children: [] });
        });

        nodeMap.forEach((node) => {
          if (node.parentId && nodeMap.has(node.parentId)) {
            nodeMap.get(node.parentId).children.push(node);
          } else {
            roots.push(node);
          }
        });

        return roots;
      });
  }

  getCategoryProducts(id: string, query) {
    const { page = 1, limit = 10 } = query;

    const queryBuilder = this.categoryRepository
      .createQueryBuilder('category')
      .leftJoinAndSelect('category.products', 'product')
      .where('category.no = :id', { id })
      .andWhere('product.status = :status', { status: '已上架' })
      .orderBy('product.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }
}
