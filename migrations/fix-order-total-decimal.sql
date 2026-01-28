-- 修改订单总金额字段类型为 decimal
-- 将 order_total 从 integer 改为 decimal(10,2)

ALTER TABLE yf_db_order 
ALTER COLUMN order_total TYPE DECIMAL(10,2) USING order_total::DECIMAL(10,2);

-- 设置默认值
ALTER TABLE yf_db_order 
ALTER COLUMN order_total SET DEFAULT 0.0;

-- 添加注释
COMMENT ON COLUMN yf_db_order.order_total IS '订单总金额，保留2位小数';
