# 订单金额字段类型修复

## 问题描述

`yf_db_order` 表的 `order_total` 字段类型为 `integer`，无法存储小数金额（如 222.4），导致订单创建失败。

错误信息：
```
QueryFailedError: invalid input syntax for type integer: "222.4"
```

## 解决方案

将 `order_total` 字段类型从 `integer` 修改为 `decimal(10,2)`，支持最多10位数字，其中2位小数。

## 执行迁移

### 方式一：使用 psql 命令行

```bash
# 连接到数据库
psql -U your_username -d your_database

# 执行迁移脚本
\i migrations/fix-order-total-decimal.sql
```

### 方式二：使用 SQL 客户端工具

在 DBeaver、pgAdmin 或其他 PostgreSQL 客户端中执行 `fix-order-total-decimal.sql` 文件中的 SQL 语句。

### 方式三：使用 Node.js 脚本

```bash
cd yf-api-server
node -e "
const { Client } = require('pg');
const fs = require('fs');
const client = new Client({
  connectionString: process.env.DATABASE_URL
});
client.connect();
const sql = fs.readFileSync('migrations/fix-order-total-decimal.sql', 'utf8');
client.query(sql)
  .then(() => {
    console.log('Migration completed successfully');
    client.end();
  })
  .catch(err => {
    console.error('Migration failed:', err);
    client.end();
  });
"
```

## 回滚

如果需要回滚此修改，执行 `rollback-order-total-decimal.sql` 脚本：

```bash
psql -U your_username -d your_database -f migrations/rollback-order-total-decimal.sql
```

## 影响范围

- 表：`yf_db_order`
- 字段：`order_total`
- 类型变更：`integer` → `decimal(10,2)`
- 默认值：`0` → `0.0`

## 数据兼容性

现有的整数金额数据会自动转换为 decimal 类型，不会丢失数据。例如：
- `100` → `100.00`
- `0` → `0.00`

## 相关修改

1. **实体定义**：`src/entity/order.ts` - 添加了 `type: 'decimal'` 配置
2. **服务层**：`src/order/order.service.ts` - 添加了 `roundToTwoDecimals()` 方法确保精度
3. **数据库迁移**：本目录下的 SQL 脚本

## 验证

迁移完成后，可以通过以下 SQL 验证字段类型：

```sql
SELECT 
  column_name, 
  data_type, 
  numeric_precision, 
  numeric_scale 
FROM information_schema.columns 
WHERE table_name = 'yf_db_order' 
  AND column_name = 'order_total';
```

预期结果：
- `data_type`: `numeric`
- `numeric_precision`: `10`
- `numeric_scale`: `2`
