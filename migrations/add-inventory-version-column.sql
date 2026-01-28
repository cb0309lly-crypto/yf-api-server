-- 添加库存表版本号字段（乐观锁）
-- 执行时间: 2026-01-21
-- 用途: 支持库存并发控制，防止超卖

-- 1. 添加 version 字段
ALTER TABLE yf_db_inventory 
ADD COLUMN version INT NOT NULL DEFAULT 1 
COMMENT '版本号（乐观锁）';

-- 2. 为现有数据初始化版本号
UPDATE yf_db_inventory SET version = 1 WHERE version IS NULL OR version = 0;

-- 3. 验证字段添加成功
SELECT 
    TABLE_NAME,
    COLUMN_NAME,
    COLUMN_TYPE,
    COLUMN_DEFAULT,
    COLUMN_COMMENT
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'yf_db_inventory'
    AND COLUMN_NAME = 'version';

-- 预期结果：
-- TABLE_NAME: yf_db_inventory
-- COLUMN_NAME: version
-- COLUMN_TYPE: int
-- COLUMN_DEFAULT: 1
-- COLUMN_COMMENT: 版本号（乐观锁）
