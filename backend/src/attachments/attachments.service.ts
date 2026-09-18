import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { randomUUID } from 'crypto';
import { Attachment, AttachmentEntityType } from './attachment.entity';
import { Deal } from '../deals/deal.entity';
import { Company } from '../companies/company.entity';
import { SupabaseStorageService } from './supabase-storage.service';

function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-150);
}

@Injectable()
export class AttachmentsService {
  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentRepository: Repository<Attachment>,
    @InjectRepository(Deal)
    private readonly dealRepository: Repository<Deal>,
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly storage: SupabaseStorageService,
  ) {}

  private async assertEntityExists(
    orgId: string,
    entityType: AttachmentEntityType,
    entityId: string,
  ): Promise<void> {
    const repository =
      entityType === 'deal' ? this.dealRepository : this.companyRepository;
    const exists = await repository.findOne({ where: { id: entityId, orgId } });
    if (!exists) {
      throw new NotFoundException('Registro não encontrado');
    }
  }

  async upload(
    orgId: string,
    userId: string,
    entityType: AttachmentEntityType,
    entityId: string,
    file: Express.Multer.File,
  ) {
    await this.assertEntityExists(orgId, entityType, entityId);

    const path = `${orgId}/${entityType}/${entityId}/${randomUUID()}-${sanitizeFileName(file.originalname)}`;
    await this.storage.upload(path, file.buffer, file.mimetype);

    const attachment = await this.attachmentRepository.save(
      this.attachmentRepository.create({
        orgId,
        entityType,
        entityId,
        fileName: file.originalname,
        storagePath: path,
        mimeType: file.mimetype,
        sizeBytes: String(file.size),
        uploadedBy: userId,
      }),
    );

    return this.toDto(attachment, await this.storage.createSignedUrl(path));
  }

  async findAll(
    orgId: string,
    entityType: AttachmentEntityType,
    entityId: string,
  ) {
    await this.assertEntityExists(orgId, entityType, entityId);

    const attachments = await this.attachmentRepository.find({
      where: { orgId, entityType, entityId },
      relations: ['uploader'],
      order: { createdAt: 'DESC' },
    });

    return Promise.all(
      attachments.map(async (attachment) =>
        this.toDto(
          attachment,
          await this.storage.createSignedUrl(attachment.storagePath),
        ),
      ),
    );
  }

  async remove(orgId: string, id: string) {
    const attachment = await this.attachmentRepository.findOne({
      where: { id, orgId },
    });
    if (!attachment) {
      throw new NotFoundException('Anexo não encontrado');
    }
    await this.storage.removeMany([attachment.storagePath]);
    await this.attachmentRepository.remove(attachment);
    return { success: true };
  }

  async removeAllForEntity(
    orgId: string,
    entityType: AttachmentEntityType,
    entityId: string,
  ): Promise<void> {
    const attachments = await this.attachmentRepository.find({
      where: { orgId, entityType, entityId },
    });
    if (attachments.length === 0) return;
    await this.storage.removeMany(attachments.map((a) => a.storagePath));
    await this.attachmentRepository.remove(attachments);
  }

  private toDto(attachment: Attachment, url: string) {
    return {
      id: attachment.id,
      fileName: attachment.fileName,
      mimeType: attachment.mimeType,
      sizeBytes: Number(attachment.sizeBytes),
      createdAt: attachment.createdAt,
      uploadedByName: attachment.uploader?.name ?? null,
      url,
    };
  }
}
