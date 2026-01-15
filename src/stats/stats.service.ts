import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { Order } from '../entity/order';
import { Product } from '../entity/product';
import { Payment } from '../entity/payment';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
  ) {}

  async getCardData() {
    const userCount = await this.userRepository.count();
    const orderCount = await this.orderRepository.count();
    const productCount = await this.productRepository.count();
    
    // 计算总交易额
    const payments = await this.paymentRepository.find({
      where: { status: 'success' as any },
    });
    const totalTurnover = payments.reduce((sum, p) => sum + Number(p.amount), 0);

    return {
      visitCount: userCount * 12, // 模拟访问量
      turnover: totalTurnover,
      downloadCount: productCount * 5, // 模拟下载量
      dealCount: orderCount,
    };
  }
}

