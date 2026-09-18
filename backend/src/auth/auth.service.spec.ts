import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/user.entity';
import { AuditLogService } from '../audit/audit-log.service';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((v) => v),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-jwt-token') },
        },
        {
          provide: AuditLogService,
          useValue: { record: jest.fn().mockResolvedValue(undefined) },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('login', () => {
    it('should return access token for valid credentials', async () => {
      const passwordHash = await bcrypt.hash('password123', 4);
      userRepository.findOne.mockResolvedValue({
        id: 'user-1',
        orgId: 'org-1',
        email: 'john@acme.com',
        passwordHash,
        role: UserRole.REP,
      });
      userRepository.save.mockImplementation((v) => Promise.resolve(v));

      const result = await service.login({
        email: 'john@acme.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed-jwt-token');
    });

    it('should throw UnauthorizedException for invalid password', async () => {
      const passwordHash = await bcrypt.hash('password123', 4);
      userRepository.findOne.mockResolvedValue({
        id: 'user-1',
        email: 'john@acme.com',
        passwordHash,
      });

      await expect(
        service.login({ email: 'john@acme.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException when user does not exist', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'nobody@acme.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
