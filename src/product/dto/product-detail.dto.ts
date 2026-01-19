import { Product } from '../../entity/product';

export class ProductDetailDto extends Product {
  stockQuantity: number;
}
