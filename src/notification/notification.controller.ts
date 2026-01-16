import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import {
  CreateNotificationDto,
  NotificationQueryDto,
  NotificationIdDto,
} from './dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('通知管理')
@ApiBearerAuth()
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: '创建通知' })
  create(@Body() body: CreateNotificationDto) {
    return this.notificationService.create(body);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取通知列表' })
  findAll(@Query() query: NotificationQueryDto) {
    return this.notificationService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取通知详情' })
  findOne(@Param() params: NotificationIdDto) {
    return this.notificationService.findOne(params.id);
  }

  @Put(':id')
  @ApiOperation({ summary: '更新通知' })
  update(@Param() params: NotificationIdDto, @Body() body: any) {
    return this.notificationService.update(params.id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除通知' })
  remove(@Param() params: NotificationIdDto) {
    return this.notificationService.remove(params.id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: '获取用户通知' })
  getUserNotifications(@Param('userId') userId: string, @Query() query: any) {
    return this.notificationService.getUserNotifications(userId, query);
  }

  @Post('mark-read')
  @ApiOperation({ summary: '标记通知为已读' })
  markAsRead(@Body() body: any) {
    return this.notificationService.markAsRead(body);
  }

  @Post('mark-all-read')
  @ApiOperation({ summary: '标记所有通知为已读' })
  markAllAsRead(@Body() body: { userNo: string }) {
    return this.notificationService.markAllAsRead(body.userNo);
  }

  @Get('user/:userId/unread-count')
  @ApiOperation({ summary: '获取未读通知数量' })
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Post('send')
  @ApiOperation({ summary: '发送通知' })
  sendNotification(@Body() body: any) {
    return this.notificationService.sendNotification(body);
  }
}
