-- 回滚订单总金额字段类型修改
-- 将 order_total 从 decimal(10,2) 改回 integer

ALTER TABLE yf_db_order 
ALTER COLUMN order_total TYPE INTEGER USING order_total::INTEGER;

-- 设置默认值
ALTER TABLE yf_db_order 
ALTER COLUMN order_total SET DEFAULT 0;

-- 移除注释
COMMENT ON COLUMN yf_db_order.order_total IS NULL;
