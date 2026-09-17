import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from '../users/user.entity';
import { Organization } from '../organizations/organization.entity';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: {
    findOne: jest.Mock;
    save: jest.Mock;
    create: jest.Mock;
  };
  let orgRepository: { findOne: jest.Mock; save: jest.Mock; create: jest.Mock };

  beforeEach(async () => {
    userRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((v) => v),
    };
    orgRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
      create: jest.fn((v) => v),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepository },
        { provide: getRepositoryToken(Organization), useValue: orgRepository },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed-jwt-token') },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  describe('register', () => {
    it('should create org and user and return access token', async () => {
      userRepository.findOne.mockResolvedValue(null);
      orgRepository.findOne.mockResolvedValue(null);
      orgRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'org-1', ...v }),
      );
      userRepository.save.mockImplementation((v) =>
        Promise.resolve({ id: 'user-1', ...v }),
      );

      const result = await service.register({
        orgName: 'Acme Corp',
        name: 'John Doe',
        email: 'john@acme.com',
        password: 'password123',
      });

      expect(result.accessToken).toBe('signed-jwt-token');
      expect(result.user.email).toBe('john@acme.com');
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should throw ConflictException when email already exists', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.register({
          orgName: 'Acme Corp',
          name: 'John Doe',
          email: 'john@acme.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
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
