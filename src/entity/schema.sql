-- 零售商城系统数据库结构

CREATE TABLE `yf_db_company` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  `address` VARCHAR(255),
  `tax_id` VARCHAR(255),
  `phone_number` VARCHAR(255),
  `email` VARCHAR(255),
  `creator` VARCHAR(255),
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `yf_db_logistics` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `sender_no` CHAR(36),
  `receiver_no` CHAR(36),
  `order_no` CHAR(36),
  `current_status` ENUM('已下单','已发货','配送中','已签收','问题单') DEFAULT '已下单',
  `receive_time` TIMESTAMP NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `yf_db_receiver` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `address` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255),
  `group_by` INT NOT NULL,
  `description` VARCHAR(255),
  `user_no` CHAR(36),
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `yf_db_user` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `phone` VARCHAR(255) NOT NULL,
  `level` INT DEFAULT 0,
  `gender` ENUM('FEMALE','MALE','UNKNOWN') DEFAULT 'UNKNOWN',
  `id_card` VARCHAR(255),
  `avatar` VARCHAR(255),
  `address` VARCHAR(255),
  `description` VARCHAR(255),
  `nickname` VARCHAR(255),
  `auth_login` VARCHAR(255),
  `auth_password` VARCHAR(255),
  `open_id` VARCHAR(255),
  `status` ENUM('created','online','offline','active','losed') DEFAULT 'created',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `yf_db_category` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  `icon` VARCHAR(255),
  `status` ENUM('active', 'inactive') DEFAULT 'active',
  `parent_id` CHAR(36),
  `sort` INT DEFAULT 0,
  `category_level` INT DEFAULT 1,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `yf_db_product` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` VARCHAR(255),
  `price` DECIMAL(10,2) DEFAULT 0.0,
  `image_url` VARCHAR(255),
  `status` ENUM('已上架','已下架','缺货','有货','售罄') DEFAULT '已上架',
  `specs` VARCHAR(255),
  `unit` VARCHAR(255),
  `tag` VARCHAR(255),
  `company_no` CHAR(36),
  `category_no` CHAR(36),
  `order_no` CHAR(36),
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

CREATE TABLE `yf_db_inventory` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `product_no` CHAR(36) NOT NULL,
  `quantity` INT DEFAULT 0,
  `reserved_quantity` INT DEFAULT 0,
  `available_quantity` INT DEFAULT 0,
  `min_stock_level` INT DEFAULT 10,
  `max_stock_level` INT DEFAULT 100,
  `status` ENUM('in_stock', 'low_stock', 'out_of_stock', 'reserved') DEFAULT 'in_stock',
  `warehouse_location` VARCHAR(255),
  `last_restock_date` DATETIME,
  `next_restock_date` DATETIME,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  FOREIGN KEY (`product_no`) REFERENCES `yf_db_product`(`no`)
);

CREATE TABLE `yf_db_cart` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `user_no` CHAR(36) NOT NULL,
  `product_no` CHAR(36) NOT NULL,
  `quantity` INT DEFAULT 1,
  `unit_price` DECIMAL(10,2) DEFAULT 0.0,
  `total_price` DECIMAL(10,2) DEFAULT 0.0,
  `status` ENUM('active', 'removed', 'purchased') DEFAULT 'active',
  `selected` BOOLEAN DEFAULT TRUE,
  `added_at` DATETIME NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  FOREIGN KEY (`user_no`) REFERENCES `yf_db_user`(`no`),
  FOREIGN KEY (`product_no`) REFERENCES `yf_db_product`(`no`)
);

CREATE TABLE `yf_db_order` (
  `no` CHAR(36) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `user_no` CHAR(36) NOT NULL,
  `ship_address` VARCHAR(255),
  `order_total` DECIMAL(10,2),
  `order_status` ENUM('已下单','未付款','已付款','已取消','已配送','异常单') DEFAULT '已下单',
  `description` VARCHAR(255),
  `remark` VARCHAR(255),
  `operator_no` CHAR(36),
  `customer_no` CHAR(36),
  `product_no` CHAR(36),
  `material_no` CHAR(36),
  `logistics_no` CHAR(36),
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL
);

-- 其余表结构可参考前述SQL，如需全部表请告知 