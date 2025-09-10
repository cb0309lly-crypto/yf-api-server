import { Module, Global } from '@nestjs/common';
import { createClient } from 'redis';
import { RedisService } from './redis.service';
import { redisConfig } from './redis.config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      useFactory: async () => {
        const client = createClient({
          socket: {
            host: redisConfig.host,
            port: redisConfig.port,
          },
          username: redisConfig.username,
          password: redisConfig.password,
          database: redisConfig.db,
        });
        
        client.on('error', (err) => console.error('Redis Client Error', err));
        client.on('connect', () => console.log('Redis Client Connected'));
        
        await client.connect();
        return client;
      },
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
