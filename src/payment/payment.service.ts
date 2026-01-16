import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentStatus } from '../entity/payment';
import { Order, OrderStatus } from '../entity/order';

@Injectable()
export class PaymentService {
  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  create(body) {
    const payment = this.paymentRepository.create(body);
    return this.paymentRepository.save(payment);
  }

  findAll(query) {
    const { page = 1, limit = 10, status, method, orderNo } = query;
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    if (method) {
      queryBuilder.andWhere('payment.method = :method', { method });
    }

    if (orderNo) {
      queryBuilder.andWhere('payment.orderNo = :orderNo', { orderNo });
    }

    queryBuilder
      .leftJoinAndSelect('payment.order', 'order')
      .leftJoinAndSelect('payment.user', 'user')
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.paymentRepository.findOne({
      where: { no: id },
      relations: ['order', 'user'],
    });
  }

  update(id: string, body) {
    return this.paymentRepository.update(id, body);
  }

  remove(id: string) {
    return this.paymentRepository.delete(id);
  }

  getOrderPayments(orderId: string) {
    return this.paymentRepository.find({
      where: { orderNo: orderId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  processPayment(body) {
    const { orderNo, userNo, amount, method } = body;

    const payment = this.paymentRepository.create({
      orderNo,
      userNo,
      amount,
      method,
      status: PaymentStatus.PROCESSING,
    });

    return this.paymentRepository.save(payment).then((savedPayment) => {
      // 模拟支付处理
      setTimeout(async () => {
        await this.paymentRepository.update(savedPayment.no, {
          status: PaymentStatus.SUCCESS,
          paymentTime: new Date(),
          transactionId: `TXN_${Date.now()}`,
        });

        // 支付成功后更新订单状态为"待发货"
        await this.orderRepository.update(
          { no: orderNo },
          { orderStatus: OrderStatus.PAIED },
        );
      }, 1000);

      return savedPayment;
    });
  }

  refundPayment(body) {
    const { paymentId, refundAmount, reason } = body;

    return this.paymentRepository
      .findOne({ where: { no: paymentId } })
      .then((payment) => {
        if (payment && payment.status === PaymentStatus.SUCCESS) {
          return this.paymentRepository.update(paymentId, {
            status: PaymentStatus.REFUNDED,
            refundAmount,
            refundTime: new Date(),
            description: reason,
          });
        }
      });
  }

  getUserPayments(userId: string, query) {
    const { page = 1, limit = 10, status } = query;
    const queryBuilder = this.paymentRepository.createQueryBuilder('payment');

    queryBuilder.andWhere('payment.userNo = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('payment.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('payment.order', 'order')
      .orderBy('payment.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }
}
