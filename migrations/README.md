# 数据库迁移说明

## 目录

1. [权限体系迁移](#权限体系迁移)
2. [库存版本控制迁移](#库存版本控制迁移)
3. [订单金额字段类型修复](#订单金额字段类型修复)

---

## 订单金额字段类型修复

### 问题描述
`yf_db_order` 表的 `order_total` 字段类型为 `integer`，无法存储小数金额（如 222.4），导致订单创建失败。

### 迁移脚本
- `fix-order-total-decimal.sql` - 修改字段类型为 decimal(10,2)
- `rollback-order-total-decimal.sql` - 回滚脚本
- `run-order-total-fix.js` - Node.js 执行脚本
- `rollback-order-total-fix.js` - Node.js 回滚脚本

### 快速执行（推荐）

```bash
cd yf-api-server
node migrations/run-order-total-fix.js
```

### 手动执行

使用 psql 命令行：
```bash
psql -h pgm-bp102n397uomya2gko.pg.rds.aliyuncs.com \
     -p 5432 \
     -U yf_pg \
     -d yf \
     -f migrations/fix-order-total-decimal.sql
```

### 回滚

```bash
node migrations/rollback-order-total-fix.js
```

### 验证

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

预期结果：`data_type = 'numeric'`, `numeric_scale = 2`

详细说明请查看：[README-order-total-fix.md](./README-order-total-fix.md)

---

## 权限体系迁移

### 迁移脚本
- `add-permission-fields.sql` - 添加权限相关字段

### 执行步骤

1. **备份数据库**（重要！）
```bash
mysqldump -u root -p yf_database > backup_$(date +%Y%m%d).sql
```

2. **执行迁移脚本**
```bash
mysql -u root -p yf_database < migrations/add-permission-fields.sql
```

或者在 MySQL 客户端中执行：
```sql
source /path/to/migrations/add-permission-fields.sql;
```

3. **验证迁移**
```sql
-- 检查 Menu 表
DESC yf_db_menu;

-- 检查 Role 表
DESC yf_db_role;

-- 查看数据
SELECT * FROM yf_db_menu LIMIT 5;
SELECT * FROM yf_db_role;
```

### 迁移内容

#### Menu 表
- 添加 `name` 字段（VARCHAR(100)）- 菜单名称
- 添加 `buttons` 字段（TEXT）- 按钮权限 JSON

#### Role 表
- 添加 `name` 字段（VARCHAR(100)）- 角色名称

### 回滚（如果需要）

```sql
-- 回滚 Menu 表
ALTER TABLE yf_db_menu DROP COLUMN IF EXISTS name;
ALTER TABLE yf_db_menu DROP COLUMN IF EXISTS buttons;

-- 回滚 Role 表
ALTER TABLE yf_db_role DROP COLUMN IF EXISTS name;
```

### 注意事项

1. 迁移脚本使用 `IF NOT EXISTS`，可以安全地重复执行
2. 现有数据会自动设置默认值
3. 建议在测试环境先执行验证
4. 执行前务必备份数据库

### 测试数据

迁移完成后，可以插入一些测试数据：

```sql
-- 更新角色名称
UPDATE yf_db_role SET name = '超级管理员' WHERE code = 'R_SUPER';
UPDATE yf_db_role SET name = '管理员' WHERE code = 'R_ADMIN';
UPDATE yf_db_role SET name = '普通用户' WHERE code = 'R_USER';

-- 更新菜单名称
UPDATE yf_db_menu SET name = '首页' WHERE route = 'home';
UPDATE yf_db_menu SET name = '商品管理' WHERE route = 'product';
UPDATE yf_db_menu SET name = '订单管理' WHERE route = 'order';

-- 添加按钮权限示例
UPDATE yf_db_menu 
SET buttons = '[{"code":"product:add","desc":"添加商品"},{"code":"product:edit","desc":"编辑商品"},{"code":"product:delete","desc":"删除商品"}]'
WHERE route = 'product';
```
