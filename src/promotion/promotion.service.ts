import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion, PromotionStatus, PromotionType } from '../entity/promotion';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
  ) {}

  create(body) {
    const promotion = this.promotionRepository.create(body);
    return this.promotionRepository.save(promotion);
  }

  findAll(query) {
    const { page = 1, limit = 10, status, type, isFeatured } = query;
    const queryBuilder =
      this.promotionRepository.createQueryBuilder('promotion');

    if (status) {
      queryBuilder.andWhere('promotion.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('promotion.type = :type', { type });
    }

    if (isFeatured !== undefined) {
      queryBuilder.andWhere('promotion.isFeatured = :isFeatured', {
        isFeatured,
      });
    }

    queryBuilder
      .orderBy('promotion.priority', 'DESC')
      .addOrderBy('promotion.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.promotionRepository.findOne({
      where: { no: id },
    });
  }

  update(id: string, body) {
    return this.promotionRepository.update(id, body);
  }

  remove(id: string) {
    return this.promotionRepository.delete(id);
  }

  getActivePromotions(query) {
    const { page = 1, limit = 10, type } = query;
    const now = new Date();

    const queryBuilder =
      this.promotionRepository.createQueryBuilder('promotion');

    queryBuilder.andWhere('promotion.status = :status', {
      status: PromotionStatus.ACTIVE,
    });
    queryBuilder.andWhere('promotion.startDate <= :now', { now });
    queryBuilder.andWhere('promotion.endDate >= :now', { now });

    if (type) {
      queryBuilder.andWhere('promotion.type = :type', { type });
    }

    queryBuilder
      .orderBy('promotion.priority', 'DESC')
      .addOrderBy('promotion.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  activatePromotion(id: string) {
    return this.promotionRepository.update(id, {
      status: PromotionStatus.ACTIVE,
    });
  }

  pausePromotion(id: string) {
    return this.promotionRepository.update(id, {
      status: PromotionStatus.PAUSED,
    });
  }

  getProductPromotions(productId: string) {
    const now = new Date();

    return this.promotionRepository
      .createQueryBuilder('promotion')
      .where('promotion.status = :status', { status: PromotionStatus.ACTIVE })
      .andWhere('promotion.startDate <= :now', { now })
      .andWhere('promotion.endDate >= :now', { now })
      .andWhere('promotion.applicableProducts @> :productId', {
        productId: [productId],
      })
      .orderBy('promotion.priority', 'DESC')
      .getMany();
  }
}
