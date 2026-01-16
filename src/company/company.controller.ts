import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from '../entity/company';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  QueryCompanyDto,
  CompanyIdDto,
} from './dto';
import { PaginationResult } from '../common/utils/pagination.util';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('公司管理')
@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  @ApiOperation({ summary: '创建公司' })
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyService.addCompany(createCompanyDto);
  }

  @Put()
  @ApiOperation({ summary: '更新公司' })
  async update(@Body() updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    return this.companyService.updateCompany(updateCompanyDto);
  }

  @Get('/list')
  @ApiOperation({ summary: '获取公司列表' })
  async findAll(
    @Query() queryCompanyDto: QueryCompanyDto,
  ): Promise<PaginationResult<Company>> {
    const {
      page = 1,
      pageSize = 10,
      keyword,
      name,
      description,
      address,
      taxId,
      phoneNumber,
      email,
      creator,
    } = queryCompanyDto;
    return this.companyService.findAllPaged(
      page,
      pageSize,
      keyword || name,
      description,
      address,
      taxId,
      phoneNumber,
      email,
      creator,
    );
  }

  @Get('/:id')
  @ApiOperation({ summary: '获取公司详情' })
  async findOne(@Param() params: CompanyIdDto): Promise<Company | null> {
    return this.companyService.findOne(params.id);
  }
}
