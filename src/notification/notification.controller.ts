import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { NotificationService } from './notification.service';

@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  create(@Body() body) {
    return this.notificationService.create(body);
  }

  @Get()
  findAll(@Query() query) {
    return this.notificationService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.notificationService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body) {
    return this.notificationService.update(id, body);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.notificationService.remove(id);
  }

  @Get('user/:userId')
  getUserNotifications(@Param('userId') userId: string, @Query() query) {
    return this.notificationService.getUserNotifications(userId, query);
  }

  @Post('mark-read')
  markAsRead(@Body() body) {
    return this.notificationService.markAsRead(body);
  }

  @Post('mark-all-read')
  markAllAsRead(@Body() body) {
    return this.notificationService.markAllAsRead(body.userNo);
  }

  @Get('user/:userId/unread-count')
  getUnreadCount(@Param('userId') userId: string) {
    return this.notificationService.getUnreadCount(userId);
  }

  @Post('send')
  sendNotification(@Body() body) {
    return this.notificationService.sendNotification(body);
  }
} 