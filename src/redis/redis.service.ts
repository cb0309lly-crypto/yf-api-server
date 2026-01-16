import { Injectable, Inject } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly client: RedisClientType,
  ) {}

  async set(key: string, value: any, ttl?: number): Promise<void> {
    const data = JSON.stringify(value);
    await this.client.set(key, data);
    if (ttl) {
      await this.client.expire(key, ttl);
    }
  }

  async get(key: string): Promise<any> {
    const data = await this.client.get(key);
    return data ? JSON.parse(data) : null;
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  async expire(key: string, ttl: number): Promise<void> {
    await this.client.expire(key, ttl);
  }

  async ttl(key: string): Promise<number> {
    return await this.client.ttl(key);
  }

  // 哈希操作
  async hset(key: string, field: string, value: any): Promise<void> {
    const data = JSON.stringify(value);
    await this.client.hSet(key, field, data);
  }

  async hget(key: string, field: string): Promise<any> {
    const data = await this.client.hGet(key, field);
    return data ? JSON.parse(data) : null;
  }

  async hgetall(key: string): Promise<Record<string, any>> {
    const data = await this.client.hGetAll(key);
    const result: Record<string, any> = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        result[field] = JSON.parse(value);
      } catch {
        result[field] = value;
      }
    }
    return result;
  }

  async hdel(key: string, field: string): Promise<void> {
    await this.client.hDel(key, field);
  }

  // 列表操作
  async lpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map((v) => JSON.stringify(v));
    return await this.client.lPush(key, serializedValues);
  }

  async rpush(key: string, ...values: any[]): Promise<number> {
    const serializedValues = values.map((v) => JSON.stringify(v));
    return await this.client.rPush(key, serializedValues);
  }

  async lpop(key: string): Promise<any> {
    const data = await this.client.lPop(key);
    return data ? JSON.parse(data) : null;
  }

  async rpop(key: string): Promise<any> {
    const data = await this.client.rPop(key);
    return data ? JSON.parse(data) : null;
  }

  async lrange(key: string, start: number, stop: number): Promise<any[]> {
    const data = await this.client.lRange(key, start, stop);
    return data.map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
  }

  async llen(key: string): Promise<number> {
    return await this.client.lLen(key);
  }

  // 集合操作
  async sadd(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map((m) => JSON.stringify(m));
    return await this.client.sAdd(key, serializedMembers);
  }

  async srem(key: string, ...members: any[]): Promise<number> {
    const serializedMembers = members.map((m) => JSON.stringify(m));
    return await this.client.sRem(key, serializedMembers);
  }

  async smembers(key: string): Promise<any[]> {
    const data = await this.client.sMembers(key);
    return data.map((item) => {
      try {
        return JSON.parse(item);
      } catch {
        return item;
      }
    });
  }

  async sismember(key: string, member: any): Promise<boolean> {
    const serializedMember = JSON.stringify(member);
    const result = await this.client.sIsMember(key, serializedMember);
    return result === 1;
  }

  // 原子操作
  async incr(key: string): Promise<number> {
    return await this.client.incr(key);
  }

  async decr(key: string): Promise<number> {
    return await this.client.decr(key);
  }

  async incrby(key: string, increment: number): Promise<number> {
    return await this.client.incrBy(key, increment);
  }

  async decrby(key: string, decrement: number): Promise<number> {
    return await this.client.decrBy(key, decrement);
  }

  // 发布订阅
  async publish(channel: string, message: any): Promise<number> {
    const data = JSON.stringify(message);
    return await this.client.publish(channel, data);
  }

  async subscribe(
    channel: string,
    callback: (message: any) => void,
  ): Promise<void> {
    await this.client.subscribe(channel, (message) => {
      try {
        const parsedMessage = JSON.parse(message);
        callback(parsedMessage);
      } catch {
        callback(message);
      }
    });
  }

  async unsubscribe(channel: string): Promise<void> {
    await this.client.unsubscribe(channel);
  }

  // 模式匹配
  async keys(pattern: string): Promise<string[]> {
    return await this.client.keys(pattern);
  }

  // 获取原始客户端（用于高级操作）
  getClient(): RedisClientType {
    return this.client;
  }
}
