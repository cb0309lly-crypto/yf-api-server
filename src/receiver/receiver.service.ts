import { Injectable } from '@nestjs/common';
import { Receiver } from '../entity/receiver';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ReceiverService {
  constructor(
    @InjectRepository(Receiver)
    private readonly receiverRepository: Repository<Receiver>,
  ) {}

  async createReceiver(data: Partial<Receiver>): Promise<Receiver> {
    const receiver = this.receiverRepository.create(data);
    return this.receiverRepository.save(receiver);
  }

  async updateReceiver(data: Partial<Receiver>): Promise<Receiver> {
    this.receiverRepository.update({ no: data.no }, { ...data });
    return this.receiverRepository.save(data);
  }

  async findAll(): Promise<Receiver[]> {
    return this.receiverRepository.find();
  }

  async findOne(no: string): Promise<Receiver | null> {
    return this.receiverRepository.findOne({ where: { no } });
  }
}
