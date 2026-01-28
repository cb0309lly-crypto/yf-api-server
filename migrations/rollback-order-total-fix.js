/**
 * 回滚订单金额字段类型修复迁移
 * 
 * 使用方法：
 * node migrations/rollback-order-total-fix.js
 */

const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.development' });

async function rollbackMigration() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
  });

  try {
    console.log('连接数据库...');
    await client.connect();
    console.log('数据库连接成功');

    // 读取回滚脚本
    const sqlPath = path.join(__dirname, 'rollback-order-total-decimal.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    console.log('执行回滚脚本...');
    await client.query(sql);
    console.log('✓ 回滚执行成功！');

    // 验证字段类型
    console.log('\n验证字段类型...');
    const result = await client.query(`
      SELECT 
        column_name, 
        data_type
      FROM information_schema.columns 
      WHERE table_name = 'yf_db_order' 
        AND column_name = 'order_total'
    `);

    if (result.rows.length > 0) {
      const col = result.rows[0];
      console.log('字段信息：');
      console.log(`  - 字段名: ${col.column_name}`);
      console.log(`  - 数据类型: ${col.data_type}`);
      
      if (col.data_type === 'integer') {
        console.log('\n✓ 回滚验证通过！字段已恢复为 integer 类型');
      } else {
        console.log('\n✗ 回滚验证失败，请检查结果');
      }
    }

  } catch (error) {
    console.error('✗ 回滚失败：', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n数据库连接已关闭');
  }
}

rollbackMigration();
