## Project setup

```bash
$ pnpm install
```

## Compile and run the project

```bash
# development
$ pnpm run start

# watch mode
$ pnpm run start:dev

# production mode
$ pnpm run start:prod
```

## Run tests

```bash
# unit tests
$ pnpm run test

# e2e tests
$ pnpm run test:e2e

# test coverage
$ pnpm run test:cov
```

## 🎉 已完成的零售商城系统模块

### 📁 **新创建的模块**

1. **Category** - 商品分类管理
   - `category.controller.ts` - 分类控制器
   - `category.service.ts` - 分类服务
   - `category.module.ts` - 分类模块

2. **Inventory** - 库存管理
   - `inventory.controller.ts` - 库存控制器
   - `inventory.service.ts` - 库存服务
   - `inventory.module.ts` - 库存模块

3. **Cart** - 购物车管理
   - `cart.controller.ts` - 购物车控制器
   - `cart.service.ts` - 购物车服务
   - `cart.module.ts` - 购物车模块

4. **OrderItem** - 订单项管理
   - `order-item.controller.ts` - 订单项控制器
   - `order-item.service.ts` - 订单项服务
   - `order-item.module.ts` - 订单项模块

5. **Payment** - 支付管理
   - `payment.controller.ts` - 支付控制器
   - `payment.service.ts` - 支付服务
   - `payment.module.ts` - 支付模块

6. **Review** - 商品评价管理
   - `review.controller.ts` - 评价控制器
   - `review.service.ts` - 评价服务
   - `review.module.ts` - 评价模块

7. **Coupon** - 优惠券管理
   - `coupon.controller.ts` - 优惠券控制器
   - `coupon.service.ts` - 优惠券服务
   - `coupon.module.ts` - 优惠券模块

8. **Promotion** - 促销活动管理
   - `promotion.controller.ts` - 促销控制器
   - `promotion.service.ts` - 促销服务
   - `promotion.module.ts` - 促销模块

9. **Wishlist** - 收藏夹管理
   - `wishlist.controller.ts` - 收藏夹控制器
   - `wishlist.service.ts` - 收藏夹服务
   - `wishlist.module.ts` - 收藏夹模块

10. **Notification** - 通知管理
    - `notification.controller.ts` - 通知控制器
    - `notification.service.ts` - 通知服务
    - `notification.module.ts` - 通知模块

### 🔄 **更新的现有模块**

- **Product** - 更新了与分类、库存、购物车、订单项、评价、收藏夹的关系映射
- **User** - 更新了与购物车、订单、支付、评价、优惠券、收藏夹、通知的关系映射
- **Order** - 更新了与用户、订单项、支付、评价的关系映射
- **AppModule** - 添加了所有新模块的导入

### 🎯 **主要功能特点**

#### **Category 模块**
- ✅ 分类的增删改查
- ✅ 分类树形结构
- ✅ 分类商品查询
- ✅ 分类状态管理

#### **Inventory 模块**
- ✅ 库存的增删改查
- ✅ 库存补货功能
- ✅ 库存预留功能
- ✅ 低库存预警
- ✅ 商品库存查询

#### **Cart 模块**
- ✅ 购物车的增删改查
- ✅ 添加商品到购物车
- ✅ 从购物车移除商品
- ✅ 清空购物车
- ✅ 更新商品数量
- ✅ 用户购物车查询

#### **OrderItem 模块**
- ✅ 订单项的增删改查
- ✅ 批量创建订单项
- ✅ 订单商品查询
- ✅ 订单项状态管理

#### **Payment 模块**
- ✅ 支付的增删改查
- ✅ 支付处理
- ✅ 退款处理
- ✅ 订单支付查询
- ✅ 用户支付记录

#### **Review 模块**
- ✅ 评价的增删改查
- ✅ 商品评价查询
- ✅ 用户评价查询
- ✅ 评价点赞功能
- ✅ 管理员回复功能

#### **Coupon 模块**
- ✅ 优惠券的增删改查
- ✅ 优惠券验证
- ✅ 优惠券使用
- ✅ 可用优惠券查询
- ✅ 用户优惠券查询

#### **Promotion 模块**
- ✅ 促销活动的增删改查
- ✅ 激活/暂停促销
- ✅ 活跃促销查询
- ✅ 商品促销查询

#### **Wishlist 模块**
- ✅ 收藏夹的增删改查
- ✅ 添加商品到收藏
- ✅ 从收藏移除商品
- ✅ 清空收藏夹
- ✅ 检查商品是否已收藏

