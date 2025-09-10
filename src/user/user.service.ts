import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { JwtService } from '@nestjs/jwt';
import { RedisService } from '../redis/redis.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  // 注册新用户
  async register(body: any) {
    const exist = await this.userRepository.findOne({ where: { phone: body.phone } });
    if (exist) {
      return null;
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    const user = this.userRepository.create({
      name: body.username,
      phone: body.phone,
      authLogin: body.username,
      authPassword: hashedPassword,
      nickname: body.nickname || body.username,
      avatar: body.avatar,
      address: body.address,
      description: body.description,
    });
    return this.userRepository.save(user);
  }

  // 登录时生成token
  async login(body: any) {
    const user = await this.validateUser(body.username, body.password);
    if (!user) {
      return null;
    }
    
    const payload = {
      sub: user.no,
      no: user.no,
      name: user.name,
      nickname: user.nickname,
      phone: user.phone,
      avatar: user.avatar,
      address: user.address,
      description: user.description,
    };
    
    const access_token = this.jwtService.sign(payload);
    
    // 将token缓存到Redis，设置7天过期时间
    await this.redisService.set(`token:${user.no}`, {
      token: access_token,
      user: payload,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7天后
    }, 7 * 24 * 60 * 60); // 7天 = 604800秒
    
    // 将用户信息也缓存到Redis，方便快速获取
    await this.redisService.set(`user:${user.no}`, payload, 7 * 24 * 60 * 60);
    
    return {
      access_token,
      user: payload,
    };
  }

  // 校验用户（密码加密比对）
  async validateUser(username: string, password: string) {
    const user = await this.userRepository.findOne({ where: { authLogin: username } });
    if (user && await bcrypt.compare(password, user.authPassword)) {
      return user;
    }
    return null;
  }

  // 通过 openId 查找用户
  async findByOpenId(openId: string) {
    return this.userRepository.findOne({ where: { openId } });
  }

  // 注册微信用户
  async registerWxUser(data: { openId: string, nickname?: string, avatar?: string }) {
    const user = this.userRepository.create({
      openId: data.openId,
      nickname: data.nickname,
      avatar: data.avatar,
    });
    return this.userRepository.save(user);
  }

  // 微信用户登录生成token
  async loginByOpenId(user: any) {
    const payload = {
      sub: user.no,
      no: user.no,
      nickname: user.nickname,
      avatar: user.avatar,
      openId: user.openId,
    };
    
    const access_token = this.jwtService.sign(payload);
    
    // 将token缓存到Redis
    await this.redisService.set(`token:${user.no}`, {
      token: access_token,
      user: payload,
      loginTime: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    }, 7 * 24 * 60 * 60);
    
    // 缓存用户信息
    await this.redisService.set(`user:${user.no}`, payload, 7 * 24 * 60 * 60);
    
    return {
      access_token,
      user: payload,
    };
  }

  // 验证token是否在Redis中存在且有效
  async validateTokenFromRedis(userNo: string, token: string): Promise<boolean> {
    try {
      const cachedToken = await this.redisService.get(`token:${userNo}`);
      if (!cachedToken) {
        return false;
      }
      
      // 检查token是否匹配
      return cachedToken.token === token;
    } catch (error) {
      console.error('验证Redis token失败:', error);
      return false;
    }
  }

  // 从Redis获取用户信息
  async getUserFromRedis(userNo: string): Promise<any> {
    try {
      return await this.redisService.get(`user:${userNo}`);
    } catch (error) {
      console.error('从Redis获取用户信息失败:', error);
      return null;
    }
  }

  // 登出时清除Redis中的token
  async logout(userNo: string): Promise<void> {
    try {
      await this.redisService.del(`token:${userNo}`);
      await this.redisService.del(`user:${userNo}`);
    } catch (error) {
      console.error('清除Redis token失败:', error);
    }
  }

  // 刷新token
  async refreshToken(userNo: string): Promise<any> {
    try {
      // 从Redis获取当前用户信息
      const userInfo = await this.redisService.get(`user:${userNo}`);
      if (!userInfo) {
        return null;
      }

      // 生成新的token
      const newToken = this.jwtService.sign(userInfo);
      
      // 更新Redis中的token
      await this.redisService.set(`token:${userNo}`, {
        token: newToken,
        user: userInfo,
        loginTime: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      }, 7 * 24 * 60 * 60);

      return {
        access_token: newToken,
        user: userInfo,
      };
    } catch (error) {
      console.error('刷新token失败:', error);
      return null;
    }
  }

  // 获取用户在线状态
  async getUserOnlineStatus(userNo: string): Promise<boolean> {
    try {
      const tokenInfo = await this.redisService.get(`token:${userNo}`);
      return !!tokenInfo;
    } catch (error) {
      console.error('获取用户在线状态失败:', error);
      return false;
    }
  }
}
