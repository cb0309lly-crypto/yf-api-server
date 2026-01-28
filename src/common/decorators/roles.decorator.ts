import { SetMetadata } from '@nestjs/common';

/**
 * 角色权限元数据键
 */
export const ROLES_KEY = 'roles';

/**
 * 角色权限装饰器
 * 用于标记需要特定角色才能访问的路由
 *
 * @param roles 角色编码数组
 * @example
 * @Roles('R_ADMIN', 'R_SUPER')
 * @Get('list')
 * async getList() {}
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
