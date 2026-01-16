import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inventory, InventoryStatus } from '../entity/inventory';
import { PaginationResult, paginate } from '../common/utils/pagination.util';

@Injectable()
export class InventoryService {
  constructor(
    @InjectRepository(Inventory)
    private inventoryRepository: Repository<Inventory>,
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
}