#### **Notification 模块**
- ✅ 通知的增删改查
- ✅ 用户通知查询
- ✅ 标记已读功能
- ✅ 全部标记已读
- ✅ 未读数量查询
- ✅ 发送通知功能

###  **API 端点示例**

```
<code_block_to_apply_changes_from>
```

###  **代码特点**

- ✅ **遵循现有代码风格** - 不使用 DTO，直接使用 body 参数
- ✅ **完整的 CRUD 操作** - 每个模块都包含增删改查功能
- ✅ **关系映射** - 使用 TypeORM 的关系装饰器
- ✅ **分页查询** - 支持分页和条件查询
- ✅ **业务逻辑** - 包含具体的业务功能实现
- ✅ **模块化设计** - 每个功能都是独立的模块
- ✅ **导出服务** - 便于其他模块使用

这个零售商城系统现在具备了完整的电商功能，包括商品管理、库存管理、购物车、订单、支付、评价、营销、收藏和通知等核心功能模块。所有模块都遵循了您现有的代码风格，可以直接运行使用。

## 系统改进建议

### 1. 架构与代码实现

- **未使用DTO与类型校验**  
  当前 controller 层直接接收 body/query，未做类型校验，容易导致脏数据入库，建议在 service 层增加基本校验。
- **事务处理缺失**  
  多表操作（如下单、支付、库存扣减、优惠券使用等）未使用事务，可能导致数据不一致。
- **代码复用性不足**  
  多处 CRUD 逻辑重复，建议抽象 BaseService 或通用工具类，减少重复代码。

### 2. 业务完整性与边界场景

- **业务流程未串联**  
  订单、订单项、库存、支付、优惠券等模块未有完整的业务流程串联（如下单时自动扣减库存、生成支付单、校验优惠券等）。
- **购物车与订单未联动**  
  购物车结算后未自动清空或标记已购买。
- **库存超卖风险**  
  并发下单时，库存未加锁或乐观锁，存在超卖风险。
- **优惠券/促销校验不严谨**  
  如优惠券是否可叠加、是否与促销冲突、是否过期、是否超出使用次数等边界未严格校验。
- **订单状态流转不完整**  
  如未付款、已付款、已发货、已完成、已取消等状态流转未做严格限制和校验。

### 3. 安全性

- **接口未做用户身份校验**  
  购物车、订单、评价、收藏等接口未校验当前用户是否有权限操作该资源，存在越权风险。
- **缺少登录态校验**  
  controller 层未集成 JWT、Session 等认证机制。
- **敏感信息未脱敏**  
  如用户手机号、地址等敏感信息未做脱敏处理。
- **SQL注入风险**  
  虽然 TypeORM 能防止大部分注入，但拼接 SQL 时仍需注意。

### 4. 性能与扩展性

- **分页未返回总数**  
  大部分 findAll/find 查询未返回 total，总页数等，前端分页体验不佳。
- **N+1 查询问题**  
  部分 leftJoinAndSelect 可能导致 N+1 查询，建议合理使用 relations 和 select。
- **高并发下的并发控制**  
  库存、订单等高并发场景未加锁，建议引入乐观锁/悲观锁机制。

### 5. 其他建议

- **日志与监控缺失**  
  未集成日志（如 winston）、监控（如 prometheus）、异常报警等，生产环境可用性不足。
- **国际化与多语言**  
  部分枚举、状态、错误信息为中文硬编码，建议支持多语言。
- **测试覆盖不足**  
  缺少单元测试、集成测试，建议为核心业务逻辑补充测试用例。

### 6. 具体代码层面举例

- controller 层直接接收 body，未做参数校验，容易导致脏数据入库。
- service 层 update/delete 等操作未校验数据是否存在，可能导致无效操作。
- 订单、支付、库存等多表操作未加事务，存在数据不一致风险。
- 购物车、收藏夹等未做用户身份校验，存在越权风险。
- findAll/find 查询未返回 total，分页体验不佳。

---

**系统整体结构清晰，功能模块齐全，适合二次开发和扩展。但在类型安全、参数校验、事务一致性、权限认证、并发控制、分页优化、日志监控、测试覆盖等方面还存在较多可提升空间。**

如需针对某一模块或某类缺陷给出详细优化方案或代码示例，请随时查阅本说明或联系开发者。
