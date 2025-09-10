import { Injectable } from '@nestjs/common';
import { RedisService } from './redis.service';

/**
 * Redis使用示例
 * 展示如何在其他服务中使用Redis功能
 */
@Injectable()
export class RedisUsageExample {
  constructor(private readonly redisService: RedisService) {}

  // 基本操作示例
  async basicOperations() {
    // 设置和获取字符串
    await this.redisService.set('user:1:name', '张三', 3600); // 1小时过期
    const userName = await this.redisService.get('user:1:name');
    console.log('用户名:', userName);

    // 设置和获取对象
    const userInfo = { id: 1, name: '张三', email: 'zhangsan@example.com' };
    await this.redisService.set('user:1:info', userInfo, 3600);
    const userInfoFromCache = await this.redisService.get('user:1:info');
    console.log('用户信息:', userInfoFromCache);

    // 哈希操作
    await this.redisService.hset('user:1:profile', 'age', 25);
    await this.redisService.hset('user:1:profile', 'city', '北京');
    const profile = await this.redisService.hgetall('user:1:profile');
    console.log('用户档案:', profile);

    // 列表操作
    await this.redisService.lpush('user:1:orders', 'order1', 'order2', 'order3');
    const orders = await this.redisService.lrange('user:1:orders', 0, -1);
    console.log('用户订单:', orders);

    // 集合操作
    await this.redisService.sadd('user:1:tags', 'vip', 'premium', 'active');
    const tags = await this.redisService.smembers('user:1:tags');
    console.log('用户标签:', tags);
  }

  // 实际业务场景示例
  async businessScenarios() {
    // 1. 用户会话管理
    await this.redisService.set('session:abc123', {
      userId: 1,
      loginTime: Date.now(),
      permissions: ['read', 'write']
    }, 1800); // 30分钟过期

    // 2. 商品库存缓存
    await this.redisService.set('inventory:product:1', {
      stock: 100,
      reserved: 5,
      available: 95
    }, 60); // 1分钟过期

    // 3. 购物车管理
    await this.redisService.hset('cart:user:1', 'product:1', 2); // 商品1，数量2
    await this.redisService.hset('cart:user:1', 'product:2', 1); // 商品2，数量1
    await this.redisService.expire('cart:user:1', 3600); // 1小时过期

    // 4. 限流控制
    const key = 'rate_limit:user:1:api';
    const current = await this.redisService.incr(key);
    if (current === 1) {
      await this.redisService.expire(key, 60); // 1分钟窗口
    }
    if (current > 100) {
      throw new Error('API调用频率超限');
    }

    // 5. 发布订阅
    await this.redisService.publish('notifications', {
      type: 'order_created',
      userId: 1,
      message: '您的订单已创建'
    });
  }
}
