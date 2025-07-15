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

  createBatch(body) {
    const { orderItems } = body;
    return this.orderItemRepository.save(orderItems);
  }
} 