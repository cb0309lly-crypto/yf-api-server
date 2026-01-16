import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { SystemManageService } from './system-manage.service';

@ApiTags('系统管理(RBAC)')
@ApiBearerAuth()
@Controller('systemManage')
export class SystemManageController {
  constructor(private readonly systemManageService: SystemManageService) {}

  @Get('getRoleList')
  @ApiOperation({ summary: '获取角色列表' })
  async getRoleList(@Query() query) {
    const { page, pageSize, keyword, status } = query;
    return this.systemManageService.getRoleList(
      Number(page) || 1,
      Number(pageSize) || 10,
      keyword,
      status,
    );
  }

  @Get('getAllRoles')
  @ApiOperation({ summary: '获取所有角色' })
  async getAllRoles() {
    return this.systemManageService.getAllRoles();
  }

  @Get('getMenuList/v2')
  @ApiOperation({ summary: '获取菜单列表' })
  async getMenuList() {
    return this.systemManageService.getMenuListV2();
  }

  @Post('updateUserRole')
  @ApiOperation({ summary: '更新用户角色' })
  async updateUserRole(@Body() body: { userId: string; roleCodes: string[] }) {
    return this.systemManageService.updateUserRoles(
      body.userId,
      body.roleCodes,
    );
  }

  @Get('getUserList')
  @ApiOperation({ summary: '获取用户列表' })
  async getUserList(@Query() query) {
    const { page, pageSize, keyword } = query;
    return this.systemManageService.getUserList(
      Number(page) || 1,
      Number(pageSize) || 10,
      keyword,
    );
  }
}
