import type { Mocked } from 'vitest';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '@modules/auth/domain/constants/error-messages';
import { User } from '@modules/auth/domain/entities/user.entity';
import { UserRepository } from '@modules/auth/domain/repositories/user.repository';
import { UpdateUserUseCase } from '../update-user.use-case';

const ORG_ID = '550e8400-e29b-41d4-a716-446655440000';

const mockUserRepository: Mocked<UserRepository> = {
  findById: vi.fn(),
  findByEmail: vi.fn(),
  findByOrganization: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
};

function createUser() {
  return User.create({
    organizationId: ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: 'hash',
  });
}

describe('UpdateUserUseCase', () => {
  let useCase: UpdateUserUseCase;

  beforeEach(() => {
    vi.clearAllMocks();
    useCase = new UpdateUserUseCase(mockUserRepository);
  });

  it('deve atualizar o nome do usuário', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.update.mockImplementation(async (u) => u);

    const result = await useCase.execute(user.id, { name: 'Maria Souza' });

    expect(result.name).toBe('Maria Souza');
    expect(mockUserRepository.update).toHaveBeenCalledTimes(1);
  });

  it('deve atualizar o email verificando unicidade', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.update.mockImplementation(async (u) => u);

    const result = await useCase.execute(user.id, {
      email: 'novo@empresa.com',
    });

    expect(result.email).toBe('novo@empresa.com');
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      ORG_ID,
      'novo@empresa.com',
    );
  });

  it('não deve verificar unicidade quando email não muda', async () => {
    const user = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.update.mockImplementation(async (u) => u);

    await useCase.execute(user.id, { email: 'joao@empresa.com' });

    expect(mockUserRepository.findByEmail).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando email já está em uso', async () => {
    const user = createUser();
    const otherUser = createUser();
    mockUserRepository.findById.mockResolvedValue(user);
    mockUserRepository.findByEmail.mockResolvedValue(otherUser);

    await expect(
      useCase.execute(user.id, { email: 'outro@empresa.com' }),
    ).rejects.toThrow(new DomainException(UserErrorMessages.EMAIL_TAKEN));

    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });

  it('deve lançar exceção quando usuário não encontrado', async () => {
    mockUserRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute('id-inexistente', { name: 'Novo' }),
    ).rejects.toThrow(new DomainException(UserErrorMessages.NOT_FOUND));
  });
});
