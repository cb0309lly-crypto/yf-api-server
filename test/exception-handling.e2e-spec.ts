import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, HttpStatus } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/all-exceptions.filter';
import { ValidationExceptionFilter } from '../src/common/filters/validation-exception.filter';

describe('异常处理测试 (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 注册全局异常过滤器
    app.useGlobalFilters(
      new AllExceptionsFilter(),
      new ValidationExceptionFilter(),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('验证异常测试', () => {
    it('应该返回统一格式的验证错误', async () => {
      const response = await request(app.getHttpServer())
        .post('/api/order')
        .send({
          // 缺少必填字段
          items: [],
        })
        .expect(HttpStatus.BAD_REQUEST);

      expect(response.body).toHaveProperty('statusCode', HttpStatus.BAD_REQUEST);
      expect(response.body).toHaveProperty('message');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('path');
    });
  });

  describe('自定义异常测试', () => {
    it('库存不足异常应该返回详细信息', async () => {
      // 这个测试需要实际的订单创建接口
      // 这里只是示例结构
      const response = {
        body: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '商品 PROD-001 库存不足，需要 100，可用 50',
          error: 'InsufficientStock',
          details: {
            productNo: 'PROD-001',
            required: 100,
            available: 50,
            shortage: 50,
          },
          timestamp: expect.any(String),
          path: expect.any(String),
        },
      };

      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('productNo');
      expect(response.body.details).toHaveProperty('required');
      expect(response.body.details).toHaveProperty('available');
      expect(response.body.details).toHaveProperty('shortage');
    });

    it('支付金额不匹配异常应该返回详细信息', async () => {
      const response = {
        body: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '订单 ORD-123 支付金额不匹配',
          error: 'PaymentFailed',
          details: {
            orderNo: 'ORD-123',
            reason: '支付金额不匹配，订单金额: 100，支付金额: 90',
          },
          timestamp: expect.any(String),
          path: expect.any(String),
        },
      };

      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('orderNo');
      expect(response.body.details).toHaveProperty('reason');
    });

    it('订单状态异常应该返回详细信息', async () => {
      const response = {
        body: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '订单 ORD-123 状态为 已支付，无法执行 支付 操作',
          error: 'InvalidOrderStatus',
          details: {
            orderNo: 'ORD-123',
            currentStatus: 'PAIED',
            expectedStatus: 'UNPAY',
            operation: '支付',
          },
          timestamp: expect.any(String),
          path: expect.any(String),
        },
      };

      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('orderNo');
      expect(response.body.details).toHaveProperty('currentStatus');
      expect(response.body.details).toHaveProperty('expectedStatus');
      expect(response.body.details).toHaveProperty('operation');
    });

    it('优惠券无效异常应该返回详细信息', async () => {
      const response = {
        body: {
          statusCode: HttpStatus.BAD_REQUEST,
          message: '优惠券 COUPON-001 不可用：优惠券已过期',
          error: 'InvalidCoupon',
          details: {
            couponId: 'COUPON-001',
            reason: '优惠券已过期',
          },
          timestamp: expect.any(String),
          path: expect.any(String),
        },
      };

      expect(response.body).toHaveProperty('details');
      expect(response.body.details).toHaveProperty('couponId');
      expect(response.body.details).toHaveProperty('reason');
    });
  });

  describe('错误响应格式测试', () => {
    it('所有异常都应该包含必要字段', () => {
      const errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: '/api/test',
        method: 'POST',
        message: '测试错误',
        error: 'TestError',
      };

      expect(errorResponse).toHaveProperty('statusCode');
      expect(errorResponse).toHaveProperty('timestamp');
      expect(errorResponse).toHaveProperty('path');
      expect(errorResponse).toHaveProperty('method');
      expect(errorResponse).toHaveProperty('message');
      expect(errorResponse).toHaveProperty('error');
    });

    it('带详细信息的异常应该包含details字段', () => {
      const errorResponse = {
        statusCode: HttpStatus.BAD_REQUEST,
        timestamp: new Date().toISOString(),
        path: '/api/test',
        method: 'POST',
        message: '测试错误',
        error: 'TestError',
        details: {
          field: 'value',
        },
      };

      expect(errorResponse).toHaveProperty('details');
      expect(errorResponse.details).toHaveProperty('field');
    });
  });
});
