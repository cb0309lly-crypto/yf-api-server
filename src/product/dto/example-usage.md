# Product DTO 使用示例

## API 调用示例

### 1. 创建商品

**请求：**
```bash
POST /product
Content-Type: application/json

{
  "name": "iPhone 15 Pro",
  "price": 7999.00,
  "description": "最新款iPhone，搭载A17 Pro芯片",
  "imgUrl": "https://example.com/iphone15.jpg",
  "status": "已上架",
  "categoryNo": "cat_phones",
  "specs": "256GB 深空黑色",
  "unit": "台",
  "tag": "新品,热销"
}
```

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "no": "prod_20240101001",
    "name": "iPhone 15 Pro",
    "price": 7999.00,
    "description": "最新款iPhone，搭载A17 Pro芯片",
    "imgUrl": "https://example.com/iphone15.jpg",
    "status": "已上架",
    "categoryNo": "cat_phones",
    "specs": "256GB 深空黑色",
    "unit": "台",
    "tag": "新品,热销",
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**验证失败响应：**
```json
{
  "code": 400,
  "message": "参数验证失败",
  "errors": [
    "商品名称不能为空",
    "商品价格不能小于0",
    "图片URL格式不正确"
  ],
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### 2. 查询商品列表

**请求：**
```bash
GET /product/list?page=1&pageSize=10&keyword=iPhone&status=已上架&categoryNo=cat_phones
```

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "items": [
      {
        "no": "prod_20240101001",
        "name": "iPhone 15 Pro",
        "price": 7999.00,
        "status": "已上架",
        "categoryNo": "cat_phones"
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 10,
    "totalPages": 1
  }
}
```

### 3. 更新商品

**请求：**
```bash
PUT /product
Content-Type: application/json

{
  "no": "prod_20240101001",
  "price": 7499.00,
  "status": "已下架",
  "description": "降价促销中"
}
```

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "no": "prod_20240101001",
    "name": "iPhone 15 Pro",
    "price": 7499.00,
    "status": "已下架",
    "description": "降价促销中",
    "updatedAt": "2024-01-01T12:00:00.000Z"
  }
}
```

### 4. 获取单个商品

**请求：**
```bash
GET /product/prod_20240101001
```

**成功响应：**
```json
{
  "code": 0,
  "message": "success",
  "data": {
    "no": "prod_20240101001",
    "name": "iPhone 15 Pro",
    "price": 7499.00,
    "description": "降价促销中",
    "status": "已下架",
    "categoryNo": "cat_phones",
    "specs": "256GB 深空黑色",
    "unit": "台",
    "tag": "新品,热销"
  }
}
```

## 常见验证错误

### 1. 必填字段缺失
```json
{
  "price": 7999.00
}
```
**错误：** `商品名称不能为空`

### 2. 价格超出范围
```json
{
  "name": "iPhone 15 Pro",
  "price": -100
}
```
**错误：** `商品价格不能小于0`

### 3. 无效的图片URL
```json
{
  "name": "iPhone 15 Pro",
  "price": 7999.00,
  "imgUrl": "invalid-url"
}
```
**错误：** `图片URL格式不正确`

### 4. 无效的商品状态
```json
{
  "name": "iPhone 15 Pro",
  "price": 7999.00,
  "status": "无效状态"
}
```
**错误：** `商品状态值不正确`

### 5. 分页参数错误
```bash
GET /product/list?page=0&pageSize=200
```
**错误：** `页码不能小于1`, `每页数量不能超过100`

## 前端集成建议

### 1. 表单验证
```typescript
// 使用 class-validator 在前端进行预验证
import { validate } from 'class-validator';
import { CreateProductDto } from './dto';

const validateProduct = async (data: any) => {
  const dto = Object.assign(new CreateProductDto(), data);
  const errors = await validate(dto);
  return errors;
};
```

### 2. 错误处理
```typescript
// 处理API返回的验证错误
const handleValidationError = (error: any) => {
  if (error.response?.data?.errors) {
    const errors = error.response.data.errors;
    // 显示错误信息给用户
    errors.forEach(message => {
      showToast(message);
    });
  }
};
```

### 3. 类型安全
```typescript
// 使用 TypeScript 接口确保类型安全
interface CreateProductRequest {
  name: string;
  price: number;
  description?: string;
  imgUrl?: string;
  status?: ProductStatus;
  // ... 其他字段
}
```

## 测试用例

### 1. 单元测试
```typescript
describe('CreateProductDto', () => {
  it('should validate required fields', async () => {
    const dto = new CreateProductDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
```

### 2. 集成测试
```typescript
describe('Product API', () => {
  it('should create product with valid data', async () => {
    const response = await request(app.getHttpServer())
      .post('/product')
      .send({
        name: 'Test Product',
        price: 99.99
      });
    expect(response.status).toBe(201);
  });
});
```

## 最佳实践

1. **始终使用 DTO 进行参数校验**
2. **提供清晰的错误信息**
3. **在前端进行预验证**
4. **使用 TypeScript 确保类型安全**
5. **编写完整的测试用例**
6. **记录 API 文档**
7. **使用合理的默认值**
8. **限制参数范围防止滥用** 