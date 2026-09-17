import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Segment } from './segment.entity';
import { CreateCatalogItemDto } from './dto/create-catalog-item.dto';
import { UpdateCatalogItemDto } from './dto/update-catalog-item.dto';

@Injectable()
export class SegmentsService {
  constructor(
    @InjectRepository(Segment)
    private readonly repository: Repository<Segment>,
  ) {}

  findAll(orgId: string) {
    return this.repository.find({
      where: { orgId },
      order: { order: 'ASC', createdAt: 'ASC' },
    });
  }

  async create(orgId: string, dto: CreateCatalogItemDto) {
    const count = await this.repository.count({ where: { orgId } });
    return this.repository.save(
      this.repository.create({
        orgId,
        name: dto.name,
        active: dto.active ?? true,
        order: count,
      }),
    );
  }

  async update(orgId: string, id: string, dto: UpdateCatalogItemDto) {
    const item = await this.getOrgItem(orgId, id);
    Object.assign(item, dto);
    return this.repository.save(item);
  }

  async remove(orgId: string, id: string) {
    const item = await this.getOrgItem(orgId, id);
    await this.repository.remove(item);
    return { success: true };
  }

  async reorder(orgId: string, ids: string[]) {
    const items = await this.repository.find({ where: { orgId } });
    const itemMap = new Map(items.map((i) => [i.id, i]));
    const updated: Segment[] = [];
    ids.forEach((id, index) => {
      const item = itemMap.get(id);
      if (item) {
        item.order = index;
        updated.push(item);
      }
    });
    await this.repository.save(updated);
    return this.findAll(orgId);
  }

  private async getOrgItem(orgId: string, id: string): Promise<Segment> {
    const item = await this.repository.findOne({ where: { id, orgId } });
    if (!item) {
      throw new NotFoundException('Segmento não encontrado');
    }
    return item;
  }
}
