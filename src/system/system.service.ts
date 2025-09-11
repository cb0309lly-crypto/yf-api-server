import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { System, SystemStatus } from '../entity/system';
import { PaginationResult, paginate } from '../common/utils/pagination.util';

@Injectable()
export class SystemService {
  constructor(
    @InjectRepository(System)
    private readonly systemRepository: Repository<System>,
  ) {}
  async createSystem(data: Partial<System>): Promise<System> {
    const system = this.systemRepository.create(data);
    return this.systemRepository.save(system);
  }

  async updateSystem(data: Partial<System>): Promise<System | null> {
    this.systemRepository.update({ no: data.no }, { ...data })
    return this.systemRepository.save(data);
  }

  async findAll(): Promise<System[]> {
    return this.systemRepository.find();
  }

  async findOne(no: string): Promise<System | null> {
    return this.systemRepository.findOne({ where: { no } });
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    keyword?: string,
    version?: string,
    materialNo?: string,
    device?: string,
    operatorNo?: string,
    status?: SystemStatus
  ): Promise<PaginationResult<System>> {
    const qb = this.systemRepository.createQueryBuilder('system');
    
    if (keyword) {
      qb.andWhere(
        '(system.name LIKE :keyword OR system.version LIKE :keyword OR system.materialNo LIKE :keyword OR system.device LIKE :keyword OR system.operatorNo LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    if (version) {
      qb.andWhere('system.version LIKE :version', { version: `%${version}%` });
    }
    if (materialNo) {
      qb.andWhere('system.materialNo = :materialNo', { materialNo });
    }
    if (device) {
      qb.andWhere('system.device LIKE :device', { device: `%${device}%` });
    }
    if (operatorNo) {
      qb.andWhere('system.operatorNo = :operatorNo', { operatorNo });
    }
    if (status) {
      qb.andWhere('system.status = :status', { status });
    }
    
    qb.orderBy('system.createdAt', 'DESC');
    
    return paginate(qb, page, pageSize);
  }
}
