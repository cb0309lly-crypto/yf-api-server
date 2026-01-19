import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entity/user';
import { Order } from '../entity/order';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { LoginDto, RegisterDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private readonly jwtService: JwtService,
  ) {}

  // 注册新用户
  async register(body: RegisterDto) {
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
  async login(body: LoginDto) {
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
      name: data.nickname || '微信用户', // 必需的name字段
      phone: `wx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`, // 生成临时手机号
      openId: data.openId,
      nickname: data.nickname || '微信用户',
      avatar: data.avatar,
      authLogin: data.openId, // 使用openId作为登录名
      status: 'created',
    });
    return this.userRepository.save(user);
  }

  // 微信用户登录生成token
  loginByOpenId(user: User) {
    const payload = {
      sub: user.no,
      no: user.no,
      name: user.name || user.nickname || '微信用户',
      nickname: user.nickname || '微信用户',
      avatar: user.avatar,
      openId: user.openId,
      phone: user.phone,
    };

    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: payload,
    };
  }

  // 验证 token 是否有效且属于该用户
  validateTokenFromRedis(userNo: string, token: string): boolean {
    try {
      const decoded = this.jwtService.verify<{ no: string; sub: string }>(
        token,
      );
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
  logout(_userNo: string): void {
    // try {
    // } catch (error) {
    //   console.error('清除Redis token失败:', error);
    // }
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

    // 统计订单数据
    const userNos = users.map((u) => u.no);
    let stats: any[] = [];
    if (userNos.length > 0) {
      stats = await this.orderRepository
        .createQueryBuilder('order')
        .select('order.userNo', 'userNo')
        .addSelect('COUNT(order.no)', 'orderCount')
        .addSelect('SUM(order.orderTotal)', 'totalAmount')
        .where('order.userNo IN (:...userNos)', { userNos })
        .groupBy('order.userNo')
        .getRawMany();
    }

    const list = users.map((user) => {
      const stat = stats.find((s) => s.userNo === user.no);
      return {
        ...user,
        orderCount: stat ? Number(stat.orderCount) : 0,
        totalAmount: stat ? Number(stat.totalAmount) : 0,
      };
    });

    return {
      list,
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

  // 模拟登录
  async mockLogin() {
    let user = await this.userRepository.findOne({
      where: { authLogin: 'mock_user' },
    });
    if (!user) {
      user = this.userRepository.create({
        name: 'MockUser',
        phone: 'mock_123456',
        authLogin: 'mock_user',
        nickname: '体验用户',
        avatar: '',
        status: 'active',
      });
      user = await this.userRepository.save(user);
    }
    return this.loginByOpenId(user);
  }
}
