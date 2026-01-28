import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from './inventory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Inventory } from '../entity/inventory';
import { DataSource, Repository } from 'typeorm';

describe('InventoryService', () => {
  let service: InventoryService;
  let repository: Repository<Inventory>;
  let dataSource: DataSource;

  const mockInventory: Partial<Inventory> = {
    no: 'INV-001',
    productNo: 'PROD-001',
    quantity: 100,
    reservedQuantity: 10,
    availableQuantity: 90,
    minStockLevel: 10,
    maxStockLevel: 1000,
    status: 'in_stock' as any,
    version: 1,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockDataSource = {
    createQueryBuilder: jest.fn(() => ({
      update: jest.fn().mockReturnThis(),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        {
          provide: getRepositoryToken(Inventory),
          useValue: mockRepository,
        },
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    repository = module.get<Repository<Inventory>>(
      getRepositoryToken(Inventory),
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('decreaseStock', () => {
    it('应该成功扣减库存', async () => {
      const queryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(dataSource, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.decreaseStock('PROD-001', 10);

      expect(result).toBe(true);
      expect(queryBuilder.update).toHaveBeenCalledWith(Inventory);
      expect(queryBuilder.set).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith('product_no = :productNo', {
        productNo: 'PROD-001',
      });
      expect(queryBuilder.andWhere).toHaveBeenCalledWith('quantity >= :quantity', {
        quantity: 10,
      });
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('库存不足时应该返回false', async () => {
      const queryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      jest.spyOn(dataSource, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.decreaseStock('PROD-001', 200);

      expect(result).toBe(false);
    });

    it('扣减数量小于等于0时应该抛出异常', async () => {
      await expect(service.decreaseStock('PROD-001', 0)).rejects.toThrow(
        '扣减数量必须大于0',
      );

      await expect(service.decreaseStock('PROD-001', -10)).rejects.toThrow(
        '扣减数量必须大于0',
      );
    });
  });

  describe('increaseStock', () => {
    it('应该成功增加库存', async () => {
      const queryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 1 }),
      };

      jest.spyOn(dataSource, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.increaseStock('PROD-001', 20);

      expect(result).toBe(true);
      expect(queryBuilder.update).toHaveBeenCalledWith(Inventory);
      expect(queryBuilder.set).toHaveBeenCalled();
      expect(queryBuilder.where).toHaveBeenCalledWith('product_no = :productNo', {
        productNo: 'PROD-001',
      });
      expect(queryBuilder.execute).toHaveBeenCalled();
    });

    it('商品不存在时应该返回false', async () => {
      const queryBuilder = {
        update: jest.fn().mockReturnThis(),
        set: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        execute: jest.fn().mockResolvedValue({ affected: 0 }),
      };

      jest.spyOn(dataSource, 'createQueryBuilder').mockReturnValue(queryBuilder as any);

      const result = await service.increaseStock('NON-EXISTENT', 10);

      expect(result).toBe(false);
    });

    it('增加数量小于等于0时应该抛出异常', async () => {
      await expect(service.increaseStock('PROD-001', 0)).rejects.toThrow(
        '增加数量必须大于0',
      );

      await expect(service.increaseStock('PROD-001', -10)).rejects.toThrow(
        '增加数量必须大于0',
      );
    });
  });

  describe('checkStock', () => {
    it('库存充足时应该返回true', async () => {
      mockRepository.findOne.mockResolvedValue(mockInventory);

      const result = await service.checkStock('PROD-001', 50);

      expect(result).toBe(true);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { productNo: 'PROD-001' },
      });
    });

    it('库存不足时应该返回false', async () => {
      mockRepository.findOne.mockResolvedValue(mockInventory);

      const result = await service.checkStock('PROD-001', 150);

      expect(result).toBe(false);
    });

    it('商品不存在时应该返回false', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.checkStock('NON-EXISTENT', 10);

      expect(result).toBe(false);
    });

    it('应该考虑预留库存', async () => {
      const inventory = {
        ...mockInventory,
        quantity: 100,
        reservedQuantity: 50,
      };
      mockRepository.findOne.mockResolvedValue(inventory);

      // 可用库存 = 100 - 50 = 50
      const result1 = await service.checkStock('PROD-001', 50);
      expect(result1).toBe(true);

      const result2 = await service.checkStock('PROD-001', 51);
      expect(result2).toBe(false);
    });
  });

  describe('getProductInventory', () => {
    it('应该返回商品库存信息', async () => {
      mockRepository.findOne.mockResolvedValue(mockInventory);

      const result = await service.getProductInventory('PROD-001');

      expect(result).toEqual(mockInventory);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { productNo: 'PROD-001' },
        relations: ['product'],
      });
    });

    it('商品不存在时应该返回null', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.getProductInventory('NON-EXISTENT');

      expect(result).toBeNull();
    });
  });
});
