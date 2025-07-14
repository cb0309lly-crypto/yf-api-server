import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { System } from '../entity/system';

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
}
