import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { User } from '../entity/user';
import { Order } from '../entity/order';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { jwtConstants } from './auth.constants';
import { WechatConfig } from '../config/wechat.config';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Order]),
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [UserController],
  providers: [UserService, JwtStrategy, WechatConfig],
  exports: [UserService],
})
export class UserModule {}
