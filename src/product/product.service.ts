import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entity/product';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async addProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    return this.productRepository.save(product);
  }

  async updateProduct(data: Partial<Product>): Promise<Product> {
    this.productRepository.update({ no: data.no }, { ...data });
    return this.productRepository.save(data);
  }

  async findAll(): Promise<Product[]> {
    return this.productRepository.find();
  }

  async findOne(no: string): Promise<Product | null> {
    return this.productRepository.findOne({ where: { no } });
  }
}
