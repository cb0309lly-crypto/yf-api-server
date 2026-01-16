import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Notification,
  NotificationStatus,
  NotificationType,
} from '../entity/notification';

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(Notification)
    private notificationRepository: Repository<Notification>,
  ) {}

  create(body) {
    const notification = this.notificationRepository.create(body);
    return this.notificationRepository.save(notification);
  }

  findAll(query) {
    const { page = 1, limit = 10, type, status, userNo } = query;
    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    if (userNo) {
      queryBuilder.andWhere('notification.userNo = :userNo', { userNo });
    }

    queryBuilder
      .leftJoinAndSelect('notification.user', 'user')
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  findOne(id: string) {
    return this.notificationRepository.findOne({
      where: { no: id },
      relations: ['user'],
    });
  }

  update(id: string, body) {
    return this.notificationRepository.update(id, body);
  }

  remove(id: string) {
    return this.notificationRepository.delete(id);
  }

  getUserNotifications(userId: string, query) {
    const { page = 1, limit = 10, status, type } = query;
    const queryBuilder =
      this.notificationRepository.createQueryBuilder('notification');

    queryBuilder.andWhere('notification.userNo = :userId', { userId });

    if (status) {
      queryBuilder.andWhere('notification.status = :status', { status });
    }

    if (type) {
      queryBuilder.andWhere('notification.type = :type', { type });
    }

    queryBuilder
      .orderBy('notification.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    return queryBuilder.getMany();
  }

  markAsRead(body) {
    const { id } = body;
    return this.notificationRepository.update(id, {
      status: NotificationStatus.READ,
      readAt: new Date(),
    });
  }

  markAllAsRead(userNo: string) {
    return this.notificationRepository.update(
      { userNo, status: NotificationStatus.UNREAD },
      {
        status: NotificationStatus.READ,
        readAt: new Date(),
      },
    );
  }

  getUnreadCount(userId: string) {
    return this.notificationRepository.count({
      where: { userNo: userId, status: NotificationStatus.UNREAD },
    });
  }

  sendNotification(body) {
    const { userNo, type, title, content, relatedId, relatedType } = body;

    const notification = this.notificationRepository.create({
      userNo,
      type,
      title,
      content,
      relatedId,
      relatedType,
      status: NotificationStatus.UNREAD,
    });

    return this.notificationRepository
      .save(notification)
      .then((savedNotification) => {
        // 这里可以添加推送逻辑（邮件、短信、推送通知等）
        return savedNotification;
      });
  }
}
