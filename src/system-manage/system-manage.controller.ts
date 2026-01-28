import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemManageService } from './system-manage.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { PermissionsGuard } from '../common/guards/permissions.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { Permissions } from '../common/decorators/permissions.decorator';
import {
  CreateRoleDto,
  UpdateRoleDto,
  UpdateRoleMenusDto,
  UpdateUserRolesDto,
  CreateMenuDto,
  UpdateMenuDto,
  RoleSearchParamsDto,
} from './dto';

@ApiTags('系统管理(RBAC)')
@ApiBearerAuth()
@Controller('systemManage')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class SystemManageController {
  constructor(private readonly systemManageService: SystemManageService) {}

  @Get('getRoleList')
  @ApiOperation({ summary: '获取角色列表' })
  async getRoleList(@Query() query: RoleSearchParamsDto) {
    const { current, size, keyword, status } = query;
    return this.systemManageService.getRoleList(
      Number(current) || 1,
      Number(size) || 10,
      keyword,
      status,
    );
  }

  @Get('getAllRoles')
  @ApiOperation({ summary: '获取所有角色' })
  async getAllRoles() {
    return this.systemManageService.getAllRoles();
  }

  @Post('role')
  @ApiOperation({ summary: '创建角色' })
  @Roles('R_SUPER', 'R_ADMIN')
  @Permissions('role:add')
  async createRole(@Body() dto: CreateRoleDto) {
    return this.systemManageService.createRole(dto);
  }

  @Put('role/:id')
  @ApiOperation({ summary: '更新角色' })
  @Roles('R_SUPER', 'R_ADMIN')
  @Permissions('role:edit')
  async updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.systemManageService.updateRole(id, dto);
  }

  @Delete('role/:id')
  @ApiOperation({ summary: '删除角色' })
  @Roles('R_SUPER')
  @Permissions('role:delete')
  async deleteRole(@Param('id') id: string) {
    await this.systemManageService.deleteRole(id);
    return { message: '删除成功' };
  }

  @Get('role/:id/menus')
  @ApiOperation({ summary: '获取角色的菜单权限' })
  async getRoleMenus(@Param('id') id: string) {
    return this.systemManageService.getRoleMenus(id);
  }

  @Put('role/:id/menus')
  @ApiOperation({ summary: '更新角色的菜单权限' })
  @Roles('R_SUPER', 'R_ADMIN')
  @Permissions('role:menu')
  async updateRoleMenus(
    @Param('id') id: string,
    @Body() dto: UpdateRoleMenusDto,
  ) {
    await this.systemManageService.updateRoleMenus(id, dto.menuIds);
    return { message: '更新成功' };
  }

  @Get('role/:id/users')
  @ApiOperation({ summary: '获取角色下的用户' })
  @Roles('R_SUPER', 'R_ADMIN')
  async getRoleUsers(@Param('id') id: string) {
    return this.systemManageService.getRoleUsers(id);
  }

  @Get('getMenuList')
  @ApiOperation({ summary: '获取菜单列表' })
  async getMenuList() {
    return this.systemManageService.getMenuList();
  }

  @Get('getMenuList/v2')
  @ApiOperation({ summary: '获取菜单列表V2' })
  async getMenuListV2() {
    return this.systemManageService.getMenuListV2();
  }

  @Get('getMenuTree')
  @ApiOperation({ summary: '获取菜单树' })
  async getMenuTree() {
    return this.systemManageService.getMenuTree();
  }

  @Post('menu')
  @ApiOperation({ summary: '创建菜单' })
  @Roles('R_SUPER')
  @Permissions('menu:add')
  async createMenu(@Body() dto: CreateMenuDto) {
    return this.systemManageService.createMenu(dto);
  }

  @Put('menu/:id')
  @ApiOperation({ summary: '更新菜单' })
  @Roles('R_SUPER')
  @Permissions('menu:edit')
  async updateMenu(@Param('id') id: string, @Body() dto: UpdateMenuDto) {
    return this.systemManageService.updateMenu(id, dto);
  }

  @Delete('menu/:id')
  @ApiOperation({ summary: '删除菜单' })
  @Roles('R_SUPER')
  @Permissions('menu:delete')
  async deleteMenu(@Param('id') id: string) {
    await this.systemManageService.deleteMenu(id);
    return { message: '删除成功' };
  }

  @Put('user/:id/roles')
  @ApiOperation({ summary: '更新用户角色' })
  @Roles('R_SUPER', 'R_ADMIN')
  @Permissions('user:assign')
  async updateUserRoles(
    @Param('id') id: string,
    @Body() dto: UpdateUserRolesDto,
  ) {
    await this.systemManageService.updateUserRoles(id, dto.roleCodes);
    return { message: '更新成功' };
  }

  @Post('updateUserRole')
  @ApiOperation({ summary: '更新用户角色（兼容旧接口）' })
  async updateUserRole(@Body() body: { userId: string; roleCodes: string[] }) {
    return this.systemManageService.updateUserRoles(
      body.userId,
      body.roleCodes,
    );
  }

  @Get('getUserList')
  @ApiOperation({ summary: '获取用户列表' })
  @Roles('R_SUPER', 'R_ADMIN')
  async getUserList(@Query() query) {
    const { current, size, page, pageSize, keyword } = query;
    return this.systemManageService.getUserList(
      Number(current || page) || 1,
      Number(size || pageSize) || 10,
      keyword,
    );
  }
}
