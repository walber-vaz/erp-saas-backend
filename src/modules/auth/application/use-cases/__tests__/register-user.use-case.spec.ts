import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { HashService } from '@modules/auth/application/services/hash.service';
import { RegisterUserUseCase } from '../register-user.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockUserRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOrganization: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

const mockHashService: Mocked<HashService> = {
  hash: vi.fn(),
  compare: vi.fn(),
} as any;

describe('RegisterUserUseCase', () => {
  let useCase: RegisterUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new RegisterUserUseCase(mockUserRepository, mockHashService);
  });

  it('deve registrar um usuário com sucesso', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashService.hash.mockResolvedValue('hashed-password');
    mockUserRepository.create.mockImplementation(async (user) => user);

    const result = await useCase.execute({
      organizationId: ORG_ID,
      name: 'João Silva',
      email: 'joao@empresa.com',
      password: 'senha12345',
    });

    expect(result).toBeInstanceOf(User);
    expect(result.name).toBe('João Silva');
    expect(result.email).toBe('joao@empresa.com');
    expect(result.organizationId).toBe(ORG_ID);
    expect(mockHashService.hash).toHaveBeenCalledWith('senha12345');
    expect(mockUserRepository.create).toHaveBeenCalledTimes(1);
  });

  it('deve lançar exceção quando email já está em uso', async () => {
    const existing = User.create({
      organizationId: ORG_ID,
      name: 'Outro',
      email: 'joao@empresa.com',
      passwordHash: 'hash',
    });
    mockUserRepository.findByEmail.mockResolvedValue(existing);

    await expect(
      useCase.execute({
        organizationId: ORG_ID,
        name: 'João Silva',
        email: 'joao@empresa.com',
        password: 'senha12345',
      }),
    ).rejects.toThrow(new DomainException(UserErrorMessages.EMAIL_TAKEN));

    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });

  it('deve fazer hash da senha antes de criar o usuário', async () => {
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockHashService.hash.mockResolvedValue('$2b$10$hashedvalue');
    mockUserRepository.create.mockImplementation(async (user) => user);

    const result = await useCase.execute({
      organizationId: ORG_ID,
      name: 'João Silva',
      email: 'joao@empresa.com',
      password: 'minhasenha',
    });

    expect(result.passwordHash).toBe('$2b$10$hashedvalue');
    expect(mockHashService.hash).toHaveBeenCalledWith('minhasenha');
  });
});
