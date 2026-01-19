import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entity/product';
import { paginate, PaginationResult } from '../common/utils/pagination.util';
import { ProductDetailDto } from './dto/product-detail.dto';

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
    const list = await this.productRepository.find({
      where: { isDelete: false },
    });
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
    qb.andWhere('product.isDelete = :isDelete', { isDelete: false });

    if (name) {
      qb.andWhere('product.name LIKE :name', { name: `%${name}%` });
    }
    if (categoryNo) {
      // Validate if categoryNo is a potential UUID or valid ID to prevent 500 errors with JSON strings or short IDs
      if (
        !categoryNo.includes('{') &&
        !categoryNo.includes('}') &&
        categoryNo.length > 10
      ) {
        qb.andWhere('product.categoryNo = :categoryNo', { categoryNo });
      }
    }
    if (status) {
      qb.andWhere('product.status = :status', { status });
    }

    const result = await paginate(qb, page, pageSize);
    return result;
  }

  async findOne(no: string): Promise<ProductDetailDto> {
    const product = await this.productRepository.findOne({
      where: { no, isDelete: false },
      relations: ['inventories'],
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    const stockQuantity = product.inventories?.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0,
    );

    // Create a plain object that matches ProductDetailDto
    const productDetail = {
      ...product,
      stockQuantity,
    } as ProductDetailDto;

    return productDetail;
  }

  async remove(no: string): Promise<void> {
    const product = await this.productRepository.findOne({
      where: { no, isDelete: false },
    });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    product.isDelete = true;
    await this.productRepository.save(product);
  }

  async getPopularKeywords(limit = 10): Promise<string[]> {
    const list = await this.productRepository.find({
      select: ['name'],
      order: { createdAt: 'DESC' },
      take: limit,
    });
    return (list || []).map((item) => item.name).filter((name) => !!name);
  }
}
