import { Controller, Get, Post, Body, Res, HttpStatus } from '@nestjs/common';
import { DeploymentService } from './deployment.service';
import { CreateDeploymentDto } from './dto/create-deployment.dto';
import { Response } from 'express';
import { Public } from '../common/decorators/public.decorator';
import axios from 'axios';

@Controller()
export class DeploymentController {
  constructor(private readonly deploymentService: DeploymentService) {}

  @Public()
  @Post('deployment')
  async create(@Body() createDeploymentDto: CreateDeploymentDto) {
    return this.deploymentService.create(createDeploymentDto);
  }

  @Get('deployment')
  async findAll() {
    return this.deploymentService.findAll();
  }

  @Public()
  @Get(['web', 'web/*'])
  async redirectToWeb(@Res() res: Response) {
    const deployment = await this.deploymentService.getActiveDeployment();
    if (deployment && deployment.ossUrl) {
      try {
        const response = await axios.get(deployment.ossUrl);
        return res.status(HttpStatus.OK).send(response.data);
      } catch (error) {
        console.error('Failed to fetch deployment', error);
        return res.status(HttpStatus.BAD_GATEWAY).send('Failed to fetch deployment content');
      }
    }
    return res.status(HttpStatus.NOT_FOUND).send('No active deployment found');
  }
}
