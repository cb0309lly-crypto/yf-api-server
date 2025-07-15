import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItemStatus } from '../entity/cart';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  create(body) {
    const cart = this.cartRepository.create(body);
    return this.cartRepository.save(cart);
  }

  findAll(query) {
    const { page = 1, limit = 10, userNo, status } = query;
    const queryBuilder = this.cartRepository.createQueryBuilder('cart');

    if (userNo) {
      queryBuilder.andWhere('cart.userNo = :userNo', { userNo });
    }

    if (status) {
      queryBuilder.andWhere('cart.status = :status', { status });
    }

    queryBuilder
      .leftJoinAndSelect('cart.product', 'product')
      .orderBy('cart.addedAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.cartRepository.findOne({
      where: { no: id },
      relations: ['user', 'product'],
    });
  }

  update(id: string, body) {
    return this.cartRepository.update(id, body);
  }

  remove(id: string) {
    return this.cartRepository.delete(id);
  }

  getUserCart(userId: string) {
    return this.cartRepository.find({
      where: { userNo: userId, status: CartItemStatus.ACTIVE },
      relations: ['product'],
      order: { addedAt: 'DESC' },
    });
  }

  addToCart(body) {
    const { userNo, productNo, quantity = 1 } = body;
    
    // 检查是否已存在
    return this.cartRepository.findOne({
      where: { userNo, productNo, status: CartItemStatus.ACTIVE },
    }).then(existingItem => {
      if (existingItem) {
        // 更新数量
        existingItem.quantity += quantity;
        existingItem.totalPrice = existingItem.unitPrice * existingItem.quantity;
        return this.cartRepository.save(existingItem);
      } else {
        // 创建新项目
        const cartItem = this.cartRepository.create({
          userNo,
          productNo,
          quantity,
          addedAt: new Date(),
        });
        return this.cartRepository.save(cartItem);
      }
    });
  }

  removeFromCart(body) {
    const { userNo, productNo } = body;
    return this.cartRepository.update(
      { userNo, productNo, status: CartItemStatus.ACTIVE },
      { status: CartItemStatus.REMOVED }
    );
  }

  clearCart(userNo: string) {
    return this.cartRepository.update(
      { userNo, status: CartItemStatus.ACTIVE },
      { status: CartItemStatus.REMOVED }
    );
  }

  updateQuantity(body) {
    const { id, quantity } = body;
    return this.cartRepository.findOne({ where: { no: id } }).then(item => {
      if (item) {
        item.quantity = quantity;
        item.totalPrice = item.unitPrice * quantity;
        return this.cartRepository.save(item);
      }
    });
  }
} 