import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logistics, LogisticsCurrentStatus } from '../entity/logistics';
import { PaginationResult, paginate } from '../common/utils/pagination.util';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Logistics)
    private readonly logisticsRepository: Repository<Logistics>,
  ) {}

  async createLogistic(data: Partial<Logistics>): Promise<Logistics> {
    const logistics = this.logisticsRepository.create(data);
    return await this.logisticsRepository.save(logistics);
  }

  async updateLogistics(data: Partial<Logistics>): Promise<Logistics> {
    this.logisticsRepository.update({ no: data.no }, { ...data });
    return this.logisticsRepository.save(data);
  }

  async findAll(): Promise<Logistics[]> {
    return this.logisticsRepository.find();
  }

  async findOne(no: string): Promise<Logistics | null> {
    return this.logisticsRepository.findOne({ where: { no } });
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    keyword?: string,
    senderNo?: string,
    receiverNo?: string,
    orderNo?: string,
    currentStatus?: LogisticsCurrentStatus,
    receive_time?: string
  ): Promise<PaginationResult<Logistics>> {
    const qb = this.logisticsRepository.createQueryBuilder('logistics');
    
    if (keyword) {
      qb.andWhere(
        '(logistics.senderNo LIKE :keyword OR logistics.receiverNo LIKE :keyword OR logistics.orderNo LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    if (senderNo) {
      qb.andWhere('logistics.senderNo = :senderNo', { senderNo });
    }
    if (receiverNo) {
      qb.andWhere('logistics.receiverNo = :receiverNo', { receiverNo });
    }
    if (orderNo) {
      qb.andWhere('logistics.orderNo = :orderNo', { orderNo });
    }
    if (currentStatus) {
      qb.andWhere('logistics.currentStatus = :currentStatus', { currentStatus });
    }
    if (receive_time) {
      qb.andWhere('DATE(logistics.receive_time) = :receive_time', { receive_time });
    }
    
    qb.orderBy('logistics.createdAt', 'DESC');
    
    return paginate(qb, page, pageSize);
  }
}
