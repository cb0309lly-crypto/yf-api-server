import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan } from 'typeorm';
import { Order, OrderStatus } from '../entity/order';
import { OrderItem } from '../entity/order-item';
import { Product } from '../entity/product';
import { Payment, PaymentStatus } from '../entity/payment';
import { Logistics } from '../entity/logistics';
import { Receiver } from '../entity/receiver';
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
      const unitPrice = this.parseNumber(goods.price ?? product?.price ?? 0);
      const quantity = Number(goods.quantity || 1);
      const totalPrice = unitPrice * quantity;
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

    return {
      storeGoodsList,
      outOfStockGoodsList: [],
      abnormalDeliveryGoodsList: [],
      inValidGoodsList: [],
      limitGoodsList: [],
      couponList: [],
      userAddress: userAddressReq,
      settleType: storeGoodsList.length > 0 ? 1 : 0,
    };
  }

  async commitPay(payload: any) {
    const totalAmount = payload?.totalAmount || 0;
    return {
      isSuccess: true,
      tradeNo: `TRADE-${Date.now()}`,
      payInfo: '{}',
      code: null,
      transactionId: `TX-${Date.now()}`,
      msg: null,
      interactId: `${Date.now()}`,
      channel: 'wechat',
      limitGoodsList: null,
      payAmt: totalAmount,
    };
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
        receiverPhone: '',
        receiverName: '',
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
}
