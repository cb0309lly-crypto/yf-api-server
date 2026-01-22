import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class WechatConfig {
  constructor(private configService: ConfigService) {}

  get appId(): string {
    const appId = this.configService.get<string>('wechat.appId');
    if (!appId) {
      throw new Error('WECHAT_APP_ID is not configured');
    }
    return appId;
  }

  get appSecret(): string {
    const appSecret = this.configService.get<string>('wechat.appSecret');
    if (!appSecret) {
      throw new Error('WECHAT_APP_SECRET is not configured');
    }
    return appSecret;
  }

  /**
   * 获取微信code换取openid的URL
   */
  getCode2SessionUrl(code: string): string {
    return `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appId}&secret=${this.appSecret}&js_code=${code}&grant_type=authorization_code`;
  }
}
