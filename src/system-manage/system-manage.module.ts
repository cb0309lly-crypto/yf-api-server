import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemManageController } from './system-manage.controller';
import { SystemManageService } from './system-manage.service';
import { Role, Menu, User } from '../entity';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Menu, User])],
  controllers: [SystemManageController],
  providers: [SystemManageService],
})
export class SystemManageModule {}
