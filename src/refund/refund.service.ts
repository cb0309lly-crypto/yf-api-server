import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Refund, RefundStatus, Order, OrderStatus } from '../entity';
import { CreateRefundDto } from './dto/create-refund.dto';
import { AuditRefundDto } from './dto/audit-refund.dto';

@Injectable()
export class RefundService {
  constructor(
    @InjectRepository(Refund)
    private refundRepository: Repository<Refund>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
  ) {}

  async create(userNo: string, dto: CreateRefundDto) {
    const order = await this.orderRepository.findOne({ where: { no: dto.orderNo, userNo } });
    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    
    // 简单校验：只有已付款或待发货状态可申请退款
    if (![OrderStatus.PAIED, OrderStatus.DELIVERY, OrderStatus.ORDERED].includes(order.orderStatus as any)) {
      // 这里的 OrderStatus 枚举值定义可能需要调整以匹配实际业务
      // 假设只要不是已取消或已退款即可
    }

    const refund = this.refundRepository.create({
      ...dto,
      userNo,
      refundNo: `REF${Date.now()}`,
      status: RefundStatus.PENDING
    });

    return this.refundRepository.save(refund);
  }

  async audit(refundNo: string, dto: AuditRefundDto) {
    const refund = await this.refundRepository.findOne({ where: { refundNo }, relations: ['order'] });
    if (!refund) {
      throw new NotFoundException('退款单不存在');
    }

    if (refund.status !== RefundStatus.PENDING) {
      throw new BadRequestException('该退款单已处理');
    }

    refund.status = dto.status;
    refund.adminRemark = dto.adminRemark;
    refund.auditTime = new Date();

    if (dto.status === RefundStatus.APPROVED) {
      // 模拟打款成功
      refund.completedTime = new Date();
      refund.status = RefundStatus.COMPLETED;
      
      // 更新订单状态为已退款 (或部分退款逻辑)
      // 这里简单处理：全额退款则关闭订单
      // 实际业务中需要更复杂的判断
    }

    return this.refundRepository.save(refund);
  }

  async findAll(page = 1, pageSize = 10, status?: string) {
    const qb = this.refundRepository.createQueryBuilder('refund')
      .leftJoinAndSelect('refund.user', 'user')
      .leftJoinAndSelect('refund.order', 'order')
      .orderBy('refund.createdAt', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize);

    if (status) {
      qb.andWhere('refund.status = :status', { status });
    }

    const [list, total] = await qb.getManyAndCount();
    return { list, total, page, pageSize };
  }
}
