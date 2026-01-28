-- 权限体系数据库迁移脚本
-- 添加 Menu 表的 name 和 buttons 字段
-- 添加 Role 表的 name 字段

-- 1. 为 Menu 表添加 name 字段
ALTER TABLE yf_db_menu ADD COLUMN IF NOT EXISTS name VARCHAR(100) COMMENT '菜单名称';

-- 2. 为 Menu 表添加 buttons 字段
ALTER TABLE yf_db_menu ADD COLUMN IF NOT EXISTS buttons TEXT COMMENT '按钮权限JSON';

-- 3. 为 Role 表添加 name 字段
ALTER TABLE yf_db_role ADD COLUMN IF NOT EXISTS name VARCHAR(100) COMMENT '角色名称';

-- 4. 更新现有数据（如果需要）
-- 为现有菜单设置默认名称（可选）
UPDATE yf_db_menu SET name = route WHERE name IS NULL AND route IS NOT NULL;

-- 为现有角色设置默认名称（可选）
UPDATE yf_db_role SET name = code WHERE name IS NULL;
