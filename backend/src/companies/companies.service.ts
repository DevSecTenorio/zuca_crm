import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Company } from './company.entity';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { AttachmentsService } from '../attachments/attachments.service';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly attachmentsService: AttachmentsService,
  ) {}

  async create(orgId: string, dto: CreateCompanyDto) {
    if (dto.cnpj) {
      const existing = await this.companyRepository.findOne({
        where: { orgId, cnpj: dto.cnpj },
      });
      if (existing) {
        throw new ConflictException('CNPJ já cadastrado nesta organização');
      }
    }
    const company = this.companyRepository.create({ ...dto, orgId });
    return this.companyRepository.save(company);
  }

  async findAll(orgId: string, search?: string) {
    return this.companyRepository.find({
      where: search ? { orgId, razaoSocial: ILike(`%${search}%`) } : { orgId },
      relations: ['segment'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(orgId: string, id: string) {
    const company = await this.companyRepository.findOne({
      where: { id, orgId },
      relations: ['contacts', 'segment'],
    });
    if (!company) {
      throw new NotFoundException('Empresa não encontrada');
    }
    return company;
  }

  async update(orgId: string, id: string, dto: UpdateCompanyDto) {
    const company = await this.findOne(orgId, id);
    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async remove(orgId: string, id: string) {
    const company = await this.findOne(orgId, id);
    await this.attachmentsService.removeAllForEntity(orgId, 'company', id);
    await this.companyRepository.remove(company);
    return { success: true };
  }
}
