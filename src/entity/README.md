# 零售商城系统实体类说明

本目录包含了零售商城系统的所有实体类，基于 TypeORM 框架设计。

## 实体类分类

### 1. 基础实体
- **Base**: 所有实体的基础类，包含通用字段（ID、名称、创建时间、更新时间）

### 2. 用户相关实体
- **User**: 用户实体，包含用户基本信息、认证信息、状态等
- **Gender**: 性别枚举（女性、男性、未知）
- **UserStatus**: 用户状态枚举（已创建、在线、离线、活跃、丢失）

### 3. 商品相关实体
- **Product**: 商品实体，包含商品基本信息、价格、状态、规格等
- **ProductStatus**: 商品状态枚举（已上架、已下架、缺货、有货、售罄）
- **Category**: 商品分类实体，支持多级分类
- **CategoryStatus**: 分类状态枚举（活跃、非活跃）
- **Inventory**: 库存管理实体，包含库存数量、预留数量、最低库存等

### 4. 购物相关实体
- **Cart**: 购物车实体，记录用户添加的商品
- **CartItemStatus**: 购物车项目状态枚举（活跃、已移除、已购买）
- **Order**: 订单实体，包含订单基本信息、状态、地址等
- **OrderStatus**: 订单状态枚举（已下单、未付款、已付款、已取消、已配送、异常单）
- **OrderItem**: 订单项实体，记录订单中的具体商品信息

### 5. 支付相关实体
- **Payment**: 支付实体，记录支付信息、状态、交易ID等
- **PaymentMethod**: 支付方式枚举（支付宝、微信、银行卡、现金、钱包）
- **PaymentStatus**: 支付状态枚举（待处理、处理中、成功、失败、已取消、已退款）

### 6. 评价相关实体
- **Review**: 商品评价实体，包含评分、内容、图片、验证购买等
- **ReviewStatus**: 评价状态枚举（待审核、已通过、已拒绝、已隐藏）

### 7. 营销相关实体
- **Coupon**: 优惠券实体，支持多种类型的优惠券
- **CouponType**: 优惠券类型枚举（折扣、固定金额、免运费、百分比）
- **CouponStatus**: 优惠券状态枚举（活跃、非活跃、已过期、已使用）
- **Promotion**: 促销活动实体，支持多种促销类型
- **PromotionType**: 促销类型枚举（折扣、买一送一、限时抢购、捆绑销售、免运费）
- **PromotionStatus**: 促销状态枚举（草稿、活跃、暂停、已结束、已取消）

### 8. 用户行为相关实体
- **Wishlist**: 收藏夹实体，记录用户收藏的商品

### 9. 通知相关实体
- **Notification**: 通知实体，支持多种通知类型和发送方式
- **NotificationType**: 通知类型枚举（订单状态、支付、物流、促销、系统、安全）
- **NotificationStatus**: 通知状态枚举（未读、已读、已归档）

### 10. 现有实体（保持兼容性）
- **Company**: 公司实体
- **Logistics**: 物流实体
- **Receiver**: 收货人实体
- **System**: 系统实体

## 关系映射

### 用户关系
- User ↔ Cart (一对多)
- User ↔ Order (一对多)
- User ↔ Payment (一对多)
- User ↔ Review (一对多)
- User ↔ Coupon (一对多)
- User ↔ Wishlist (一对多)
- User ↔ Notification (一对多)

### 商品关系
- Product ↔ Category (多对一)
- Product ↔ Inventory (一对多)
- Product ↔ Cart (一对多)
- Product ↔ OrderItem (一对多)
- Product ↔ Review (一对多)
- Product ↔ Wishlist (一对多)

### 订单关系
- Order ↔ User (多对一)
- Order ↔ OrderItem (一对多)
- Order ↔ Payment (一对多)
- Order ↔ Review (一对多)

### 分类关系
- Category ↔ Product (一对多)

## 使用示例

```typescript
import { User, Product, Order, Payment } from './entity';

// 创建用户
const user = new User();
user.name = '张三';
user.phone = '13800138000';

// 创建商品
const product = new Product();
product.name = 'iPhone 15';
product.price = 5999.00;
product.status = ProductStatus.ACTIVE;

// 创建订单
const order = new Order();
order.userNo = user.no;
order.orderTotal = 5999.00;
order.orderStatus = OrderStatus.ORDERED;
```

## 注意事项

1. 所有实体都继承自 `Base` 类，包含通用字段
2. 使用 UUID 作为主键
3. 所有枚举都使用字符串值，便于国际化
4. 关系映射使用外键约束，确保数据一致性
5. 时间字段使用 `createdAt` 和 `updatedAt` 自动管理 