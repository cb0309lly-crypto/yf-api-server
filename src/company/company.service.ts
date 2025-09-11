import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entity/company';
import { paginate, PaginationResult } from '../common/utils/pagination.util';

@Injectable()
export class CompanyService {
  constructor(
    @InjectRepository(Company) private companyRepository: Repository<Company>,
  ) {}

  async addCompany(data: Partial<Company>): Promise<Company> {
    try {
      const company = this.companyRepository.create(data);
      return await this.companyRepository.save(company);
    } catch (err) {
      throw new BadRequestException('新增公司失败: ' + err.message);
    }
  }

  async updateCompany(data: Partial<Company>): Promise<Company> {
    if (!data.no) {
      throw new BadRequestException('缺少公司主键no');
    }
    const company = await this.companyRepository.findOne({ where: { no: data.no } });
    if (!company) {
      throw new NotFoundException('公司不存在');
    }
    Object.assign(company, data);
    try {
      return await this.companyRepository.save(company);
    } catch (err) {
      throw new BadRequestException('更新公司失败: ' + err.message);
    }
  }

  async findAll(): Promise<Company[]> {
    const list = await this.companyRepository.find();
    if (!list || list.length === 0) {
      throw new NotFoundException('暂无公司');
    }
    return list;
  }

  async findAllPaged(
    page = 1, 
    pageSize = 10, 
    keyword?: string, 
    description?: string, 
    address?: string, 
    taxId?: string, 
    phoneNumber?: string, 
    email?: string, 
    creator?: string
  ): Promise<PaginationResult<Company>> {
    const qb = this.companyRepository.createQueryBuilder('company');
    
    if (keyword) {
      qb.andWhere(
        '(company.name LIKE :keyword OR company.description LIKE :keyword OR company.address LIKE :keyword)',
        { keyword: `%${keyword}%` }
      );
    }
    if (description) {
      qb.andWhere('company.description LIKE :description', { description: `%${description}%` });
    }
    if (address) {
      qb.andWhere('company.address LIKE :address', { address: `%${address}%` });
    }
    if (taxId) {
      qb.andWhere('company.taxId = :taxId', { taxId });
    }
    if (phoneNumber) {
      qb.andWhere('company.phoneNumber = :phoneNumber', { phoneNumber });
    }
    if (email) {
      qb.andWhere('company.email = :email', { email });
    }
    if (creator) {
      qb.andWhere('company.creator = :creator', { creator });
    }
    
    return paginate(qb, page, pageSize);
  }

  async findOne(id: string): Promise<Company | null> {
    const company = await this.companyRepository.findOne({ where: { no: id } });
    if (!company) {
      throw new NotFoundException('公司不存在');
    }
    return company;
  }
}
