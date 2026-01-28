import { SetMetadata } from '@nestjs/common';

/**
 * 按钮权限元数据键
 */
export const PERMISSIONS_KEY = 'permissions';

/**
 * 按钮权限装饰器
 * 用于标记需要特定按钮权限才能访问的路由
 *
 * @param permissions 权限编码数组
 * @example
 * @Permissions('product:delete', 'product:edit')
 * @Delete(':id')
 * async delete() {}
 */
export const Permissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
