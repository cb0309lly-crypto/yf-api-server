import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Order, OrderStatus } from '../entity/order';
import { OrderItem } from '../entity/order-item';
import { PaginationResult, paginate } from '../common/utils/pagination.util';
import { InventoryService } from '../inventory/inventory.service';
import { CouponService } from '../coupon/coupon.service';
import { CouponType } from '../entity/coupon';
import { CreateOrderDto } from './dto/create-order.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    private readonly inventoryService: InventoryService,
    private readonly couponService: CouponService,
    private readonly dataSource: DataSource,
  ) {}

  // 每一分钟检查一次超时未支付订单 (例如 30分钟超时)
  @Cron(CronExpression.EVERY_MINUTE)
  async handleTimeoutOrders() {
    this.logger.debug('Running timeout order check...');

    const timeoutThreshold = new Date(Date.now() - 30 * 60 * 1000); // 30 mins ago

    const timeoutOrders = await this.orderRepository.find({
      where: {
        orderStatus: OrderStatus.UNPAY,
        createdAt: LessThan(timeoutThreshold),
      },
      relations: ['orderItems'],
    });

    if (timeoutOrders.length > 0) {
      this.logger.log(
        `Found ${timeoutOrders.length} timeout orders. Closing...`,
      );

      for (const order of timeoutOrders) {
        // 在实际业务中，可能需要归还库存
        // 这里简单实现：更新状态为已取消
        await this.orderRepository.update(order.no, {
          orderStatus: OrderStatus.CANCELED,
          remark: 'Order timeout auto-cancelled',
        });

        // 归还库存逻辑 (可选)
        // for (const item of order.orderItems) {
        //   await this.inventoryService.restock(item.productNo, item.quantity);
        // }
      }
    }
  }

  async addOrder(data: CreateOrderDto & { userNo: string }): Promise<Order> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 验证优惠券
      let discountAmount = 0;
      const orderTotal = data.orderTotal ?? 0;
      if (data.couponId) {
        // Try finding by ID if code lookup fails or implement dedicated ID check
        // For now assuming couponService.validateCoupon handles logic or we extend it
        // Let's rely on a direct check for better safety in transaction
        const coupon = await this.couponService.findOne(data.couponId);
        if (!coupon || coupon.status !== 'active') {
          // Assuming 'active' is the status string value
          // If strict check needed: throw new BadRequestException('优惠券不可用');
        } else {
          // Simple discount calculation
          if (coupon.type === CouponType.FIXED_AMOUNT) {
            discountAmount = coupon.value ?? 0;
          } else if (coupon.type === CouponType.PERCENTAGE) {
            discountAmount = orderTotal * ((coupon.value ?? 0) / 100);
          }
        }
      }

      // 2. 创建订单对象
      const order = this.orderRepository.create({
        ...data,
        orderTotal,
        name: `${data.userNo}-order-${Date.now()}`,
        orderStatus: OrderStatus.UNPAY,
      });
      const savedOrder = await queryRunner.manager.save(order);

      // 3. 处理订单项与扣减库存
      if (data.items && data.items.length > 0) {
        for (const item of data.items) {
          // 扣减库存 (Using InventoryService logic but within transaction if possible,
          // or ensuring InventoryService operations are atomic)
          // Since InventoryService.reserve uses specific UPDATE query, it's safer.
          // However, for strict transaction consistency, better to use queryRunner.
          // For now, calling service.reserve (optimistic locking pattern or atomic update)

          // Get inventory ID by productNo (assuming 1:1 for simplicity or pick first)
          const inventory = await this.inventoryService.getProductInventory(
            item.productNo,
          );
          if (!inventory) {
            throw new BadRequestException(`商品 ${item.productNo} 库存不存在`);
          }

          const result = await this.inventoryService.reserve(
            inventory.no,
            item.quantity,
          );
          if (result.affected === 0) {
            throw new BadRequestException(`商品 ${item.productNo} 库存不足`);
          }

          // Create OrderItem
          const unitPrice = item.price;
          const totalPrice = unitPrice * item.quantity;
          const orderItem = this.orderItemRepository.create({
            name: `${savedOrder.no}-item-${item.productNo}`,
            orderNo: savedOrder.no,
            productNo: item.productNo,
            quantity: item.quantity,
            unitPrice,
            totalPrice,
            discountAmount: 0,
            finalPrice: totalPrice,
          });
          await queryRunner.manager.save(orderItem);
        }
      }

      // 4. 核销优惠券
      if (data.couponId) {
        await this.couponService.useCoupon({
          couponId: data.couponId,
          orderNo: savedOrder.no,
        });
      }

      await queryRunner.commitTransaction();
      return savedOrder;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
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
    logisticsNo?: string,
  ): Promise<PaginationResult<Order>> {
    const qb = this.orderRepository.createQueryBuilder('order');

    // 关键词搜索
    if (keyword) {
      qb.andWhere(
        '(order.no LIKE :keyword OR order.shipAddress LIKE :keyword OR order.description LIKE :keyword OR order.remark LIKE :keyword)',
        { keyword: `%${keyword}%` },
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
