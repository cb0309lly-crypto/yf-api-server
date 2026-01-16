import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product, ProductStatus } from '../entity/product';
import { paginate, PaginationResult } from '../common/utils/pagination.util';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class ProductService {
  private readonly CACHE_KEY_PREFIX = 'product:';
  private readonly CACHE_TTL = 3600; // 1 hour

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    private readonly redisService: RedisService,
  ) {}

  async addProduct(data: Partial<Product>): Promise<Product> {
    try {
      const product = this.productRepository.create(data);
      const saved = await this.productRepository.save(product);
      await this.clearCache();
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
      await this.clearCache();
      return saved;
    } catch (err) {
      throw new BadRequestException('更新商品失败: ' + err.message);
    }
  }

  async findAll(): Promise<Product[]> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}all`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const list = await this.productRepository.find();
    if (!list || list.length === 0) {
      throw new NotFoundException('暂无商品');
    }
    
    await this.redisService.set(cacheKey, list, this.CACHE_TTL);
    return list;
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    name?: string,
    categoryNo?: string,
    status?: ProductStatus,
  ): Promise<PaginationResult<Product>> {
    // Only cache first page with no filters as it's the most common request
    const isDefaultQuery = page === 1 && pageSize === 10 && !name && !categoryNo && !status;
    const cacheKey = `${this.CACHE_KEY_PREFIX}list:default`;

    if (isDefaultQuery) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

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
    
    if (isDefaultQuery) {
      await this.redisService.set(cacheKey, result, this.CACHE_TTL);
    }
    
    return result;
  }

  async findOne(no: string): Promise<Product> {
    const cacheKey = `${this.CACHE_KEY_PREFIX}detail:${no}`;
    const cached = await this.redisService.get(cacheKey);
    if (cached) {
      return cached;
    }

    const product = await this.productRepository.findOne({ where: { no } });
    if (!product) {
      throw new NotFoundException('商品不存在');
    }
    
    await this.redisService.set(cacheKey, product, this.CACHE_TTL);
    return product;
  }

  private async clearCache() {
    const keys = await this.redisService.keys(`${this.CACHE_KEY_PREFIX}*`);
    if (keys.length > 0) {
      for (const key of keys) {
        await this.redisService.del(key);
      }
    }
  }
}
