import { Body, Controller, Get, Param, Post, Put } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from '../entity/company';

@Controller('company')
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  async create(@Body() body: Partial<Company>): Promise<Company> {
    return this.companyService.addCompany(body);
  }

  @Put()
  async update(@Body() body: Partial<Company>): Promise<Company> {
    return this.companyService.updateCompany(body);
  }

  @Get('/list')
  async findAll(): Promise<Company[]> {
    return this.companyService.findAll();
  }

  @Get('/:id')
  async findOne(@Param('id') id: string): Promise<Company | null> {
    return this.companyService.findOne(id);
  }
}
