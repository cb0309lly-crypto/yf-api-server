# Product 模块 DTO 参数校验说明

本目录包含了 Product 模块的所有 DTO（Data Transfer Object）类，用于参数校验和类型安全。

## DTO 文件说明

### 1. CreateProductDto - 创建商品
用于创建新商品时的参数校验。

**必填字段：**
- `name`: 商品名称（字符串）
- `price`: 商品价格（数字，0-999999.99）

**可选字段：**
- `description`: 商品描述
- `imgUrl`: 商品图片URL（必须是有效的URL格式）
- `status`: 商品状态（枚举值）
- `specs`: 商品规格
- `unit`: 商品单位
- `tag`: 商品标签
- `companyNo`: 公司编号
- `categoryNo`: 分类编号
- `orderNo`: 订单编号

**验证规则：**
- 价格范围：0-999999.99
- 图片URL必须是有效格式
- 状态必须是预定义的枚举值

### 2. UpdateProductDto - 更新商品
用于更新商品信息时的参数校验。

**必填字段：**
- `no`: 商品编号

**可选字段：**
- 所有 CreateProductDto 中的字段（除了 no）

**验证规则：**
- 与 CreateProductDto 相同的验证规则

### 3. QueryProductDto - 查询商品
用于商品列表查询时的参数校验。

**可选字段：**
- `page`: 页码（数字，默认1，最小值1）
- `pageSize`: 每页数量（数字，默认10，范围1-100）
- `keyword`: 搜索关键词
- `categoryNo`: 分类编号
- `status`: 商品状态
- `companyNo`: 公司编号
- `name`: 商品名称

**验证规则：**
- 页码不能小于1
- 每页数量范围：1-100
- 所有字符串字段都进行类型验证

### 4. ProductIdDto - 商品ID
用于单个商品操作时的ID参数校验。

**必填字段：**
- `id`: 商品ID（字符串，不能为空）

## 使用示例

### 创建商品
```typescript
// 请求体
{
  "name": "iPhone 15",
  "price": 5999.00,
  "description": "最新款iPhone",
  "status": "已上架",
  "categoryNo": "cat_001"
}

// 成功响应
{
  "code": 0,
  "message": "success",
  "data": {
    "no": "prod_001",
    "name": "iPhone 15",
    "price": 5999.00,
    // ... 其他字段
  }
}
```

### 查询商品列表
```typescript
// 请求参数
GET /product/list?page=1&pageSize=10&keyword=iPhone&status=已上架

// 成功响应
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [...],
    "total": 100,
    "page": 1,
    "pageSize": 10
  }
}
```

### 更新商品
```typescript
// 请求体
{
  "no": "prod_001",
  "price": 5499.00,
  "status": "已下架"
}

// 成功响应
{
  "code": 0,
  "message": "success",
  "data": {
    "no": "prod_001",
    "price": 5499.00,
    "status": "已下架",
    // ... 其他字段
  }
}
```

## 错误处理

当参数验证失败时，会返回详细的错误信息：

```json
{
  "code": 400,
  "message": "参数验证失败",
  "errors": [
    "商品名称不能为空",
    "商品价格不能小于0"
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 验证规则说明

1. **字符串验证**: 使用 `@IsString()` 确保字段为字符串类型
2. **数字验证**: 使用 `@IsNumber()` 确保字段为数字类型
3. **范围验证**: 使用 `@Min()` 和 `@Max()` 限制数值范围
4. **URL验证**: 使用 `@IsUrl()` 验证URL格式
5. **枚举验证**: 使用 `@IsEnum()` 确保值为预定义的枚举值
6. **可选字段**: 使用 `@IsOptional()` 标记可选字段
7. **类型转换**: 使用 `@Type()` 进行自动类型转换

## 注意事项

1. 所有 DTO 都使用了 `class-validator` 进行参数校验
2. 错误信息使用中文，便于前端显示
3. 价格字段使用 decimal 类型，支持两位小数
4. 分页参数有合理的默认值和范围限制
5. 所有验证失败都会返回详细的错误信息 