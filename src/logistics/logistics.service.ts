import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Logistics } from '../entity/logistics';

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
}
