import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entity/product';
import { paginate, PaginationResult } from '../common/utils/pagination.util';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addProduct(data: Partial<Product>): Promise<Product> {
    try {
      const product = this.productRepository.create(data);
      const saved = await this.productRepository.save(product);
      return saved;
    } catch (err) {
      throw new BadRequestException('新增商品失败: ' + err.message);
    }
  }

  async updateProduct(data: Partial<Product>): Promise<Product> {
    if (!data.no) {
      throw new BadRequestException('缺少商品主键no');
    }
    const product = await this.productRepository.findOne({
      where: { no: data.no },
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    Object.assign(product, data);
    try {
      const saved = await this.productRepository.save(product);
      return saved;
    } catch (err) {
      throw new BadRequestException('更新商品失败: ' + err.message);
    }
  }

  async findAll(): Promise<Product[]> {
    const list = await this.productRepository.find();
    if (!list || list.length === 0) {
      throw new NotFoundException('暂无商品');
    }
    return list;
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    name?: string,
    categoryNo?: string,
    status?: ProductStatus,
  ): Promise<PaginationResult<Product>> {
    const qb = this.productRepository.createQueryBuilder('product');
    if (name) {
      qb.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (categoryNo) {
      qb.andWhere('product.categoryNo = :categoryNo', { categoryNo });
    }
    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    const result = await paginate(qb, page, pageSize);
    return result;
  }

  async findOne(no: string): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { no } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    return product;
  }
}
