import { Controller, Put, Get, Body, Post, Query } from '@nestjs/common';

@Controller('auth')
export class UserController {
  @Post('/login')
  userLogin(@Body() body) {
    return 'login';
  }

  @Get('check')
  userCheck(@Query() query) {
    return 'check';
  }

  @Get('user_info')
  userInfo(@Query() query) {
    return 'user_info';
  }

  @Put('logout')
  logout(@Body() body) {
    return 'logout';
  }

  @Post('register')
  register(@Body() body) {
    return 'register';
  }
}
