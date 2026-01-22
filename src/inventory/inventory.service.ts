import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory, InventoryStatus } from '../entity/inventory';
import { PaginationResult, paginate } from '../common/utils/pagination.util';

@Injectable()
export class InventoryService {
  private readonly logger = new Logger(InventoryService.name);

  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
    private readonly dataSource: DataSource,
  ) {}

  create(body) {
    const inventory = this.inventoryRepository.create(body);
    return this.inventoryRepository.save(inventory);
  }

  findAll(query) {
    const { page = 1, limit = 10, status, productNo } = query;
    const queryBuilder =
      this.inventoryRepository.createQueryBuilder('inventory');

    if (status) {
      queryBuilder.andWhere('inventory.status = :status', { status });
    }

    if (productNo) {
      queryBuilder.andWhere('inventory.productNo = :productNo', { productNo });
    }

    queryBuilder
      .orderBy('inventory.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    keyword?: string,
    productNo?: string,
    location?: string,
    status?: InventoryStatus,
    minQuantity?: number,
    maxQuantity?: number,
  ): Promise<PaginationResult<Inventory>> {
    const qb = this.inventoryRepository.createQueryBuilder('inventory');

    if (keyword) {
      qb.andWhere(
        '(inventory.productNo LIKE :keyword OR inventory.warehouseLocation LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }
    if (productNo) {
      qb.andWhere('inventory.productNo = :productNo', { productNo });
    }
    if (location) {
      qb.andWhere('inventory.warehouseLocation LIKE :location', {
        location: `%${location}%`,
      });
    }
    if (status) {
      qb.andWhere('inventory.status = :status', { status });
    }
    if (minQuantity !== undefined) {
      qb.andWhere('inventory.quantity >= :minQuantity', { minQuantity });
    }
    if (maxQuantity !== undefined) {
      qb.andWhere('inventory.quantity <= :maxQuantity', { maxQuantity });
    }

    qb.orderBy('inventory.createdAt', 'DESC');

    return paginate(qb, page, pageSize);
  }

  findOne(id: string) {
    return this.inventoryRepository.findOne({
      where: { no: id },
      relations: ['product'],
    });
  }

  update(id: string, body) {
    return this.inventoryRepository.update(id, body);
  }

  remove(id: string) {
    return this.inventoryRepository.delete(id);
  }

  getProductInventory(productId: string) {
    return this.inventoryRepository.findOne({
      where: { productNo: productId },
      relations: ['product'],
    });
  }

  restock(id: string, quantity: number) {
    return this.inventoryRepository
      .createQueryBuilder()
      .update(Inventory)
      .set({
        quantity: () => `quantity + ${quantity}`,
        lastRestockDate: new Date(),
      })
      .where('no = :id', { id })
      .execute();
  }

  reserve(id: string, quantity: number) {
    return this.inventoryRepository
      .createQueryBuilder()
      .update(Inventory)
      .set({
        reservedQuantity: () => `reservedQuantity + ${quantity}`,
        availableQuantity: () => `availableQuantity - ${quantity}`,
      })
      .where('no = :id', { id })
      .andWhere('availableQuantity >= :quantity', { quantity })
      .execute();
  }

  getLowStockAlerts() {
    return this.inventoryRepository
      .createQueryBuilder('inventory')
      .leftJoinAndSelect('inventory.product', 'product')
      .where('inventory.quantity <= inventory.minStockLevel')
      .andWhere('inventory.status = :status', {
        status: InventoryStatus.IN_STOCK,
      })
      .getMany();
  }

  /**
   * 原子库存扣减（使用乐观锁）
   * @param productNo 商品编号
   * @param quantity 扣减数量
   * @returns 是否成功
   */
  async decreaseStock(productNo: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      throw new BadRequestException('扣减数量必须大于0');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .update(Inventory)
      .set({
        quantity: () => `quantity - ${quantity}`,
      })
      .where('product_no = :productNo', { productNo })
      .andWhere('quantity >= :quantity', { quantity })
      .execute();

    const success = (result.affected ?? 0) > 0;

    if (success) {
      this.logger.log(
        `库存扣减成功: 商品 ${productNo}, 数量 ${quantity}`,
      );
    } else {
      this.logger.warn(
        `库存扣减失败: 商品 ${productNo}, 数量 ${quantity}, 可能库存不足`,
      );
    }

    return success;
  }

  /**
   * 原子库存增加
   * @param productNo 商品编号
   * @param quantity 增加数量
   * @returns 是否成功
   */
  async increaseStock(productNo: string, quantity: number): Promise<boolean> {
    if (quantity <= 0) {
      throw new BadRequestException('增加数量必须大于0');
    }

    const result = await this.dataSource
      .createQueryBuilder()
      .update(Inventory)
      .set({
        quantity: () => `quantity + ${quantity}`,
        lastRestockDate: new Date(),
      })
      .where('product_no = :productNo', { productNo })
      .execute();

    const success = (result.affected ?? 0) > 0;

    if (success) {
      this.logger.log(
        `库存增加成功: 商品 ${productNo}, 数量 ${quantity}`,
      );
    } else {
      this.logger.warn(
        `库存增加失败: 商品 ${productNo}, 数量 ${quantity}, 可能商品不存在`,
      );
    }

    return success;
  }

  /**
   * 检查库存是否充足
   * @param productNo 商品编号
   * @param quantity 需要数量
   * @returns 是否充足
   */
  async checkStock(productNo: string, quantity: number): Promise<boolean> {
    const inventory = await this.inventoryRepository.findOne({
      where: { productNo },
    });

    if (!inventory) {
      return false;
    }

    const availableQuantity =
      inventory.quantity - (inventory.reservedQuantity || 0);
    return availableQuantity >= quantity;
  }
}
