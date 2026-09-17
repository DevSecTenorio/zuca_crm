import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';
import { Contact } from './contact.entity';
import { CreateContactDto } from './dto/create-contact.dto';
import { UpdateContactDto } from './dto/update-contact.dto';

@Injectable()
export class ContactsService {
  constructor(
    @InjectRepository(Contact)
    private readonly contactRepository: Repository<Contact>,
  ) {}

  async create(orgId: string, userId: string, dto: CreateContactDto) {
    const contact = this.contactRepository.create({
      ...dto,
      orgId,
      createdBy: userId,
      updatedBy: userId,
    });
    return this.contactRepository.save(contact);
  }

  async findAll(orgId: string, search?: string) {
    return this.contactRepository.find({
      where: search ? { orgId, name: ILike(`%${search}%`) } : { orgId },
      relations: ['linkedCompany', 'source', 'campaign'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(orgId: string, id: string) {
    const contact = await this.contactRepository.findOne({
      where: { id, orgId },
      relations: ['linkedCompany', 'source', 'campaign'],
    });
    if (!contact) {
      throw new NotFoundException('Contato não encontrado');
    }
    return contact;
  }

  async update(
    orgId: string,
    userId: string,
    id: string,
    dto: UpdateContactDto,
  ) {
    const contact = await this.findOne(orgId, id);
    Object.assign(contact, dto, { updatedBy: userId });
    return this.contactRepository.save(contact);
  }

  async remove(orgId: string, id: string) {
    const contact = await this.findOne(orgId, id);
    await this.contactRepository.remove(contact);
    return { success: true };
  }
}
