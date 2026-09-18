import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';
import { LoginDto } from './dto/login.dto';
import { AuthenticatedUser } from './types/authenticated-user';
import { AuditLogService } from '../audit/audit-log.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly auditLogService: AuditLogService,
  ) {}

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
