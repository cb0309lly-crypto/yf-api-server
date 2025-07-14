import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entity/order';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
  ) {}

  addOrder(data: Partial<Order>): Promise<Order> {
    const order = this.orderRepository.create(data);
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
}
