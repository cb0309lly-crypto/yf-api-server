import { Injectable, OnModuleInit, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role, Menu, User } from '../entity';
import {
  CreateRoleDto,
  UpdateRoleDto,
  CreateMenuDto,
  UpdateMenuDto,
} from './dto';

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

  // ==================== 角色管理方法 ====================

  /**
   * 创建角色
   */
  async createRole(dto: CreateRoleDto): Promise<Role> {
    // 检查角色编码是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { code: dto.code },
    });
    if (existingRole) {
      throw new BadRequestException(`角色编码 ${dto.code} 已存在`);
    }

    const role = this.roleRepository.create({
      code: dto.code,
      name: dto.name,
      description: dto.description,
      status: dto.status || '1',
    });

    return this.roleRepository.save(role);
  }

  /**
   * 更新角色
   */
  async updateRole(id: string, dto: UpdateRoleDto): Promise<Role> {
    const role = await this.roleRepository.findOne({ where: { no: id } });
    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 检查是否是系统预设角色
    const systemRoles = ['R_SUPER', 'R_ADMIN', 'R_USER'];
    if (systemRoles.includes(role.code)) {
      // 系统角色只允许修改描述
      if (dto.name || dto.status) {
        throw new BadRequestException('系统预设角色不允许修改名称和状态');
      }
    }

    // 更新字段
    if (dto.name !== undefined) role.name = dto.name;
    if (dto.description !== undefined) role.description = dto.description;
    if (dto.status !== undefined) role.status = dto.status;

    return this.roleRepository.save(role);
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { no: id },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 检查是否是系统预设角色
    const systemRoles = ['R_SUPER', 'R_ADMIN', 'R_USER'];
    if (systemRoles.includes(role.code)) {
      throw new BadRequestException('系统预设角色不允许删除');
    }

    // 检查是否有用户关联
    const userCount = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.roles', 'role')
      .where('role.no = :roleNo', { roleNo: id })
      .getCount();

    if (userCount > 0) {
      throw new BadRequestException(
        `该角色下还有 ${userCount} 个用户，不允许删除`,
      );
    }

    await this.roleRepository.remove(role);
  }

  /**
   * 获取角色的菜单权限
   */
  async getRoleMenus(roleId: string): Promise<{ menuIds: string[] }> {
    const role = await this.roleRepository.findOne({
      where: { no: roleId },
      relations: ['menus'],
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const menuIds = role.menus ? role.menus.map((menu) => menu.no) : [];
    return { menuIds };
  }

  /**
   * 更新角色的菜单权限
   */
  async updateRoleMenus(roleId: string, menuIds: string[]): Promise<void> {
    const role = await this.roleRepository.findOne({
      where: { no: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    // 验证菜单ID有效性
    const menus = await this.menuRepository.find({
      where: { no: In(menuIds) },
    });

    if (menus.length !== menuIds.length) {
      throw new BadRequestException('部分菜单ID无效');
    }

    role.menus = menus;
    await this.roleRepository.save(role);
  }

  /**
   * 获取角色下的用户
   */
  async getRoleUsers(roleId: string): Promise<User[]> {
    const role = await this.roleRepository.findOne({
      where: { no: roleId },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    const users = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.roles', 'role')
      .where('role.no = :roleNo', { roleNo: roleId })
      .getMany();

    return users;
  }

  // ==================== 菜单管理方法 ====================

  /**
   * 创建菜单
   */
  async createMenu(dto: CreateMenuDto): Promise<Menu> {
    // 如果有父菜单，验证父菜单存在
    if (dto.parentId) {
      const parentMenu = await this.menuRepository.findOne({
        where: { no: dto.parentId },
      });
      if (!parentMenu) {
        throw new NotFoundException('父菜单不存在');
      }
    }

    const menu = this.menuRepository.create({
      parentId: dto.parentId,
      name: dto.name,
      route: dto.route,
      icon: dto.icon,
      order: dto.order || 0,
      i18nKey: dto.i18nKey,
      buttons: dto.buttons,
      status: dto.status || '1',
    });

    return this.menuRepository.save(menu);
  }

  /**
   * 更新菜单
   */
  async updateMenu(id: string, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findOne({ where: { no: id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 如果修改父菜单，验证父菜单存在且不是自己
    if (dto.parentId !== undefined) {
      if (dto.parentId === id) {
        throw new BadRequestException('父菜单不能是自己');
      }
      if (dto.parentId) {
        const parentMenu = await this.menuRepository.findOne({
          where: { no: dto.parentId },
        });
        if (!parentMenu) {
          throw new NotFoundException('父菜单不存在');
        }
      }
    }

    // 更新字段
    if (dto.parentId !== undefined) menu.parentId = dto.parentId;
    if (dto.name !== undefined) menu.name = dto.name;
    if (dto.route !== undefined) menu.route = dto.route;
    if (dto.icon !== undefined) menu.icon = dto.icon;
    if (dto.order !== undefined) menu.order = dto.order;
    if (dto.i18nKey !== undefined) menu.i18nKey = dto.i18nKey;
    if (dto.buttons !== undefined) menu.buttons = dto.buttons;
    if (dto.status !== undefined) menu.status = dto.status;

    return this.menuRepository.save(menu);
  }

  /**
   * 删除菜单
   */
  async deleteMenu(id: string): Promise<void> {
    const menu = await this.menuRepository.findOne({ where: { no: id } });
    if (!menu) {
      throw new NotFoundException('菜单不存在');
    }

    // 检查是否有子菜单
    const childCount = await this.menuRepository.count({
      where: { parentId: id },
    });
    if (childCount > 0) {
      throw new BadRequestException('该菜单下还有子菜单，不允许删除');
    }

    // 检查是否有角色关联
    const roleCount = await this.roleRepository
      .createQueryBuilder('role')
      .leftJoin('role.menus', 'menu')
      .where('menu.no = :menuNo', { menuNo: id })
      .getCount();

    if (roleCount > 0) {
      throw new BadRequestException(
        `该菜单被 ${roleCount} 个角色使用，不允许删除`,
      );
    }

    await this.menuRepository.remove(menu);
  }

  /**
   * 获取菜单树
   */
  async getMenuTree(): Promise<any[]> {
    const menus = await this.menuRepository.find({ order: { order: 'ASC' } });

    // 构建树形结构
    const buildTree = (parentId: string | null = null): any[] => {
      return menus
        .filter((menu) => menu.parentId === parentId)
        .map((menu) => ({
          id: menu.no,
          label: menu.name || menu.route,
          pId: menu.parentId,
          children: buildTree(menu.no),
        }));
    };

    return buildTree(null);
  }
}
