import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart, CartItemStatus } from '../entity/cart';
import { Product } from '../entity/product';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
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

  async getUserCart(userId: string) {
    const cartItems = await this.cartRepository.find({
      where: { userNo: userId, status: CartItemStatus.ACTIVE },
      relations: ['product'],
      order: { addedAt: 'DESC' },
    });

    // 计算购物车总价，确保数据类型转换
    const totalPrice = cartItems.reduce((sum, item) => {
      const price = this.parseNumber(item.totalPrice);
      return sum + price;
    }, 0);

    return {
      items: cartItems,
      totalPrice: totalPrice,
      itemCount: cartItems.length,
    };
  }

  // 解析数字，处理字符串转数字的情况
  private parseNumber(value: any): number {
    if (value === null || value === undefined) {
      return 0;
    }

    if (typeof value === 'number') {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? 0 : parsed;
    }

    return 0;
  }

  async addToCart(body) {
    const { userNo, productNo, quantity = 1 } = body;

    // 获取商品信息
    const product = await this.productRepository.findOne({
      where: { no: productNo },
    });

    if (!product) {
      throw new Error('商品不存在');
    }

    // 检查是否已存在
    const existingItem = await this.cartRepository.findOne({
      where: { userNo, productNo, status: CartItemStatus.ACTIVE },
    });

    if (existingItem) {
      // 更新数量
      existingItem.quantity += quantity;
      const unitPrice = this.parseNumber(existingItem.unitPrice);
      existingItem.totalPrice = unitPrice * existingItem.quantity;
      return this.cartRepository.save(existingItem);
    } else {
      // 创建新项目
      const productPrice = this.parseNumber(product.price);
      const cartItem = this.cartRepository.create({
        userNo,
        productNo,
        quantity,
        unitPrice: productPrice,
        totalPrice: productPrice * quantity,
        addedAt: new Date(),
        name: `cart-${userNo}-${Date.now().toString()}`,
      });
      return this.cartRepository.save(cartItem);
    }
  }

  removeFromCart(body) {
    const { userNo, productNo } = body;
    return this.cartRepository.update(
      { userNo, productNo, status: CartItemStatus.ACTIVE },
      { status: CartItemStatus.REMOVED },
    );
  }

  clearCart(userNo: string) {
    return this.cartRepository.update(
      { userNo, status: CartItemStatus.ACTIVE },
      { status: CartItemStatus.REMOVED },
    );
  }

  updateQuantity(body) {
    const { no, quantity } = body;
    return this.cartRepository.findOne({ where: { no } }).then((item) => {
      if (item) {
        item.quantity = quantity;
        const unitPrice = this.parseNumber(item.unitPrice);
        item.totalPrice = unitPrice * quantity;
        return this.cartRepository.save(item);
      }
    });
  }

  selectAll(body) {
    const { userNo, isSelected } = body;
    return this.cartRepository.update(
      { userNo, status: CartItemStatus.ACTIVE },
      { selected: isSelected },
    );
  }
}
