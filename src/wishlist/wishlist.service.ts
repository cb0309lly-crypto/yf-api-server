import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Wishlist } from '../entity/wishlist';

@Injectable()
export class WishlistService {
  constructor(
    @InjectRepository(Wishlist)
    private wishlistRepository: Repository<Wishlist>,
  ) {}

  create(body) {
    const wishlist = this.wishlistRepository.create(body);
    return this.wishlistRepository.save(wishlist);
  }

  findAll(query) {
    const { page = 1, limit = 10, userNo, productNo } = query;
    const queryBuilder = this.wishlistRepository.createQueryBuilder('wishlist');

    if (userNo) {
      queryBuilder.andWhere('wishlist.userNo = :userNo', { userNo });
    }

    if (productNo) {
      queryBuilder.andWhere('wishlist.productNo = :productNo', { productNo });
    }

    queryBuilder
      .leftJoinAndSelect('wishlist.product', 'product')
      .leftJoinAndSelect('wishlist.user', 'user')
      .orderBy('wishlist.addedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.wishlistRepository.findOne({
      where: { no: id },
      relations: ['user', 'product'],
    });
  }

  update(id: string, body) {
    return this.wishlistRepository.update(id, body);
  }

  remove(id: string) {
    return this.wishlistRepository.delete(id);
  }

  getUserWishlist(userId: string, query) {
    const { page = 1, limit = 10 } = query;
    
    const queryBuilder = this.wishlistRepository.createQueryBuilder('wishlist');

    queryBuilder.andWhere('wishlist.userNo = :userId', { userId });
    queryBuilder
      .leftJoinAndSelect('wishlist.product', 'product')
      .orderBy('wishlist.addedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  addToWishlist(body) {
    const { userNo, productNo } = body;
    
    // 检查是否已存在
    return this.wishlistRepository.findOne({
      where: { userNo, productNo },
    }).then(existingItem => {
      if (existingItem) {
        return existingItem;
      } else {
        const wishlistItem = this.wishlistRepository.create({
          userNo,
          productNo,
          addedAt: new Date(),
        });
        return this.wishlistRepository.save(wishlistItem);
      }
    });
  }

  removeFromWishlist(body) {
    const { userNo, productNo } = body;
    return this.wishlistRepository.delete({ userNo, productNo });
  }

  clearWishlist(userNo: string) {
    return this.wishlistRepository.delete({ userNo });
  }

  checkInWishlist(body) {
    const { userNo, productNo } = body;
    return this.wishlistRepository.findOne({
      where: { userNo, productNo },
    }).then(item => {
      return { inWishlist: !!item };
    });
  }
} 