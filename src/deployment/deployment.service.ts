import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deployment } from '../entity/deployment';
import { CreateDeploymentDto } from './dto/create-deployment.dto';

@Injectable()
export class DeploymentService {
  constructor(
    @InjectRepository(Deployment)
    private deploymentRepository: Repository<Deployment>,
  ) {}

  async create(createDeploymentDto: CreateDeploymentDto) {
    if (createDeploymentDto.isActive) {
      // Deactivate others
      await this.deploymentRepository.update(
        { isActive: true },
        { isActive: false },
      );
    }
    const deployment = this.deploymentRepository.create(createDeploymentDto);
    return this.deploymentRepository.save(deployment);
  }

  async getActiveDeployment() {
    return this.deploymentRepository.findOne({
      where: { isActive: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findAll() {
    return this.deploymentRepository.find({ order: { createdAt: 'DESC' } });
  }
}
