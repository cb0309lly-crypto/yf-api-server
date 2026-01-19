import {
  Controller,
  Put,
  Get,
  Body,
  Post,
  Query,
  Req,
  UnauthorizedException,
  BadRequestException,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { Public } from '../common/decorators/public.decorator';
import {
  LoginDto,
  RegisterDto,
  WxLoginDto,
  OpenIdLoginDto,
  UserQueryDto,
} from './dto';
import axios from 'axios';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

interface AuthRequest extends Request {
  user: {
    no: string;
    [key: string]: any;
  };
}

@ApiTags('用户认证')
@Controller('auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Public()
  @Post('/login')
  @ApiOperation({ summary: '用户登录' })
  async userLogin(@Body() body: LoginDto) {
    const result = await this.userService.login(body);
    if (!result) {
      throw new UnauthorizedException('用户名或密码错误');
    }
    return result;
  }

  @Public()
  @Post('register')
  @ApiOperation({ summary: '用户注册' })
  async register(@Body() body: RegisterDto) {
    const user = await this.userService.register(body);
    if (!user) {
      return { code: 400, message: '用户名已存在' };
    }
    return user;
  }

  @Public()
  @Post('wxlogin')
  @ApiOperation({ summary: '微信登录' })
  async wxLogin(@Body() body: WxLoginDto) {
    const { code, nickname, avatar } = body;
    // 用 code 换 openid
    const appid = 'wx7631df08d9432644';
    const secret = 'fddaf29f791eb6cf59914676b9cc4ac0';
    const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${appid}&secret=${secret}&js_code=${code}&grant_type=authorization_code`;
    const res = await axios.get(url);
    const { openid } = res.data;
    if (!openid) {
      throw new UnauthorizedException('微信登录失败');
    }
    // 查找或注册用户
    let user = await this.userService.findByOpenId(openid);
    if (!user) {
      user = await this.userService.registerWxUser({
        openId: openid,
        nickname,
        avatar,
      });
    }
    // 生成token
    return this.userService.loginByOpenId(user);
  }

  @Public()
  @Post('openid-login')
  @ApiOperation({ summary: 'OpenID 登录' })
  async openIdLogin(@Body() body: OpenIdLoginDto) {
    const { openId, nickname, avatar } = body;
    let user = await this.userService.findByOpenId(openId);
    if (!user) {
      user = await this.userService.registerWxUser({
        openId,
        nickname,
        avatar,
      });
    }
    return this.userService.loginByOpenId(user);
  }

  @Public()
  @Post('mock-login')
  @ApiOperation({ summary: '模拟登录(无微信)' })
  async mockLogin() {
    return this.userService.mockLogin();
  }

  @ApiBearerAuth()
  @Put('logout')
  @ApiOperation({ summary: '用户登出' })
  logout(@Req() req: AuthRequest) {
    // 清除Redis中的token
    this.userService.logout(req.user.no);
    return { message: 'logout成功', user: req.user };
  }

  // 刷新token
  @ApiBearerAuth()
  @Post('refresh-token')
  @ApiOperation({ summary: '刷新 Token' })
  async refreshToken(@Req() req: AuthRequest) {
    const result = await this.userService.refreshToken(req.user.no);
    if (!result) {
      throw new UnauthorizedException('刷新token失败');
    }
    return result;
  }

  // 获取用户在线状态
  @ApiBearerAuth()
  @Get('online-status')
  @ApiOperation({ summary: '获取在线状态' })
  async getOnlineStatus(@Req() req: AuthRequest) {
    const isOnline = await this.userService.getUserOnlineStatus(req.user.no);
    return {
      isOnline,
      userNo: req.user.no,
      message: isOnline ? '用户在线' : '用户离线',
    };
  }

  // 验证token有效性
  @ApiBearerAuth()
  @Get('validate-token')
  @ApiOperation({ summary: '验证 Token' })
  validateToken(@Req() req: AuthRequest) {
    const token = req.headers['authorization']?.replace('Bearer ', '');
    if (!token) {
      throw new UnauthorizedException('Token不能为空');
    }

    const isValid = this.userService.validateTokenFromRedis(req.user.no, token);
    return {
      valid: isValid,
      user: req.user,
      message: isValid ? 'Token有效' : 'Token无效或已过期',
    };
  }

  // 从Redis获取用户信息
  @ApiBearerAuth()
  @Get('redis-user-info')
  @ApiOperation({ summary: '获取缓存的用户信息' })
  async getRedisUserInfo(@Req() req: AuthRequest) {
    const userInfo = await this.userService.getUserFromRedis(req.user.no);
    if (!userInfo) {
      throw new UnauthorizedException('用户信息不存在或已过期');
    }
    return { user: userInfo };
  }

  @ApiBearerAuth()
  @Get('user_info')
  @ApiOperation({ summary: '获取用户信息' })
  async getUserInfo(@Req() req: AuthRequest) {
    const userInfo = await this.userService.getAuthUserInfo(req.user.no);
    if (!userInfo) {
      throw new UnauthorizedException('用户不存在');
    }
    return userInfo;
  }

  // 获取用户列表
  @ApiBearerAuth()
  @Get('list')
  @ApiOperation({ summary: '获取用户列表' })
  async getUserList(@Query() query: UserQueryDto) {
    const { page = 1, pageSize = 10, keyword } = query;
    return this.userService.findAllPaged(page, pageSize, keyword);
  }
}
