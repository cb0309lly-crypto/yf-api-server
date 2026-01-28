import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../decorators/roles.decorator';

/**
 * 角色权限守卫
 * 检查用户是否拥有访问路由所需的角色
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 获取路由所需的角色
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 如果没有配置角色要求，则允许访问
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // 获取请求中的用户信息
    const { user } = context.switchToHttp().getRequest();

    // 用户未登录或没有角色信息
    if (!user || !user.roles) {
      return false;
    }

    // 超级管理员拥有所有权限
    if (user.roles.includes('R_SUPER')) {
      return true;
    }

    // 检查用户是否拥有所需角色中的任意一个
    return requiredRoles.some((role) => user.roles?.includes(role));
  }
}
