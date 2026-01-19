import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { User } from '../entity/user';
import { Category } from '../entity/category';
import { Promotion, PromotionStatus } from '../entity/promotion';
import { Order, OrderStatus } from '../entity/order';
import { Product } from '../entity/product';
import { Payment } from '../entity/payment';
import { Config } from '../entity/config';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
    @InjectRepository(Promotion)
    private promotionRepository: Repository<Promotion>,
    @InjectRepository(Config)
    private configRepository: Repository<Config>,
  ) {}

  async getCardData() {
    const userCount = await this.userRepository.count();
    const orderCount = await this.orderRepository.count();

    // Calculate GMV (Total successful payment amount)
    const { totalTurnover } = await this.paymentRepository
      .createQueryBuilder('payment')
      .select('SUM(payment.amount)', 'totalTurnover')
      .where('payment.status = :status', { status: 'success' })
      .getRawOne();

    // Use order count as deal count for now, or filter by 'completed' status
    const dealCount = await this.orderRepository.count({
      where: [
        { orderStatus: OrderStatus.PAIED },
        { orderStatus: OrderStatus.DELIVERY },
        // Add COMPLETED status if available
      ],
    });

    return {
      visitCount: userCount, // Using user count as a proxy for visit count
      turnover: Number(totalTurnover) || 0,
      downloadCount: await this.productRepository.count(), // Using product count as proxy
      dealCount: dealCount || orderCount, // Fallback to total orders if status not matching
    };
  }

  async getLineChartData() {
    // Get last 7 days order count trend
    const today = new Date();
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    const orders = await this.orderRepository
      .createQueryBuilder('order')
      .select("TO_CHAR(order.created_at, 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('order.created_at >= :startDate', { startDate: sevenDaysAgo })
      .groupBy('date')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Fill missing dates with 0 (simplified for now, just returning raw data)
    // Note: TO_CHAR is PostgreSQL specific. For MySQL use DATE_FORMAT(order.created_at, '%Y-%m-%d')
    // Assuming PostgreSQL based on app.module.ts config

    return orders;
  }

  async getPieChartData() {
    // Get product category distribution (simplified: using hardcoded categories or grouping by product type if available)
    // Since we don't have category relation in product easily accessible or data might be sparse:
    // We mock this based on real counts if possible, or just return static structure for now until Category-Product relation is robust.

    // Let's count orders by status for the pie chart
    const statusCounts = await this.orderRepository
      .createQueryBuilder('order')
      .select('order.order_status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('status')
      .getRawMany();

    return statusCounts.map((item) => ({
      name: item.status,
      value: Number(item.count),
    }));
  }

  async getMpHomeData() {
    // Check for config first
    const config = await this.configRepository.findOne({
      where: { key: 'mp_home_config' },
    });
    let configData: any = {};
    if (config && config.value) {
      try {
        configData = JSON.parse(config.value);
      } catch (e) {
        console.error('Parse mp_home_config error', e);
      }
    }

    const [products, categories, promotions] = await Promise.all([
      this.productRepository.find({
        order: { createdAt: 'DESC' },
        take: 6,
      }),
      this.categoryRepository.find({
        order: { sort: 'ASC', createdAt: 'DESC' },
      }),
      this.promotionRepository.find({
        where: { status: PromotionStatus.ACTIVE },
        order: { startDate: 'DESC' },
        take: 1,
      }),
    ]);

    // Use config if available, otherwise fallback
    const swiper =
      configData.swiper && configData.swiper.length > 0
        ? configData.swiper
        : (products || []).map((item) => item.imgUrl).filter((img) => !!img);

    const categoryTabs = (categories || [])
      .filter((item) => !item.parentId || item.categoryLevel === 1)
      .map((item) => ({
        text: item.name,
        key: item.no,
      }));

    const tabList = [
      { text: '精选推荐', key: 0 },
      ...categoryTabs,
    ];

    const activityImg =
      configData.activityImg ||
      promotions?.[0]?.bannerImage ||
      products?.[0]?.imgUrl ||
      '';

    return {
      swiper,
      tabList,
      activityImg,
    };
  }

  async updateMpHomeData(data: { swiper: any[]; activityImg: string }) {
    let config = await this.configRepository.findOne({
      where: { key: 'mp_home_config' },
    });
    if (!config) {
      config = new Config();
      config.key = 'mp_home_config';
      config.description = '小程序首页配置';
    }
    config.value = JSON.stringify(data);
    return this.configRepository.save(config);
  }

  async getMpTabbarData() {
    const config = await this.configRepository.findOne({
      where: { key: 'mp_tabbar_config' },
    });
    
    // 默认配置
    const defaultList = [
      {
        icon: 'home',
        text: '首页',
        url: 'pages/home/home',
      },
      {
        icon: 'sort',
        text: '分类',
        url: 'pages/category/index',
      },
      {
        icon: 'cart',
        text: '购物车',
        url: 'pages/cart/index',
      },
      {
        icon: 'person',
        text: '个人中心',
        url: 'pages/usercenter/index',
      },
    ];

    if (config && config.value) {
      try {
        const data = JSON.parse(config.value);
        return data.list || defaultList;
      } catch (e) {
        console.error('Parse mp_tabbar_config error', e);
      }
    }
    return defaultList;
  }

  async updateMpTabbarData(data: { list: any[] }) {
    let config = await this.configRepository.findOne({
      where: { key: 'mp_tabbar_config' },
    });
    if (!config) {
      config = new Config();
      config.key = 'mp_tabbar_config';
      config.name = '小程序菜单配置';
      config.description = '小程序菜单配置';
    }
    config.value = JSON.stringify(data);
    return this.configRepository.save(config);
  }
}
