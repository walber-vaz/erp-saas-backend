import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { FindUserUseCase } from '../find-user.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockUserRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOrganization: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

describe('FindUserUseCase', () => {
  let useCase: FindUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new FindUserUseCase(mockUserRepository);
  });

  it('deve retornar o usuário quando encontrado', async () => {
    const user = User.create({
      organizationId: ORG_ID,
      name: 'João Silva',
      email: 'joao@empresa.com',
      passwordHash: 'hash',
    });
    mockUserRepository.findById.mockResolvedValue(user);

    const result = await useCase.execute(user.id);

    expect(result).toBe(user);
    expect(mockUserRepository.findById).toHaveBeenCalledWith(user.id);
  });

  it('deve lançar exceção quando usuário não encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute('id-inexistente')).rejects.toThrow(
      new DomainException(UserErrorMessages.NOT_FOUND),
    );
  });
});
