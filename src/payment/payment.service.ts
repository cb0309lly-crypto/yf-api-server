import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Payment, PaymentStatus } from '../entity/payment';
import { Order, OrderStatus } from '../entity/order';
import {
  PaymentFailedException,
  PaymentAmountMismatchException,
  DuplicatePaymentException,
  OrderStatusException,
} from '../common/exceptions';

@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private readonly dataSource: DataSource,
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

  /**
   * 处理支付（带事务）
   */
  async processPayment(body) {
    const { orderNo, userNo, amount, method } = body;

    return this.dataSource.transaction(async (manager) => {
      // 1. 查询订单并验证状态
      const order = await manager.findOne(Order, {
        where: { no: orderNo },
      });

      if (!order) {
        throw new BadRequestException('订单不存在');
      }

      if (order.orderStatus !== OrderStatus.UNPAY) {
        throw new OrderStatusException(
          orderNo,
          order.orderStatus,
          OrderStatus.UNPAY,
          '支付',
        );
      }

      // 2. 验证金额
      if (Math.abs(order.orderTotal - amount) > 0.01) {
        throw new PaymentAmountMismatchException(
          orderNo,
          order.orderTotal,
          amount,
        );
      }

      // 3. 检查是否已有成功的支付记录（幂等性）
      const existingPayment = await manager.findOne(Payment, {
        where: {
          orderNo,
          status: PaymentStatus.SUCCESS,
        },
      });

      if (existingPayment) {
        this.logger.warn(`订单 ${orderNo} 已支付，返回已有支付记录`);
        throw new DuplicatePaymentException(
          orderNo,
          existingPayment.transactionId,
        );
      }

      // 4. 创建支付记录
      const payment = manager.create(Payment, {
        orderNo,
        userNo,
        amount,
        method,
        status: PaymentStatus.PROCESSING,
        transactionId: `TXN_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
      });

      const savedPayment = await manager.save(Payment, payment);
      this.logger.log(`支付记录创建成功: ${savedPayment.no}`);

      // 5. 模拟支付处理（实际应调用第三方支付接口）
      // 这里直接标记为成功
      savedPayment.status = PaymentStatus.SUCCESS;
      savedPayment.paymentTime = new Date();
      await manager.save(Payment, savedPayment);

      // 6. 更新订单状态为"已支付"
      order.orderStatus = OrderStatus.PAIED;
      await manager.save(Order, order);

      this.logger.log(
        `支付处理成功: 订单 ${orderNo}, 金额 ${amount}, 交易号 ${savedPayment.transactionId}`,
      );

      return savedPayment;
    });
  }

  /**
   * 处理退款（带事务）
   */
  async processRefund(body) {
    const { paymentId, refundAmount, reason } = body;

    return this.dataSource.transaction(async (manager) => {
      // 1. 查询支付记录
      const payment = await manager.findOne(Payment, {
        where: { no: paymentId },
        relations: ['order'],
      });

      if (!payment) {
        throw new BadRequestException('支付记录不存在');
      }

      // 2. 验证支付状态
      if (payment.status !== PaymentStatus.SUCCESS) {
        throw new PaymentFailedException(
          payment.orderNo,
          `支付状态为 ${payment.status}，无法退款`,
        );
      }

      // 3. 验证退款金额
      if (refundAmount > payment.amount) {
        throw new BadRequestException(
          `退款金额 ${refundAmount} 超过支付金额 ${payment.amount}`,
        );
      }

      // 4. 检查是否已退款（通过refundAmount判断）
      if (payment.refundAmount && payment.refundAmount > 0) {
        this.logger.warn(`支付记录 ${paymentId} 已退款`);
        return payment;
      }

      // 5. 更新支付记录
      payment.status = PaymentStatus.REFUNDED;
      payment.refundAmount = refundAmount;
      payment.refundTime = new Date();
      payment.description = reason;
      await manager.save(Payment, payment);

      this.logger.log(
        `退款处理成功: 支付记录 ${paymentId}, 退款金额 ${refundAmount}`,
      );

      // 6. 更新订单状态（如果需要）
      if (payment.order) {
        const order = await manager.findOne(Order, {
          where: { no: payment.orderNo },
          relations: ['orderItems'],
        });

        if (order) {
          // 恢复库存
          for (const item of order.orderItems) {
            await manager
              .createQueryBuilder()
              .update('yf_db_inventory')
              .set({
                quantity: () => `quantity + ${item.quantity}`,
              })
              .where('product_no = :productNo', { productNo: item.productNo })
              .execute();

            this.logger.log(
              `库存恢复成功: 商品 ${item.productNo}, 数量 ${item.quantity}`,
            );
          }

          // 更新订单状态
          order.orderStatus = OrderStatus.CANCELED;
          order.remark = `退款: ${reason}`;
          await manager.save(Order, order);
        }
      }

      return payment;
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
