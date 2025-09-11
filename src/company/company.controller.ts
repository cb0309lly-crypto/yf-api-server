import { Body, Controller, Get, Param, Post, Put, Query, UsePipes } from '@nestjs/common';
import { CompanyService } from './company.service';
import { Company } from '../entity/company';
import { CreateCompanyDto, UpdateCompanyDto, QueryCompanyDto, CompanyIdDto } from './dto';
import { ValidationPipe } from '../common/pipes/validation.pipe';

@Controller('company')
@UsePipes(new ValidationPipe())
export class CompanyController {
  constructor(private companyService: CompanyService) {}

  @Post()
  async create(@Body() createCompanyDto: CreateCompanyDto): Promise<Company> {
    return this.companyService.addCompany(createCompanyDto);
  }

  @Put()
  async update(@Body() updateCompanyDto: UpdateCompanyDto): Promise<Company> {
    return this.companyService.updateCompany(updateCompanyDto);
  }

  @Get('/list')
  async findAll(@Query() queryCompanyDto: QueryCompanyDto): Promise<Company[]> {
    const { page = 1, pageSize = 10, keyword, name, description, address, taxId, phoneNumber, email, creator } = queryCompanyDto;
    return this.companyService.findAllPaged(page, pageSize, keyword || name, description, address, taxId, phoneNumber, email, creator);
  }

  @Get('/:id')
  async findOne(@Param() params: CompanyIdDto): Promise<Company | null> {
    return this.companyService.findOne(params.id);
  }
}
