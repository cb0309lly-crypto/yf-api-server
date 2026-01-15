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
}

