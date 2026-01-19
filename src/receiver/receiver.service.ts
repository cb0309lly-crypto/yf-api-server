import { Injectable, BadRequestException } from '@nestjs/common';
import { Receiver } from '../entity/receiver';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationResult, paginate } from '../common/utils/pagination.util';

@Injectable()
export class ReceiverService {
  constructor(
    @InjectRepository(Receiver)
    private readonly receiverRepository: Repository<Receiver>,
  ) {}

  async createReceiver(data: Partial<Receiver>): Promise<Receiver> {
    if (data.isDefault && data.userNo) {
      await this.clearDefaultAddress(data.userNo);
    }
    const receiver = this.receiverRepository.create(data);
    return this.receiverRepository.save(receiver);
  }

  async updateReceiver(data: Partial<Receiver>): Promise<Receiver> {
    if (!data.no) {
      throw new BadRequestException('Receiver No is required');
    }
    if (data.isDefault) {
      let userNo = data.userNo;
      if (!userNo) {
        const existing = await this.findOne(data.no);
        userNo = existing?.userNo;
      }
      if (userNo) {
        await this.clearDefaultAddress(userNo);
      }
    }
    await this.receiverRepository.save(data);
    const updated = await this.findOne(data.no);
    if (!updated) {
      throw new BadRequestException('Receiver not found');
    }
    return updated;
  }

  async deleteReceiver(no: string): Promise<void> {
    const result = await this.receiverRepository.delete(no);
    if (result.affected === 0) {
      throw new BadRequestException('Receiver not found');
    }
  }

  private async clearDefaultAddress(userNo: string) {
    await this.receiverRepository.update({ userNo }, { isDefault: false });
  }

  async findAll(): Promise<Receiver[]> {
    return this.receiverRepository.find();
  }

  async findOne(no: string): Promise<Receiver | null> {
    return this.receiverRepository.findOne({ where: { no } });
  }

  async findAllPaged(
    page = 1,
    pageSize = 10,
    keyword?: string,
    address?: string,
    phone?: string,
    email?: string,
    groupBy?: number,
    description?: string,
    userNo?: string,
    tag?: string,
  ): Promise<PaginationResult<Receiver>> {
    const qb = this.receiverRepository.createQueryBuilder('receiver');

    if (keyword) {
      qb.andWhere(
        '(receiver.name LIKE :keyword OR receiver.address LIKE :keyword OR receiver.phone LIKE :keyword OR receiver.email LIKE :keyword OR receiver.description LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }
    if (address) {
      qb.andWhere('receiver.address LIKE :address', {
        address: `%${address}%`,
      });
    }
    if (phone) {
      qb.andWhere('receiver.phone = :phone', { phone });
    }
    if (email) {
      qb.andWhere('receiver.email = :email', { email });
    }
    if (groupBy) {
      qb.andWhere('receiver.groupBy = :groupBy', { groupBy });
    }
    if (description) {
      qb.andWhere('receiver.description LIKE :description', {
        description: `%${description}%`,
      });
    }
    if (userNo) {
      qb.andWhere('receiver.userNo = :userNo', { userNo });
    }
    if (tag) {
      qb.andWhere('receiver.tag = :tag', { tag });
    }

    qb.orderBy('receiver.createdAt', 'DESC');

    return paginate(qb, page, pageSize);
  }
}
