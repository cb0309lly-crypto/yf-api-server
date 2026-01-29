import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Order, OrderStatus } from '../entity/order';
import { OrderItem } from '../entity/order-item';
import { Product } from '../entity/product';
import { Payment, PaymentStatus, PaymentMethod } from '../entity/payment';
import { Logistics } from '../entity/logistics';
import { Receiver } from '../entity/receiver';
import { PaginationResult, paginate } from '../common/utils/pagination.util';
import { InventoryService } from '../inventory/inventory.service';
import { CouponService } from '../coupon/coupon.service';
import { CartService } from '../cart/cart.service';
import { CouponType } from '../entity/coupon';
import { CreateOrderDto } from './dto/create-order.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import {
  InsufficientStockException,
  CouponInvalidException,
  CouponConditionNotMetException,
} from '../common/exceptions';

@Injectable()
export class OrderService {
  private readonly logger = new Logger(OrderService.name);

  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private readonly paymentRepository: Repository<Payment>,
    @InjectRepository(Logistics)
    private readonly logisticsRepository: Repository<Logistics>,
    @InjectRepository(Receiver)
    private readonly receiverRepository: Repository<Receiver>,
    private readonly inventoryService: InventoryService,
    private readonly couponService: CouponService,
    private readonly cartService: CartService,
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
        try {
          await this.cancelOrder(order.no, '订单超时自动取消');
        } catch (error) {
          this.logger.error(
            `Failed to cancel timeout order ${order.no}:`,
            error,
          );
        }
      }
    }
  }

  /**
   * 取消订单（带事务和库存恢复）
   */
  async cancelOrder(orderNo: string, reason: string): Promise<Order> {
    return this.dataSource.transaction(async (manager) => {
      // 1. 查询订单
      const order = await manager.findOne(Order, {
        where: { no: orderNo },
        relations: ['orderItems'],
      });

      if (!order) {
        throw new BadRequestException('订单不存在');
      }

      // 2. 检查订单状态
      if (
        order.orderStatus !== OrderStatus.UNPAY &&
        order.orderStatus !== OrderStatus.ORDERED
      ) {
        throw new BadRequestException(
          `订单状态为 ${order.orderStatus}，无法取消`,
        );
      }

      // 3. 恢复库存
      for (const item of order.orderItems) {
        const result = await manager
          .createQueryBuilder()
          .update('yf_db_inventory')
          .set({
            quantity: () => `quantity + ${item.quantity}`,
          })
          .where('product_no = :productNo', { productNo: item.productNo })
          .execute();

        if (result.affected === 0) {
          this.logger.warn(
            `库存恢复失败: 商品 ${item.productNo} 可能不存在库存记录`,
          );
        } else {
          this.logger.log(
            `库存恢复成功: 商品 ${item.productNo}, 数量 ${item.quantity}`,
          );
        }
      }

      // 4. 更新订单状态
      order.orderStatus = OrderStatus.CANCELED;
      order.remark = reason;
      const updatedOrder = await manager.save(Order, order);

      this.logger.log(`订单取消成功: ${orderNo}, 原因: ${reason}`);

      return updatedOrder;
    });
  }

  async addOrder(data: CreateOrderDto & { userNo: string }): Promise<Order> {
    // 使用事务确保数据一致性
    return this.dataSource.transaction(async (manager) => {
      // 1. 验证并计算订单金额
      let discountAmount = 0;
      const orderTotal = this.roundToTwoDecimals(data.orderTotal ?? 0);

      // 2. 验证优惠券（如果有）
      if (data.couponId) {
        const coupon = await this.couponService.findOne(data.couponId);
        if (!coupon || coupon.status !== 'active') {
          throw new CouponInvalidException(
            data.couponId,
            '优惠券不可用或已失效',
          );
        }

        // 计算折扣金额
        if (coupon.type === CouponType.FIXED_AMOUNT) {
          discountAmount = this.roundToTwoDecimals(coupon.value ?? 0);
        } else if (coupon.type === CouponType.PERCENTAGE) {
          discountAmount = this.roundToTwoDecimals(orderTotal * ((coupon.value ?? 0) / 100));
        }

        // 验证优惠券使用条件
        if (coupon.minimumAmount && orderTotal < coupon.minimumAmount) {
          throw new CouponConditionNotMetException(
            data.couponId,
            coupon.minimumAmount,
            orderTotal,
          );
        }
      }

      // 3. 验证商品和库存
      if (!data.items || data.items.length === 0) {
        throw new BadRequestException('订单项不能为空');
      }

      for (const item of data.items) {
        // 验证商品存在
        const product = await manager.findOne(Product, {
          where: { no: item.productNo },
        });
        if (!product) {
          throw new BadRequestException(`商品 ${item.productNo} 不存在`);
        }

        // 验证库存
        const inventory = await this.inventoryService.getProductInventory(
          item.productNo,
        );
        if (!inventory) {
          throw new BadRequestException(`商品 ${item.productNo} 库存不存在`);
        }

        // 检查可用库存
        const availableQuantity =
          inventory.quantity - (inventory.reservedQuantity || 0);
        if (availableQuantity < item.quantity) {
          throw new InsufficientStockException(
            item.productNo,
            item.quantity,
            availableQuantity,
          );
        }
      }

      // 4. 扣减库存（原子操作）
      for (const item of data.items) {
        const result = await manager
          .createQueryBuilder()
          .update('yf_db_inventory')
          .set({
            quantity: () => `quantity - ${item.quantity}`,
          })
          .where('product_no = :productNo', { productNo: item.productNo })
          .andWhere('quantity >= :quantity', { quantity: item.quantity })
          .execute();

        if (result.affected === 0) {
          // 获取当前库存信息用于错误提示
          const currentInventory =
            await this.inventoryService.getProductInventory(item.productNo);
          const available = currentInventory
            ? currentInventory.quantity -
              (currentInventory.reservedQuantity || 0)
            : 0;

          throw new InsufficientStockException(
            item.productNo,
            item.quantity,
            available,
          );
        }

        this.logger.log(
          `库存扣减成功: 商品 ${item.productNo}, 数量 ${item.quantity}`,
        );
      }

      // 5. 创建订单
      const readableOrderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      const finalTotal = this.roundToTwoDecimals(Math.max(0, orderTotal - discountAmount));

      const order = manager.create(Order, {
        name: readableOrderNo,
        userNo: data.userNo,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
        shipAddress: data.shipAddress,
        orderTotal: finalTotal,
        orderStatus: OrderStatus.UNPAY,
        remark: data.remark,
        description: data.couponId
          ? `使用优惠券，优惠 ${discountAmount.toFixed(2)} 元`
          : undefined,
      });

      const savedOrder = await manager.save(Order, order);
      this.logger.log(`订单创建成功: ${savedOrder.no}`);

      // 6. 创建订单项
      for (const item of data.items) {
        const product = await manager.findOne(Product, {
          where: { no: item.productNo },
        });

        const unitPrice = this.roundToTwoDecimals(item.price || product?.price || 0);
        const totalPrice = this.roundToTwoDecimals(unitPrice * item.quantity);

        const orderItem = manager.create(OrderItem, {
          name: `${savedOrder.no}-item-${item.productNo}`,
          orderNo: savedOrder.no,
          productNo: item.productNo,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
          discountAmount: 0,
          finalPrice: totalPrice,
        });

        await manager.save(OrderItem, orderItem);
      }

      this.logger.log(`订单项创建成功，共 ${data.items.length} 项`);

      // 7. 核销优惠券（如果有）
      if (data.couponId) {
        await this.couponService.useCoupon({
          couponId: data.couponId,
          orderNo: savedOrder.no,
        });
        this.logger.log(`优惠券核销成功: ${data.couponId}`);
      }

      // 8. 创建初始支付记录
      const payment = manager.create(Payment, {
        orderNo: savedOrder.no,
        userNo: data.userNo,
        amount: finalTotal,
        status: PaymentStatus.PENDING,
        method: PaymentMethod.WECHAT,
      });
      await manager.save(Payment, payment);

      this.logger.log(`订单创建完成: ${savedOrder.no}, 总金额: ${finalTotal.toFixed(2)}`);

      // 9. 订单创建成功后，清空购物车中对应的商品
      // 注意：这里在事务外执行，即使失败也不影响订单创建
      try {
        for (const item of data.items) {
          if (item.productNo) {
            await this.cartService.markAsPurchased(data.userNo, item.productNo);
          }
        }
        this.logger.log(`购物车清理成功: 用户 ${data.userNo}, 商品数量 ${data.items.length}`);
      } catch (error) {
        // 购物车清理失败不影响订单创建，只记录日志
        this.logger.warn(`购物车清理失败: ${error.message}`);
      }

      return savedOrder;
    });
  }

  async updateOrder(data: Partial<Order>): Promise<Order> {
    this.orderRepository.update({ no: data.no }, { ...data });
    return this.orderRepository.save(data);
  }

  /**
   * 删除订单
   * 注意：这是物理删除，会同时删除关联的订单项、支付记录等
   * 建议：生产环境应该使用软删除（添加 deletedAt 字段）
   */
  async deleteOrder(orderNo: string): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      // 1. 查询订单
      const order = await manager.findOne(Order, {
        where: { no: orderNo },
        relations: ['orderItems'],
      });

      if (!order) {
        throw new BadRequestException('订单不存在');
      }

      // 2. 如果订单未取消且有商品，恢复库存
      if (
        order.orderStatus !== OrderStatus.CANCELED &&
        order.orderItems &&
        order.orderItems.length > 0
      ) {
        for (const item of order.orderItems) {
          const result = await manager
            .createQueryBuilder()
            .update('yf_db_inventory')
            .set({
              quantity: () => `quantity + ${item.quantity}`,
            })
            .where('product_no = :productNo', { productNo: item.productNo })
            .execute();

          if (result.affected === 0) {
            this.logger.warn(
              `删除订单时库存恢复失败: 商品 ${item.productNo} 可能不存在库存记录`,
            );
          } else {
            this.logger.log(
              `删除订单时库存恢复成功: 商品 ${item.productNo}, 数量 ${item.quantity}`,
            );
          }
        }
      }

      // 3. 删除关联的订单项
      if (order.orderItems && order.orderItems.length > 0) {
        await manager.delete(OrderItem, {
          orderNo: orderNo,
        });
        this.logger.log(`删除订单项成功: 订单 ${orderNo}`);
      }

      // 4. 删除关联的支付记录
      await manager.delete(Payment, {
        orderNo: orderNo,
      });
      this.logger.log(`删除支付记录成功: 订单 ${orderNo}`);

      // 5. 删除关联的物流记录
      await manager.delete(Logistics, {
        orderNo: orderNo,
      });
      this.logger.log(`删除物流记录成功: 订单 ${orderNo}`);

      // 6. 最后删除订单
      await manager.delete(Order, {
        no: orderNo,
      });

      this.logger.log(`订单删除成功: ${orderNo}`);
    });
  }

  async findAll(): Promise<Order[]> {
    return this.orderRepository.find();
  }

  async findOne(no: string): Promise<(Order & { userName?: string; operatorName?: string }) | null> {
    const order = await this.orderRepository.findOne({
      where: { no },
      relations: ['user', 'orderItems', 'orderItems.product'],
    });

    if (!order) {
      return null;
    }

    // 获取操作员名称
    let operatorName: string | undefined;
    if (order.operatorNo) {
      const operator = await this.dataSource
        .getRepository('User')
        .createQueryBuilder('user')
        .where('user.no = :operatorNo', { operatorNo: order.operatorNo })
        .select(['user.no', 'user.nickname', 'user.authLogin'])
        .getOne();
      operatorName = (operator as any)?.nickname || (operator as any)?.authLogin || order.operatorNo;
    }

    // 使用 Object.assign 保留实体方法
    return Object.assign(order, {
      userName: order.user?.nickname || order.user?.authLogin || order.userNo,
      operatorName,
    });
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
  ): Promise<PaginationResult<Order & { userName?: string; operatorName?: string }>> {
    const qb = this.orderRepository.createQueryBuilder('order');

    // 关联用户表获取用户名称
    qb.leftJoinAndSelect('order.user', 'user');

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

    // 按更新时间降序排序
    qb.orderBy('order.updatedAt', 'DESC');

    const result = await paginate(qb, page, pageSize);

    // 获取所有操作员编号并查询操作员名称
    const operatorNos = [...new Set(result.list.map((o) => o.operatorNo).filter(Boolean))];
    const operatorMap = new Map<string, string>();

    if (operatorNos.length > 0) {
      const operators = await this.dataSource
        .getRepository('User')
        .createQueryBuilder('user')
        .where('user.no IN (:...operatorNos)', { operatorNos })
        .select(['user.no', 'user.nickname', 'user.authLogin'])
        .getMany();

      operators.forEach((op: any) => {
        operatorMap.set(op.no, op.nickname || op.authLogin || op.no);
      });
    }

    // 添加用户名称和操作员名称到返回结果
    const listWithNames = result.list.map((order) =>
      Object.assign(order, {
        userName: order.user?.nickname || order.user?.authLogin || order.userNo,
        operatorName: order.operatorNo ? operatorMap.get(order.operatorNo) || order.operatorNo : undefined,
      }),
    );

    return {
      ...result,
      list: listWithNames,
    };
  }

  async getMpOrderList(params: {
    pageNum?: number;
    pageSize?: number;
    orderStatus?: number;
    userNo?: string;
  }) {
    const { pageNum = 1, pageSize = 10, orderStatus, userNo } = params;
    const orderStatusValue = this.mapMpStatusToOrderStatus(orderStatus);

    const [orders, totalCount] = await this.orderRepository.findAndCount({
      where: {
        ...(userNo ? { userNo } : {}),
        ...(orderStatusValue ? { orderStatus: orderStatusValue } : {}),
      },
      relations: ['orderItems', 'orderItems.product', 'payments'],
      order: { createdAt: 'DESC' },
      skip: (pageNum - 1) * pageSize,
      take: pageSize,
    });

    const orderList = (orders || []).map((order) =>
      this.toMpOrderSummary(order),
    );

    return {
      pageNum,
      pageSize,
      totalCount,
      orders: orderList,
    };
  }

  async getMpOrderCount(userNo?: string) {
    const orders = await this.orderRepository.find({
      where: { ...(userNo ? { userNo } : {}) },
      select: ['orderStatus'],
    });
    const countMap = new Map<number, number>();
    orders.forEach((order) => {
      const status = this.mapOrderStatusToMp(order.orderStatus);
      if (!countMap.has(status)) {
        countMap.set(status, 0);
      }
      countMap.set(status, (countMap.get(status) || 0) + 1);
    });
    return Array.from(countMap.entries()).map(([tabType, orderNum]) => ({
      tabType,
      orderNum,
    }));
  }

  async getMpOrderDetail(orderNo: string) {
    const order = await this.orderRepository.findOne({
      where: { no: orderNo },
      relations: ['orderItems', 'orderItems.product', 'payments'],
    });
    if (!order) {
      throw new BadRequestException('订单不存在');
    }

    const logistics = await this.logisticsRepository.findOne({
      where: { orderNo },
    });

    return this.toMpOrderDetail(order, logistics);
  }

  async getSettleDetail(payload: any) {
    const { goodsRequestList = [], userAddressReq = null } = payload || {};

    const storeMap = new Map();
    const storeGoodsList: any[] = [];
    let totalAmount = 0;
    let totalGoodsCount = 0;

    for (const goods of goodsRequestList) {
      const storeId = goods.storeId || '1000';
      const storeName = goods.storeName || '默认门店';
      if (!storeMap.has(storeId)) {
        storeMap.set(storeId, {
          storeId,
          storeName,
          storeTotalPayAmount: '0',
          skuDetailVos: [],
          couponList: [],
        });
      }
      const product = goods.spuId
        ? await this.productRepository.findOne({ where: { no: goods.spuId } })
        : null;
      const unitPrice = this.roundToTwoDecimals(this.parseNumber(product?.price ?? goods.price ?? 0));
      const quantity = Number(goods.quantity || 1);
      const totalPrice = this.roundToTwoDecimals(unitPrice * quantity);
      
      totalAmount = this.roundToTwoDecimals(totalAmount + totalPrice);
      totalGoodsCount += quantity;

      const skuDetail = {
        skuId: goods.skuId || `${goods.spuId || 'sku'}-default`,
        spuId: goods.spuId || product?.no,
        goodsName: goods.goodsName || product?.name || '商品',
        image: goods.primaryImage || product?.imgUrl || '',
        quantity,
        price: this.toCentString(unitPrice),
        settlePrice: this.toCentString(unitPrice),
        tagPrice: goods.tagPrice ? String(goods.tagPrice) : null,
        skuSpecLst: Array.isArray(goods.specInfo) ? goods.specInfo : [],
        storeId,
        storeName,
      };
      storeMap.get(storeId).skuDetailVos.push(skuDetail);
      const currentTotal = this.parseNumber(
        storeMap.get(storeId).storeTotalPayAmount,
      );
      const nextTotal = currentTotal + Math.round(totalPrice * 100);
      storeMap.get(storeId).storeTotalPayAmount = `${nextTotal}`;
    }

    storeMap.forEach((value) => storeGoodsList.push(value));

    const totalAmountStr = this.toCentString(totalAmount);

    return {
      storeGoodsList,
      outOfStockGoodsList: [],
      abnormalDeliveryGoodsList: [],
      inValidGoodsList: [],
      limitGoodsList: [],
      couponList: [],
      userAddress: userAddressReq,
      settleType: storeGoodsList.length > 0 ? 1 : 0,
      totalAmount: totalAmountStr,
      totalPayAmount: totalAmountStr,
      totalSalePrice: totalAmountStr,
      totalGoodsCount,
      totalPromotionAmount: '0',
      totalDeliveryFee: '0',
      totalCouponAmount: '0',
      invoiceSupport: 0,
    };
  }

  async commitPay(payload: any, userNo?: string) {
    const { goodsRequestList, userAddressReq } = payload;
    
    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate Readable Order No for display/reference
      const readableOrderNo = `ORD${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      let calculatedTotal = 0;
      const orderItems: OrderItem[] = [];
      
      // We need to save the order first to get the generated UUID
      // But we need calculatedTotal for the order.
      // So first calculate total.

      // Process items calculation first
      const pendingItems: any[] = [];
      for (const goods of goodsRequestList) {
        // Ideally fetch product from DB to verify price
        const product = goods.spuId 
          ? await this.productRepository.findOne({ where: { no: goods.spuId } }) 
          : null;
        
        // Use price from DB if available, otherwise from request (fallback)
        const unitPrice = this.roundToTwoDecimals(this.parseNumber(product?.price ?? goods.price ?? 0));
        const quantity = Number(goods.quantity || 1);
        const itemTotal = this.roundToTwoDecimals(unitPrice * quantity);
        calculatedTotal = this.roundToTwoDecimals(calculatedTotal + itemTotal);

        pendingItems.push({
          productNo: goods.spuId,
          quantity,
          unitPrice,
          itemTotal,
          name: goods.goodsName || product?.name,
          image: goods.primaryImage || product?.imgUrl,
          spec: goods.specInfo
        });
      }

      // Format address
      const shipAddress = userAddressReq 
        ? `${userAddressReq.provinceName || ''}${userAddressReq.cityName || ''}${userAddressReq.districtName || ''}${userAddressReq.detailAddress || ''}` 
        : '';

      // Create Order
      const order = this.orderRepository.create({
        // no: Let DB generate UUID
        name: readableOrderNo, // Store readable ID in name
        userNo: userNo || 'anonymous',
        receiverName: userAddressReq?.name,
        receiverPhone: userAddressReq?.phone || userAddressReq?.phoneNumber,
        shipAddress,
        orderTotal: this.roundToTwoDecimals(calculatedTotal),
        orderStatus: OrderStatus.UNPAY, // Default status
        createdAt: new Date(),
      });

      const savedOrder = await queryRunner.manager.save(Order, order);
      const orderNo = savedOrder.no; // This is the UUID

      // Create OrderItems
      for (const item of pendingItems) {
        const orderItem = this.orderItemRepository.create({
          orderNo: orderNo,
          productNo: item.productNo,
          quantity: item.quantity,
          unitPrice: this.roundToTwoDecimals(item.unitPrice),
          totalPrice: this.roundToTwoDecimals(item.itemTotal),
          finalPrice: this.roundToTwoDecimals(item.itemTotal),
          name: item.name,
          productSnapshot: {
            image: item.image,
            spec: item.spec
          }
        });
        orderItems.push(orderItem);
      }
      await queryRunner.manager.save(OrderItem, orderItems);

      // Create initial Payment record
      const payment = this.paymentRepository.create({
        orderNo: orderNo,
        userNo: userNo || 'anonymous',
        amount: this.roundToTwoDecimals(calculatedTotal),
        status: PaymentStatus.PENDING,
        method: PaymentMethod.WECHAT,
        transactionId: `TX-${Date.now()}`,
        createdAt: new Date(),
      });
      await queryRunner.manager.save(Payment, payment);

      await queryRunner.commitTransaction();

      // 订单创建成功后，清空购物车中对应的商品
      if (userNo) {
        try {
          // 标记购物车中已下单的商品为已购买
          for (const item of pendingItems) {
            if (item.productNo) {
              await this.cartService.markAsPurchased(userNo, item.productNo);
            }
          }
          this.logger.log(`购物车清理成功: 用户 ${userNo}, 商品数量 ${pendingItems.length}`);
        } catch (error) {
          // 购物车清理失败不影响订单创建，只记录日志
          this.logger.warn(`购物车清理失败: ${error.message}`);
        }
      }

      const totalAmountStr = this.toCentString(calculatedTotal);

      return {
        isSuccess: true,
        tradeNo: orderNo, // Return UUID
        payInfo: '{}',
        code: 'Success',
        transactionId: payment.transactionId,
        msg: '订单创建成功',
        interactId: `${Date.now()}`,
        channel: 'wechat',
        limitGoodsList: null,
        payAmt: totalAmountStr,
      };

    } catch (err) {
      await queryRunner.rollbackTransaction();
      this.logger.error('Commit Pay Error', err);
      return {
        isSuccess: false,
        code: 'Fail',
        msg: '创建订单失败',
        tradeNo: null,
        payAmt: 0
      };
    } finally {
      await queryRunner.release();
    }
  }

  getBusinessTime() {
    return {
      businessTime: ['周一,周二,周三,周四,周五:00:20:00-08:00:00'],
      telphone: '18565372257',
      saasId: '88888888',
    };
  }

  private mapOrderStatusToMp(status: OrderStatus) {
    switch (status) {
      case OrderStatus.UNPAY:
      case OrderStatus.ORDERED:
        return 5;
      case OrderStatus.PAIED:
        return 10;
      case OrderStatus.DELIVERY:
        return 40;
      case OrderStatus.CANCELED:
        return 80;
      default:
        return 50;
    }
  }

  private mapMpStatusToOrderStatus(status?: number): OrderStatus | null {
    if (status === undefined || status === null) return null;
    switch (status) {
      case 5:
        return OrderStatus.UNPAY;
      case 10:
        return OrderStatus.PAIED;
      case 40:
        return OrderStatus.DELIVERY;
      case 50:
        return OrderStatus.PAIED;
      case 80:
        return OrderStatus.CANCELED;
      default:
        return null;
    }
  }

  private getOrderStatusName(status: number) {
    switch (status) {
      case 5:
        return '待付款';
      case 10:
        return '待发货';
      case 40:
        return '待收货';
      case 50:
        return '交易完成';
      default:
        return '已取消';
    }
  }

  private toMpOrderSummary(order: Order) {
    const mpStatus = this.mapOrderStatusToMp(order.orderStatus);
    const payment = order.payments?.[0];
    const createTime = order.createdAt
      ? `${order.createdAt.getTime()}`
      : `${Date.now()}`;
    const orderItemVOs = (order.orderItems || []).map((item) =>
      this.toMpOrderItem(item),
    );
    return {
      saasId: '88888888',
      storeId: '1000',
      storeName: '默认门店',
      uid: order.userNo,
      parentOrderNo: order.no,
      orderId: order.no,
      orderNo: order.no,
      orderType: 0,
      orderSubType: 0,
      orderStatus: mpStatus,
      orderSubStatus: null,
      totalAmount: this.toCentString(this.parseNumber(order.orderTotal || 0)),
      goodsAmount: this.toCentString(this.parseNumber(order.orderTotal || 0)),
      goodsAmountApp: this.toCentString(
        this.parseNumber(order.orderTotal || 0),
      ),
      paymentAmount: this.toCentString(this.parseNumber(order.orderTotal || 0)),
      freightFee: '0',
      packageFee: '0',
      discountAmount: '0',
      channelType: 0,
      channelSource: '',
      channelIdentity: '',
      remark: order.remark || '',
      cancelType: null,
      cancelReasonType: null,
      cancelReason: null,
      rightsType: null,
      createTime,
      orderItemVOs,
      logisticsVO: {
        logisticsType: 1,
        logisticsNo: '',
        logisticsStatus: null,
        logisticsCompanyCode: '',
        logisticsCompanyName: '',
        receiverAddressId: '',
        receiverProvince: '',
        receiverCity: '',
        receiverCountry: '',
        receiverArea: '',
        receiverAddress: order.shipAddress || '',
        receiverPostCode: '',
        receiverLongitude: '',
        receiverLatitude: '',
        receiverIdentity: order.userNo,
        receiverPhone: order.receiverPhone || '',
        receiverName: order.receiverName || '',
        expectArrivalTime: null,
        senderName: '',
        senderPhone: '',
        senderAddress: '',
        sendTime: null,
        arrivalTime: null,
      },
      paymentVO: {
        payStatus: payment?.status === PaymentStatus.SUCCESS ? 1 : 0,
        amount: this.toCentString(this.parseNumber(order.orderTotal || 0)),
        currency: 'CNY',
        payType: null,
        payWay: null,
        payWayName: null,
        interactId: null,
        traceNo: null,
        channelTrxNo: null,
        period: null,
        payTime: payment?.paymentTime
          ? `${payment.paymentTime.getTime()}`
          : null,
        paySuccessTime:
          payment?.status === PaymentStatus.SUCCESS && payment.paymentTime
            ? `${payment.paymentTime.getTime()}`
            : null,
      },
      buttonVOs: this.getOrderButtons(mpStatus),
      labelVOs: null,
      invoiceVO: null,
      couponAmount: null,
      autoCancelTime: null,
      orderStatusName: this.getOrderStatusName(mpStatus),
      orderStatusRemark: null,
      logisticsLogVO: null,
      invoiceStatus: null,
      invoiceDesc: null,
      invoiceUrl: null,
    };
  }

  private toMpOrderDetail(order: Order, logistics?: Logistics | null) {
    const summary = this.toMpOrderSummary(order);
    const nodes: any[] = [];
    if (summary.orderStatus === 5) {
      nodes.push({
        title: '已下单',
        icon: '',
        code: '200001',
        nodes: [
          { status: '订单已提交', timestamp: summary.createTime, remark: null },
        ],
        isShow: true,
      });
    } else {
      nodes.push({
        title: '已下单',
        icon: '',
        code: '200002',
        nodes: [
          { status: '订单已提交', timestamp: summary.createTime, remark: null },
        ],
        isShow: true,
      });
    }

    return {
      ...summary,
      logisticsVO: {
        ...summary.logisticsVO,
        logisticsNo: logistics?.orderNo || '',
        logisticsStatus: logistics?.currentStatus || null,
      },
      trajectoryVos: nodes,
    };
  }

  private toMpOrderItem(item: OrderItem) {
    const product = item.product;
    const unitPrice = this.parseNumber(item.unitPrice || product?.price || 0);
    return {
      id: item.no,
      orderNo: item.orderNo,
      spuId: item.productNo,
      skuId: item.no,
      roomId: null,
      goodsMainType: 0,
      goodsViceType: 0,
      goodsName: product?.name || '商品',
      specifications: [],
      goodsPictureUrl: product?.imgUrl || '',
      originPrice: this.toCentString(unitPrice),
      actualPrice: this.toCentString(unitPrice),
      buyQuantity: item.quantity,
      itemTotalAmount: this.toCentString(unitPrice * item.quantity),
      itemDiscountAmount: '0',
      itemPaymentAmount: this.toCentString(unitPrice * item.quantity),
      goodsPaymentPrice: this.toCentString(unitPrice),
      tagPrice: null,
      tagText: null,
      outCode: null,
      labelVOs: null,
      buttonVOs: null,
    };
  }

  private getOrderButtons(status: number) {
    if (status === 5) {
      return [
        { primary: false, type: 2, name: '取消订单' },
        { primary: true, type: 1, name: '付款' },
      ];
    }
    if (status === 40) {
      return [{ primary: true, type: 3, name: '确认收货' }];
    }
    if (status === 50) {
      return [{ primary: true, type: 6, name: '评价' }];
    }
    return [];
  }

  private parseNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
  }

  private toCentString(value: number) {
    const amount = Math.round(this.parseNumber(value) * 100);
    return `${amount}`;
  }

  private roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }
}
