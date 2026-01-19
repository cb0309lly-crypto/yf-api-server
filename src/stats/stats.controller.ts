import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('统计管理')
@ApiBearerAuth()
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Get('card-data')
  @ApiOperation({ summary: '获取看板卡片数据' })
  async getCardData() {
    return this.statsService.getCardData();
  }

  @Get('mp-home')
  @ApiOperation({ summary: '获取小程序首页数据' })
  async getMpHomeData() {
    return this.statsService.getMpHomeData();
  }

  @Get('line-chart')
  @ApiOperation({ summary: '获取折线图数据' })
  async getLineChartData() {
    return this.statsService.getLineChartData();
  }

  @Get('pie-chart')
  @ApiOperation({ summary: '获取饼图数据' })
  async getPieChartData() {
    return this.statsService.getPieChartData();
  }
}
