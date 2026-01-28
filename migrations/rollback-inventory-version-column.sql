-- 回滚库存表版本号字段
-- 执行时间: 2026-01-21
-- 用途: 如果需要回滚版本号字段的添加

-- 警告：执行此脚本将删除 version 字段，请确保已备份数据

-- 1. 删除 version 字段
ALTER TABLE yf_db_inventory DROP COLUMN version;

-- 2. 验证字段删除成功
SELECT 
    TABLE_NAME,
    COLUMN_NAME
FROM 
    INFORMATION_SCHEMA.COLUMNS
WHERE 
    TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'yf_db_inventory'
    AND COLUMN_NAME = 'version';

-- 预期结果：空结果集（字段已删除）
