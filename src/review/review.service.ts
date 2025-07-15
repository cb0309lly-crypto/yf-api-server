import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewStatus } from '../entity/review';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
  ) {}

  create(body) {
    const review = this.reviewRepository.create({
      ...body,
      reviewTime: new Date(),
      status: ReviewStatus.PENDING,
    });
    return this.reviewRepository.save(review);
  }

  findAll(query) {
    const { page = 1, limit = 10, status, rating, productNo, userNo } = query;
    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    if (status) {
      queryBuilder.andWhere('review.status = :status', { status });
    }

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    if (productNo) {
      queryBuilder.andWhere('review.productNo = :productNo', { productNo });
    }

    if (userNo) {
      queryBuilder.andWhere('review.userNo = :userNo', { userNo });
    }

    queryBuilder
      .leftJoinAndSelect('review.user', 'user')
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.reviewTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.reviewRepository.findOne({
      where: { no: id },
      relations: ['user', 'product', 'order'],
    });
  }

  update(id: string, body) {
    return this.reviewRepository.update(id, body);
  }

  remove(id: string) {
    return this.reviewRepository.delete(id);
  }

  getProductReviews(productId: string, query) {
    const { page = 1, limit = 10, rating, status = ReviewStatus.APPROVED } = query;
    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    queryBuilder.andWhere('review.productNo = :productId', { productId });
    queryBuilder.andWhere('review.status = :status', { status });

    if (rating) {
      queryBuilder.andWhere('review.rating = :rating', { rating });
    }

    queryBuilder
      .leftJoinAndSelect('review.user', 'user')
      .orderBy('review.reviewTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  getUserReviews(userId: string, query) {
    const { page = 1, limit = 10, status } = query;
    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    queryBuilder.andWhere('review.userNo = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('review.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('review.product', 'product')
      .orderBy('review.reviewTime', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  markHelpful(id: string) {
    return this.reviewRepository
      .createQueryBuilder()
      .update(Review)
      .set({
        helpfulCount: () => 'helpfulCount + 1',
      })
      .where('no = :id', { id })
      .execute();
  }

  addReply(id: string, body) {
    const { adminReply } = body;
    return this.reviewRepository.update(id, {
      adminReply,
      replyTime: new Date(),
    });
  }
} 