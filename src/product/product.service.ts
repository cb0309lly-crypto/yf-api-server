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
import {
  BatchImportProductItemDto,
  BatchImportResultDto,
} from './dto/batch-import-product.dto';

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

    // 按更新时间降序排序
    qb.orderBy('product.updatedAt', 'DESC');

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

  /**
   * 批量导入商品（覆盖更新模式）
   * @description 根据商品名称匹配：存在则更新，不存在则新增
   * @param products 商品数据列表
   * @returns 导入结果
   */
  async batchImport(
    products: BatchImportProductItemDto[],
  ): Promise<BatchImportResultDto> {
    const result: BatchImportResultDto = {
      successCount: 0,
      insertCount: 0,
      updateCount: 0,
      failCount: 0,
      failures: [],
      successNos: [],
    };

    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      try {
        // 校验必填字段
        if (!productData.name || productData.name.trim() === '') {
          throw new Error('商品名称不能为空');
        }
        if (
          productData.price === undefined ||
          productData.price === null ||
          isNaN(Number(productData.price))
        ) {
          throw new Error('商品价格无效');
        }

        const trimmedName = productData.name.trim();

        // 根据商品名称查找是否存在（包括已删除的商品，以便恢复）
        const existingProduct = await this.productRepository.findOne({
          where: { name: trimmedName },
        });

        let saved: Product;

        if (existingProduct) {
          // 商品已存在，更新信息
          existingProduct.description = productData.description ?? existingProduct.description;
          existingProduct.price = Number(productData.price);
          existingProduct.marketPrice = productData.marketPrice
            ? Number(productData.marketPrice)
            : existingProduct.marketPrice;
          existingProduct.imgUrl = productData.imgUrl ?? existingProduct.imgUrl;
          existingProduct.status = productData.status || existingProduct.status;
          existingProduct.specs = productData.specs ?? existingProduct.specs;
          existingProduct.unit = productData.unit ?? existingProduct.unit;
          existingProduct.tag = productData.tag ?? existingProduct.tag;
          existingProduct.categoryNo = productData.categoryNo ?? existingProduct.categoryNo;
          existingProduct.minBuyQuantity = productData.minBuyQuantity ?? existingProduct.minBuyQuantity;
          existingProduct.saleUnitQuantity = productData.saleUnitQuantity ?? existingProduct.saleUnitQuantity;
          existingProduct.isDelete = false; // 如果之前被删除，恢复商品

          saved = await this.productRepository.save(existingProduct);
          result.updateCount++;
        } else {
          // 商品不存在，创建新商品
          const product = this.productRepository.create({
            name: trimmedName,
            description: productData.description,
            price: Number(productData.price),
            marketPrice: productData.marketPrice
              ? Number(productData.marketPrice)
              : undefined,
            imgUrl: productData.imgUrl,
            status: productData.status || ProductStatus.ACTIVE,
            specs: productData.specs,
            unit: productData.unit,
            tag: productData.tag,
            categoryNo: productData.categoryNo,
            minBuyQuantity: productData.minBuyQuantity || 1,
            saleUnitQuantity: productData.saleUnitQuantity || 1,
            isDelete: false,
          });

          saved = await this.productRepository.save(product);
          result.insertCount++;
        }

        result.successCount++;
        result.successNos.push(saved.no);
      } catch (err) {
        result.failCount++;
        result.failures.push({
          index: i + 1,
          name: productData.name || `第${i + 1}行`,
          reason: err.message || '未知错误',
        });
      }
    }

    return result;
  }
}
