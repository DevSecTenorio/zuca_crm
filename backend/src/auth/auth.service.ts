import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './types/authenticated-user';
import { AuditLogService } from '../audit/audit-log.service';

const SALT_ROUNDS = 12;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Organization)
    private readonly orgRepository: Repository<Organization>,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

  private slugify(name: string): string {
    return (
      name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') || 'org'
    );
  }

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }

    let slug = this.slugify(dto.orgName);
    const slugExists = await this.orgRepository.findOne({ where: { slug } });
    if (slugExists) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const org = await this.orgRepository.save(
      this.orgRepository.create({ name: dto.orgName, slug, plan: 'free' }),
    );

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = await this.userRepository.save(
      this.userRepository.create({
        orgId: org.id,
        email: dto.email,
        name: dto.name,
        passwordHash,
        role: UserRole.ADMIN,
      }),
    );

    this.logger.log(`New organization registered: ${org.slug}`);
    await this.auditLogService.record(org.id, user.id, 'auth.register', {
      entityType: 'organization',
      entityId: org.id,
    });
    return this.buildAuthResponse(user);
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const valid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    user.lastLogin = new Date();
    await this.userRepository.save(user);

    await this.auditLogService.record(user.orgId, user.id, 'auth.login', {
      entityType: 'user',
      entityId: user.id,
    });

    return this.buildAuthResponse(user);
  }

  async validateUserById(id: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  private buildAuthResponse(user: User) {
    const payload: AuthenticatedUser = {
      id: user.id,
      orgId: user.orgId,
      email: user.email,
      role: user.role,
    };
    const accessToken = this.jwtService.sign(payload);
    return {
      accessToken,
      user: {
        id: user.id,
        orgId: user.orgId,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }
}
