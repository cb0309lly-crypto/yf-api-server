import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { InventoryService } from '../src/inventory/inventory.service';
import { DataSource } from 'typeorm';
import { Inventory } from '../src/entity/inventory';

describe('库存并发控制测试 (e2e)', () => {
  let app: INestApplication;
  let inventoryService: InventoryService;
  let dataSource: DataSource;
  let testProductNo: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    inventoryService = moduleFixture.get<InventoryService>(InventoryService);
    dataSource = moduleFixture.get<DataSource>(DataSource);

    // 创建测试商品库存
    testProductNo = `TEST-PRODUCT-${Date.now()}`;
    const inventory = dataSource.getRepository(Inventory).create({
      productNo: testProductNo,
      quantity: 100,
      reservedQuantity: 0,
      availableQuantity: 100,
      minStockLevel: 10,
      maxStockLevel: 1000,
      status: 'in_stock',
    });
    await dataSource.getRepository(Inventory).save(inventory);
  });

  afterAll(async () => {
    // 清理测试数据
    await dataSource
      .getRepository(Inventory)
      .delete({ productNo: testProductNo });
    await app.close();
  });

  describe('原子库存扣减测试', () => {
    it('应该成功扣减库存', async () => {
      const result = await inventoryService.decreaseStock(testProductNo, 10);
      expect(result).toBe(true);

      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(90);
    });

    it('库存不足时应该扣减失败', async () => {
      const result = await inventoryService.decreaseStock(testProductNo, 200);
      expect(result).toBe(false);

      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(90); // 库存不变
    });
  });

  describe('原子库存增加测试', () => {
    it('应该成功增加库存', async () => {
      const result = await inventoryService.increaseStock(testProductNo, 20);
      expect(result).toBe(true);

      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(110);
    });
  });

  describe('并发扣减测试', () => {
    beforeEach(async () => {
      // 重置库存为100
      await dataSource
        .getRepository(Inventory)
        .update({ productNo: testProductNo }, { quantity: 100 });
    });

    it('10个并发请求扣减库存，每次扣减10，最终库存应为0', async () => {
      const concurrentRequests = 10;
      const decreaseAmount = 10;

      // 并发执行10次扣减操作
      const promises = Array.from({ length: concurrentRequests }, () =>
        inventoryService.decreaseStock(testProductNo, decreaseAmount),
      );

      const results = await Promise.all(promises);

      // 所有请求都应该成功
      const successCount = results.filter((r) => r === true).length;
      expect(successCount).toBe(concurrentRequests);

      // 验证最终库存
      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(0);
    });

    it('20个并发请求扣减库存，每次扣减10，应该只有10个成功', async () => {
      const concurrentRequests = 20;
      const decreaseAmount = 10;

      // 并发执行20次扣减操作
      const promises = Array.from({ length: concurrentRequests }, () =>
        inventoryService.decreaseStock(testProductNo, decreaseAmount),
      );

      const results = await Promise.all(promises);

      // 应该只有10个请求成功（100 / 10 = 10）
      const successCount = results.filter((r) => r === true).length;
      expect(successCount).toBe(10);

      // 应该有10个请求失败
      const failCount = results.filter((r) => r === false).length;
      expect(failCount).toBe(10);

      // 验证最终库存
      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(0);
    });

    it('100个并发请求扣减库存，每次扣减1，最终库存应为0', async () => {
      const concurrentRequests = 100;
      const decreaseAmount = 1;

      // 并发执行100次扣减操作
      const promises = Array.from({ length: concurrentRequests }, () =>
        inventoryService.decreaseStock(testProductNo, decreaseAmount),
      );

      const results = await Promise.all(promises);

      // 所有请求都应该成功
      const successCount = results.filter((r) => r === true).length;
      expect(successCount).toBe(concurrentRequests);

      // 验证最终库存
      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(0);
    });

    it('混合并发：50个扣减请求和50个增加请求', async () => {
      const decreaseRequests = 50;
      const increaseRequests = 50;
      const amount = 1;

      // 创建扣减和增加请求
      const decreasePromises = Array.from({ length: decreaseRequests }, () =>
        inventoryService.decreaseStock(testProductNo, amount),
      );
      const increasePromises = Array.from({ length: increaseRequests }, () =>
        inventoryService.increaseStock(testProductNo, amount),
      );

      // 并发执行所有请求
      const allPromises = [...decreasePromises, ...increasePromises];
      await Promise.all(allPromises);

      // 验证最终库存（100 - 50 + 50 = 100）
      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(100);
    });
  });

  describe('库存检查测试', () => {
    beforeEach(async () => {
      // 重置库存为100
      await dataSource
        .getRepository(Inventory)
        .update({ productNo: testProductNo }, { quantity: 100 });
    });

    it('库存充足时应该返回true', async () => {
      const result = await inventoryService.checkStock(testProductNo, 50);
      expect(result).toBe(true);
    });

    it('库存不足时应该返回false', async () => {
      const result = await inventoryService.checkStock(testProductNo, 150);
      expect(result).toBe(false);
    });

    it('商品不存在时应该返回false', async () => {
      const result = await inventoryService.checkStock(
        'NON-EXISTENT-PRODUCT',
        10,
      );
      expect(result).toBe(false);
    });
  });

  describe('压力测试', () => {
    beforeEach(async () => {
      // 重置库存为1000
      await dataSource
        .getRepository(Inventory)
        .update({ productNo: testProductNo }, { quantity: 1000 });
    });

    it('1000个并发请求扣减库存，每次扣减1，最终库存应为0', async () => {
      const concurrentRequests = 1000;
      const decreaseAmount = 1;

      const startTime = Date.now();

      // 并发执行1000次扣减操作
      const promises = Array.from({ length: concurrentRequests }, () =>
        inventoryService.decreaseStock(testProductNo, decreaseAmount),
      );

      const results = await Promise.all(promises);

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`1000个并发请求执行时间: ${duration}ms`);

      // 所有请求都应该成功
      const successCount = results.filter((r) => r === true).length;
      expect(successCount).toBe(concurrentRequests);

      // 验证最终库存
      const inventory = await inventoryService.getProductInventory(
        testProductNo,
      );
      expect(inventory.quantity).toBe(0);

      // 性能要求：1000个请求应该在10秒内完成
      expect(duration).toBeLessThan(10000);
    }, 15000); // 设置超时时间为15秒
  });
});
