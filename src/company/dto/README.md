# Company模块DTO说明

## 概述
Company模块的DTO（数据传输对象）用于验证和传输公司相关的数据。

## DTO类型

### 1. CreateCompanyDto - 创建公司
用于创建新公司时的数据验证。

**必填字段：**
- `name`: 公司名称 (1-100字符)

**可选字段：**
- `description`: 公司描述 (最多500字符)
- `address`: 公司地址 (最多200字符)
- `taxId`: 税号 (15-20字符)
- `phoneNumber`: 电话号码 (11-15字符)
- `email`: 邮箱 (必须符合邮箱格式，最多100字符)
- `creator`: 创建者 (最多50字符)

### 2. UpdateCompanyDto - 更新公司
用于更新现有公司信息时的数据验证。

**必填字段：**
- `no`: 公司编号 (1-50字符)

**可选字段：**
- 其他字段与CreateCompanyDto相同

### 3. QueryCompanyDto - 查询公司
用于查询公司列表时的参数验证。

**分页参数：**
- `page`: 页码 (默认1，最小1)
- `pageSize`: 每页数量 (默认10，范围1-100)

**查询条件：**
- `name`: 公司名称
- `description`: 公司描述
- `address`: 公司地址
- `taxId`: 税号
- `phoneNumber`: 电话号码
- `email`: 邮箱
- `creator`: 创建者
- `keyword`: 关键词 (搜索名称、描述、地址)

### 4. CompanyIdDto - 公司ID参数
用于路径参数验证。

**必填字段：**
- `id`: 公司编号 (1-50字符)

## 使用示例

### 创建公司
```typescript
POST /company
{
  "name": "示例公司",
  "description": "这是一家示例公司",
  "address": "北京市朝阳区",
  "phoneNumber": "13800138000",
  "email": "contact@example.com"
}
```

### 更新公司
```typescript
PUT /company
{
  "no": "company-uuid",
  "name": "更新后的公司名称",
  "description": "更新后的描述"
}
```

### 查询公司列表
```typescript
GET /company/list?page=1&pageSize=10&keyword=示例&email=contact@example.com
```

### 获取单个公司
```typescript
GET /company/company-uuid
```

## 验证规则

- 所有字符串字段都会进行长度验证
- 邮箱字段会进行格式验证
- 电话号码会进行长度验证
- 分页参数会进行数值范围验证
- 必填字段不能为空
