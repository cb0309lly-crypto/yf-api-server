import { Controller, Put, Get, Body, Post, Query, Request, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from './user.service';
import { Public } from '../common/decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import axios from 'axios';

@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('/login')
  async userLogin(@Body() body: LoginDto) {
    const result = await this.userService.login(body);
    if (!result) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return result;
  }

  @Public()
  @Post('register')
  async register(@Body() body: RegisterDto) {
    const user = await this.userService.register(body);
    if (!user) {
      return { code: 400, message: '用户名已存在' };
    }
    return user;
  }

  @Public()
  @Post('wxlogin')
  async wxLogin(@Body() body) {
    const { code, nickname, avatar } = body;
    if (!code) {
      throw new BadRequestException('code不能为空');
    }
    // 用 code 换 openid
    const appid = '你的微信小程序appid';
    const secret = '你的微信小程序secret';
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const res = await axios.get(url);
    const { openid } = res.data;
    if (!openid) {
      throw new UnauthorizedException('微信登录失败');
    }
    // 查找或注册用户
    let user = await this.userService.findByOpenId(openid);
    if (!user) {
      user = await this.userService.registerWxUser({ openId: openid, nickname, avatar });
    }
    // 生成token
    return this.userService.loginByOpenId(user);
  }

  @Public()
  @Post('openid-login')
  async openIdLogin(@Body() body) {
    const { openId, nickname, avatar } = body;
    if (!openId) {
      throw new BadRequestException('openId不能为空');
    }
    let user = await this.userService.findByOpenId(openId);
    if (!user) {
      user = await this.userService.registerWxUser({ openId, nickname, avatar });
    }
    return this.userService.loginByOpenId(user);
  }

  @Put('logout')
  async logout(@Request() req, @Body() body) {
    // 清除Redis中的token
    await this.userService.logout(req.user.no);
    return { message: 'logout成功', user: req.user };
  }

  // 刷新token
  @Post('refresh-token')
  async refreshToken(@Request() req) {
    const result = await this.userService.refreshToken(req.user.no);
    if (!result) {
      throw new UnauthorizedException('刷新token失败');
    }
    return result;
  }

  // 获取用户在线状态
  @Get('online-status')
  async getOnlineStatus(@Request() req) {
    const isOnline = await this.userService.getUserOnlineStatus(req.user.no);
    return { 
      isOnline,
      userNo: req.user.no,
      message: isOnline ? '用户在线' : '用户离线'
    };
  }

  // 验证token有效性
  @Get('validate-token')
  async validateToken(@Request() req) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token不能为空');
    }
    
    const isValid = await this.userService.validateTokenFromRedis(req.user.no, token);
    return {
      valid: isValid,
      user: req.user,
      message: isValid ? 'Token有效' : 'Token无效或已过期'
    };
  }

  // 从Redis获取用户信息
  @Get('redis-user-info')
  async getRedisUserInfo(@Request() req) {
    const userInfo = await this.userService.getUserFromRedis(req.user.no);
    if (!userInfo) {
      throw new UnauthorizedException('用户信息不存在或已过期');
    }
    return { user: userInfo };
  }

  // 获取用户列表
  @Get('list')
  async getUserList(@Query() query: any) {
    const { page = 1, pageSize = 10, keyword } = query;
    return this.userService.findAllPaged(page, pageSize, keyword);
  }
}
