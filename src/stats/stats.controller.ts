import { Controller, Get, Post, Body } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';

@ApiTags('统计管理')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  // ========== 管理端接口（需要鉴权）==========

  @Get('card-data')
  @ApiOperation({ summary: '获取看板卡片数据（管理端）' })
  async getCardData() {
    return this.statsService.getCardData();
  }

  @Post('mp-home')
  @ApiOperation({ summary: '更新小程序首页数据（管理端）' })
  async updateMpHomeData(@Body() body: { swiper: any[]; activityImg: string }) {
    return this.statsService.updateMpHomeData(body);
  }

  @Post('mp-tabbar')
  @ApiOperation({ summary: '更新小程序菜单配置（管理端）' })
  async updateMpTabbarData(@Body() body: { list: any[] }) {
    return this.statsService.updateMpTabbarData(body);
  }

  @Get('line-chart')
  @ApiOperation({ summary: '获取折线图数据（管理端）' })
  async getLineChartData() {
    return this.statsService.getLineChartData();
  }

  @Get('pie-chart')
  @ApiOperation({ summary: '获取饼图数据（管理端）' })
  async getPieChartData() {
    return this.statsService.getPieChartData();
  }

  // ========== 小程序端接口（开放访问）==========

  @Public()
  @Get('mp-home')
  @ApiOperation({ summary: '获取小程序首页数据（小程序端-无需登录）' })
  async getMpHomeData() {
    return this.statsService.getMpHomeData();
  }

  @Public()
  @Get('mp-tabbar')
  @ApiOperation({ summary: '获取小程序菜单配置（小程序端-无需登录）' })
  async getMpTabbarData() {
    return this.statsService.getMpTabbarData();
  }
}




