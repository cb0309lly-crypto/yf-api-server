import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order, OrderStatus } from '../entity/order';
import { PaginationResult, paginate } from '../common/utils/pagination.util';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  addOrder(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create({ ...data, name: `${data.userNo}-order-${Date.now()}` });
    return this.orderRepository.save(order);
  }

  async updateOrder(data: Partial<Order>): Promise<Order> {
    this.orderRepository.update({ no: data.no }, { ...data });
    return this.orderRepository.save(data);
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(no: string): Promise<Order | null> {
    return this.orderRepository.findOne({ where: { no } });
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    keyword?: string,
    userNo?: string,
    orderStatus?: OrderStatus,
    operatorNo?: string,
    customerNo?: string,
    productNo?: string,
    materialNo?: string,
    logisticsNo?: string
  ): Promise<PaginationResult<Order>> {
    const qb = this.orderRepository.createQueryBuilder('order');
    
    // 关键词搜索
    if (keyword) {
      qb.andWhere(
        '(order.no LIKE :keyword OR order.shipAddress LIKE :keyword OR order.description LIKE :keyword OR order.remark LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    
    // 具体字段过滤
    if (userNo) {
      qb.andWhere('order.userNo = :userNo', { userNo });
    }
    if (orderStatus) {
      qb.andWhere('order.orderStatus = :orderStatus', { orderStatus });
    }
    if (operatorNo) {
      qb.andWhere('order.operatorNo = :operatorNo', { operatorNo });
    }
    if (customerNo) {
      qb.andWhere('order.customerNo = :customerNo', { customerNo });
    }
    if (productNo) {
      qb.andWhere('order.productNo = :productNo', { productNo });
    }
    if (materialNo) {
      qb.andWhere('order.materialNo = :materialNo', { materialNo });
    }
    if (logisticsNo) {
      qb.andWhere('order.logisticsNo = :logisticsNo', { logisticsNo });
    }
    
    // 按创建时间倒序排列
    qb.orderBy('order.createdAt', 'DESC');
    
    return paginate(qb, page, pageSize);
  }
}
