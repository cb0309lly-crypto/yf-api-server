// 基础实体
export { Base } from './base';

// 用户相关实体
export { User, Gender, UserStatus } from './user';
export { Role } from './role';
export { Menu } from './menu';

// 商品相关实体
export { Product, ProductStatus } from './product';
export { Category, CategoryStatus } from './category';
export { Inventory, InventoryStatus } from './inventory';

// 购物相关实体
export { Cart, CartItemStatus } from './cart';
export { Order, OrderStatus } from './order';
export { OrderItem, OrderItemStatus } from './order-item';
export { Refund, RefundStatus, RefundType } from './refund';

// 支付相关实体
export { Payment, PaymentMethod, PaymentStatus } from './payment';

// 评价相关实体
export { Review, ReviewStatus } from './review';

// 营销相关实体
export { Coupon, CouponType, CouponStatus } from './coupon';
export { Promotion, PromotionType, PromotionStatus } from './promotion';

// 用户行为相关实体
export { Wishlist } from './wishlist';

// 通知相关实体
export {
  Notification,
  NotificationType,
  NotificationStatus,
} from './notification';

// 现有实体（保持兼容性）
export { Company } from './company';
export { Logistics } from './logistics';
export { Receiver } from './receiver';
export { System } from './system';
export { Config } from './config';
