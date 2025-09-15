import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem, OrderItemStatus } from '../entity/order-item';

@Injectable()
export class OrderItemService {
  constructor(
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  create(body) {
    const orderItem = this.orderItemRepository.create(body);
    return this.orderItemRepository.save(orderItem);
  }

  findAll(query) {
    const { page = 1, limit = 10, orderNo, status } = query;
    const queryBuilder = this.orderItemRepository.createQueryBuilder('orderItem');

    if (orderNo) {
      queryBuilder.andWhere('orderItem.orderNo = :orderNo', { orderNo });
    }

    if (status) {
      queryBuilder.andWhere('orderItem.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('orderItem.product', 'product')
      .orderBy('orderItem.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.orderItemRepository.findOne({
      where: { no: id },
      relations: ['order', 'product'],
    });
  }

  update(id: string, body) {
    return this.orderItemRepository.update(id, body);
  }

  remove(id: string) {
    return this.orderItemRepository.delete(id);
  }

  getOrderItems(orderId: string) {
    return this.orderItemRepository.find({
      where: { orderNo: orderId },
      relations: ['product'],
      order: { createdAt: 'ASC' },
    });
  }

  async createBatch(body, userNo: string) {
    const { orderItems } = body;
    
    if (!Array.isArray(orderItems) || orderItems.length === 0) {
      throw new Error('订单项列表不能为空');
    }

    // 准备批量插入的数据
    const insertData = orderItems.map((item, index) => ({
      ...item,
      name: `${userNo}-order-item-${Date.now()}-${index}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    // 使用 QueryBuilder 进行批量插入 - 最高效的方式
    const result = await this.orderItemRepository
      .createQueryBuilder()
      .insert()
      .into(OrderItem)
      .values(insertData)
      .execute();

    // 检查插入结果
    if (result.identifiers.length === 0) {
      throw new Error('批量插入失败');
    }

    // 如果不需要返回完整数据，直接返回插入结果
    return {
      success: true,
      count: result.identifiers.length,
      message: `成功插入 ${result.identifiers.length} 条订单项`
    };
  }
} 