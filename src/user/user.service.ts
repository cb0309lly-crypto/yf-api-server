import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 注册新用户
  async register(body: any) {
    const exist = await this.userRepository.findOne({
      where: { phone: body.phone },
    });
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

    return {
      access_token,
      user: payload,
    };
  }

  // 校验用户（密码加密比对）
  async validateUser(username: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { authLogin: username },
    });
    if (user && (await bcrypt.compare(password, user.authPassword))) {
      return user;
    }
    return null;
  }

  // 通过 openId 查找用户
  async findByOpenId(openId: string) {
    return this.userRepository.findOne({ where: { openId } });
  }

  // 注册微信用户
  async registerWxUser(data: {
    openId: string;
    nickname?: string;
    avatar?: string;
  }) {
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

    return {
      access_token,
      user: payload,
    };
  }

  // 验证 token 是否有效且属于该用户
  async validateTokenFromRedis(
    userNo: string,
    token: string,
  ): Promise<boolean> {
    try {
      const decoded: any = this.jwtService.verify(token);
      return decoded?.no === userNo || decoded?.sub === userNo;
    } catch (error) {
      console.error('验证Redis token失败:', error);
      return false;
    }
  }

  // 获取用户信息（不再依赖 Redis）
  async getUserFromRedis(userNo: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { no: userNo } });
      if (!user) {
        return null;
      }

      return {
        sub: user.no,
        no: user.no,
        name: user.name,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        description: user.description,
      };
    } catch (error) {
      console.error('从Redis获取用户信息失败:', error);
      return null;
    }
  }

  // 登出（不再维护 Redis token）
  async logout(userNo: string): Promise<void> {
    try {
    } catch (error) {
      console.error('清除Redis token失败:', error);
    }
  }

  // 刷新token
  async refreshToken(userNo: string): Promise<any> {
    try {
      const user = await this.userRepository.findOne({ where: { no: userNo } });
      if (!user) {
        return null;
      }

      const userInfo = {
        sub: user.no,
        no: user.no,
        name: user.name,
        nickname: user.nickname,
        phone: user.phone,
        avatar: user.avatar,
        address: user.address,
        description: user.description,
      };

      // 生成新的token
      const newToken = this.jwtService.sign(userInfo);

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
      const user = await this.userRepository.findOne({ where: { no: userNo } });
      return !!user;
    } catch (error) {
      console.error('获取用户在线状态失败:', error);
      return false;
    }
  }

  // 分页查询用户列表
  async findAllPaged(page = 1, pageSize = 10, keyword?: string) {
    const qb = this.userRepository.createQueryBuilder('user');

    if (keyword) {
      qb.andWhere(
        '(user.nickname LIKE :keyword OR user.phone LIKE :keyword OR user.authLogin LIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    qb.orderBy('user.createdAt', 'DESC');

    const skip = (page - 1) * pageSize;
    const [users, total] = await qb.skip(skip).take(pageSize).getManyAndCount();

    return {
      list: users,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }

  async getAuthUserInfo(userNo: string) {
    const user = await this.userRepository.findOne({
      where: { no: userNo },
      relations: { roles: true },
    });

    if (!user) {
      return null;
    }

    return {
      buttons: [],
      roles: (user.roles || []).map((r) => r.code).filter(Boolean),
      userId: user.no,
      userName:
        user.nickname || user.name || user.authLogin || user.phone || user.no,
    };
  }
}
