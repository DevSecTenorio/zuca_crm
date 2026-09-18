import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangeOwnPasswordDto } from './dto/change-own-password.dto';
import { AuditLogService } from '../audit/audit-log.service';

const SALT_ROUNDS = 12;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly auditLogService: AuditLogService,
  ) {}

  async findAllForOrg(orgId: string) {
    return this.userRepository.find({
      where: { orgId },
      order: { name: 'ASC' },
    });
  }

  async findOne(orgId: string, id: string) {
    const user = await this.userRepository.findOne({ where: { id, orgId } });
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }
    return user;
  }

  async create(orgId: string, actorId: string, dto: CreateUserDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }
    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userRepository.save(
      this.userRepository.create({
        orgId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role ?? UserRole.REP,
      }),
    );
    await this.auditLogService.record(orgId, actorId, 'user.created', {
      entityType: 'user',
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });
    return user;
  }

  async update(orgId: string, actorId: string, id: string, dto: UpdateUserDto) {
    const user = await this.findOne(orgId, id);
    const before = { role: user.role, status: user.status };
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    await this.auditLogService.record(orgId, actorId, 'user.updated', {
      entityType: 'user',
      entityId: user.id,
      metadata: { before, after: { role: saved.role, status: saved.status } },
    });
    return saved;
  }

  async remove(orgId: string, actorId: string, id: string) {
    if (id === actorId) {
      throw new BadRequestException('Você não pode excluir sua própria conta');
    }
    const user = await this.findOne(orgId, id);

    if (user.role === UserRole.ADMIN) {
      const otherAdmins = await this.userRepository.count({
        where: { orgId, role: UserRole.ADMIN },
      });
      if (otherAdmins <= 1) {
        throw new BadRequestException(
          'Não é possível excluir o único administrador da organização',
        );
      }
    }

    await this.userRepository.remove(user);
    await this.auditLogService.record(orgId, actorId, 'user.deleted', {
      entityType: 'user',
      entityId: id,
      metadata: { email: user.email, role: user.role },
    });
    return { success: true };
  }

  async changePassword(
    orgId: string,
    actorId: string,
    id: string,
    dto: ChangePasswordDto,
  ) {
    const user = await this.findOne(orgId, id);
    user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);
    await this.auditLogService.record(orgId, actorId, 'user.password_changed', {
      entityType: 'user',
      entityId: user.id,
    });
    return { success: true };
  }

  async updateProfile(orgId: string, userId: string, dto: UpdateProfileDto) {
    const user = await this.findOne(orgId, userId);
    Object.assign(user, dto);
    const saved = await this.userRepository.save(user);
    await this.auditLogService.record(orgId, userId, 'user.profile_updated', {
      entityType: 'user',
      entityId: user.id,
    });
    return saved;
  }

  async changeOwnPassword(
    orgId: string,
    userId: string,
    dto: ChangeOwnPasswordDto,
  ) {
    const user = await this.findOne(orgId, userId);
    const matches = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash,
    );
    if (!matches) {
      throw new BadRequestException('Senha atual incorreta');
    }
    user.passwordHash = await bcrypt.hash(dto.newPassword, SALT_ROUNDS);
    await this.userRepository.save(user);
    await this.auditLogService.record(orgId, userId, 'user.password_changed', {
      entityType: 'user',
      entityId: user.id,
    });
    return { success: true };
  }
}
