import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, Menu, User } from '../entity';

@Injectable()
export class SystemManageService implements OnModuleInit {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Menu)
    private menuRepository: Repository<Menu>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedData();
  }

  async seedData() {
    const roleCount = await this.roleRepository.count();
    if (roleCount === 0) {
      const superAdmin = this.roleRepository.create({
        name: '超级管理员',
        code: 'R_SUPER',
        description: '系统最高权限',
      });
      const admin = this.roleRepository.create({
        name: '管理员',
        code: 'R_ADMIN',
        description: '普通管理权限',
      });
      const user = this.roleRepository.create({
        name: '普通用户',
        code: 'R_USER',
        description: '基础权限',
      });
      await this.roleRepository.save([superAdmin, admin, user]);
      console.log('Seeded roles');
    }

    const menuCount = await this.menuRepository.count();
    if (menuCount === 0) {
      // Create some basic menus matching the frontend routes
      // This is a simplified seed. In production, this should be more comprehensive.
      const menus = [
        {
          name: '仪表盘',
          route: 'home',
          order: 1,
          icon: 'mdi:monitor-dashboard',
        },
        {
          name: '商品管理',
          route: 'function_product',
          order: 2,
          icon: 'icon-park-outline:commodity',
        },
        {
          name: '订单管理',
          route: 'function_order',
          order: 3,
          icon: 'icon-park-outline:transaction-order',
        },
        {
          name: '系统管理',
          route: 'function_system',
          order: 4,
          icon: 'icon-park-outline:system',
        },
      ];

      const savedMenus: Menu[] = [];
      for (const m of menus) {
        const menu = this.menuRepository.create(m);
        savedMenus.push(await this.menuRepository.save(menu));
      }

      // Assign all menus to Super Admin
      const superAdmin = await this.roleRepository.findOne({
        where: { code: 'R_SUPER' },
      });
      if (superAdmin) {
        superAdmin.menus = savedMenus;
        await this.roleRepository.save(superAdmin);
      }
    }
  }

  async getRoleList(
    page = 1,
    pageSize = 10,
    keyword?: string,
    status?: string,
  ) {
    const qb = this.roleRepository.createQueryBuilder('role');
    if (keyword) {
      qb.andWhere('(role.name LIKE :keyword OR role.code LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }
    if (status) {
      qb.andWhere('role.status = :status', { status });
    }

    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();

    return {
      list,
      total,
      page,
      pageSize,
    };
  }

  async getAllRoles() {
    return this.roleRepository.find({ where: { status: '1' } });
  }

  async getMenuList() {
    // Return all menus for now. In a real app, filter by user roles.
    const menus = await this.menuRepository.find({ order: { order: 'ASC' } });

    // Transform to tree if needed, or frontend handles it.
    // Frontend expects `list` in response usually.
    return { list: menus };
  }

  // Simplified version returning static routes for the frontend "dynamic routing"
  // The frontend might expect specific structure for `getMenuList/v2`
  async getMenuListV2() {
    // This matches the frontend's mock structure often used in Soybean Admin
    const menus = await this.menuRepository.find({ order: { order: 'ASC' } });
    return { list: menus };
  }

  async updateUserRoles(userId: string, roleCodes: string[]) {
    const user = await this.userRepository.findOne({ where: { no: userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const roles = await this.roleRepository.find({
      where: { code: In(roleCodes) },
    });
    user.roles = roles;
    return this.userRepository.save(user);
  }

  async getUserList(page = 1, pageSize = 10, keyword?: string) {
    const qb = this.userRepository.createQueryBuilder('user');
    if (keyword) {
      qb.andWhere('(user.phone LIKE :keyword OR user.nickname LIKE :keyword)', {
        keyword: `%${keyword}%`,
      });
    }

    qb.leftJoinAndSelect('user.roles', 'roles');
    qb.orderBy('user.createdAt', 'DESC');
    qb.skip((page - 1) * pageSize).take(pageSize);

    const [list, total] = await qb.getManyAndCount();

    const records = list.map((user) => ({
      id: user.no,
      userName: user.phone || 'Unknown', // using phone as username for now
      nickName: user.nickname,
      userPhone: user.phone,
      userEmail: '', // Not in entity
      userGender: '1', // Default or map from user.gender
      status: user.status,
      userRoles: user.roles ? user.roles.map((r) => r.code) : [],
      createTime: user.createdAt,
      updateTime: user.updatedAt,
      createBy: 'system',
      updateBy: 'system',
    }));

    return {
      records,
      total,
      current: page,
      size: pageSize,
    };
  }
}
