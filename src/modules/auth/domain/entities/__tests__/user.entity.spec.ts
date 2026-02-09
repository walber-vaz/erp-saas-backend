import { DomainException } from '@shared/exceptions/domain.exception';
import { UserErrorMessages } from '../../constants/error-messages';
import { User } from '../user.entity';

const VALID_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_PASSWORD_HASH =
  '$2b$10$abcdefghijklmnopqrstuuABCDEFGHIJKLMNOPQRSTUVWXYZ012';

describe('User Entity', () => {
  const validProps = {
    organizationId: VALID_ORG_ID,
    name: 'João Silva',
    email: 'joao@empresa.com',
    passwordHash: VALID_PASSWORD_HASH,
  };

  describe('create', () => {
    it('deve criar um usuário com propriedades válidas', () => {
      const user = User.create(validProps);

      expect(user.id).toBeDefined();
      expect(user.organizationId).toBe(VALID_ORG_ID);
      expect(user.name).toBe(validProps.name);
      expect(user.email).toBe(validProps.email);
      expect(user.passwordHash).toBe(VALID_PASSWORD_HASH);
      expect(user.isActive).toBe(true);
      expect(user.lastLoginAt).toBeNull();
      expect(user.createdAt).toBeInstanceOf(Date);
      expect(user.updatedAt).toBeInstanceOf(Date);
    });

    it('deve usar id fornecido quando informado', () => {
      const id = '660e8400-e29b-41d4-a716-446655440000';
      const user = User.create({ ...validProps, id });

      expect(user.id).toBe(id);
    });

    it('deve normalizar email para lowercase', () => {
      const user = User.create({ ...validProps, email: 'JOAO@Empresa.COM' });

      expect(user.email).toBe('joao@empresa.com');
    });

    it('deve remover espaços do email', () => {
      const user = User.create({
        ...validProps,
        email: '  joao@empresa.com  ',
      });

      expect(user.email).toBe('joao@empresa.com');
    });

    it('não deve expor passwordHash no toJSON', () => {
      const user = User.create(validProps);
      const json = user.toJSON();

      expect(json).not.toHaveProperty('passwordHash');
    });

    it('deve lançar exceção para organizationId vazio', () => {
      expect(() => User.create({ ...validProps, organizationId: '' })).toThrow(
        new DomainException(UserErrorMessages.ORGANIZATION_ID_REQUIRED),
      );
    });

    it('deve lançar exceção para organizationId com formato inválido', () => {
      expect(() =>
        User.create({ ...validProps, organizationId: 'not-a-uuid' }),
      ).toThrow(new DomainException(UserErrorMessages.ORGANIZATION_ID_INVALID));
    });

    it('deve lançar exceção para nome com menos de 2 caracteres', () => {
      expect(() => User.create({ ...validProps, name: 'A' })).toThrow(
        new DomainException(UserErrorMessages.NAME_MIN_LENGTH),
      );
    });

    it('deve lançar exceção para nome vazio', () => {
      expect(() => User.create({ ...validProps, name: '' })).toThrow(
        new DomainException(UserErrorMessages.NAME_MIN_LENGTH),
      );
    });

    it('deve lançar exceção para email vazio', () => {
      expect(() => User.create({ ...validProps, email: '' })).toThrow(
        new DomainException(UserErrorMessages.EMAIL_REQUIRED),
      );
    });

    it('deve lançar exceção para email com formato inválido', () => {
      const invalidEmails = [
        'email-invalido',
        'email@',
        '@dominio.com',
        'email @dominio.com',
      ];

      for (const email of invalidEmails) {
        expect(() => User.create({ ...validProps, email })).toThrow(
          new DomainException(UserErrorMessages.EMAIL_INVALID),
        );
      }
    });

    it('deve lançar exceção para passwordHash vazio', () => {
      expect(() => User.create({ ...validProps, passwordHash: '' })).toThrow(
        new DomainException(UserErrorMessages.PASSWORD_HASH_REQUIRED),
      );
    });
  });

  describe('update', () => {
    it('deve atualizar o nome', () => {
      const user = User.create(validProps);
      user.update({ name: 'Maria Souza' });

      expect(user.name).toBe('Maria Souza');
    });

    it('deve atualizar o email', () => {
      const user = User.create(validProps);
      user.update({ email: 'novo@empresa.com' });

      expect(user.email).toBe('novo@empresa.com');
    });

    it('deve normalizar email no update', () => {
      const user = User.create(validProps);
      user.update({ email: 'NOVO@Empresa.COM' });

      expect(user.email).toBe('novo@empresa.com');
    });

    it('deve atualizar updatedAt', () => {
      const user = User.create(validProps);
      const previousUpdatedAt = user.updatedAt;

      user.update({ name: 'Novo Nome' });

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });

    it('deve lançar exceção para nome inválido no update', () => {
      const user = User.create(validProps);

      expect(() => user.update({ name: 'A' })).toThrow(
        new DomainException(UserErrorMessages.NAME_MIN_LENGTH),
      );
    });

    it('deve lançar exceção para email inválido no update', () => {
      const user = User.create(validProps);

      expect(() => user.update({ email: 'invalido' })).toThrow(
        new DomainException(UserErrorMessages.EMAIL_INVALID),
      );
    });
  });

  describe('updatePassword', () => {
    it('deve atualizar o hash da senha', () => {
      const user = User.create(validProps);
      const newHash = '$2b$10$newhashvaluehere1234567890abcdefghijklmnopqrs';
      user.updatePassword(newHash);

      expect(user.passwordHash).toBe(newHash);
    });

    it('deve atualizar updatedAt', () => {
      const user = User.create(validProps);
      const previousUpdatedAt = user.updatedAt;

      user.updatePassword('$2b$10$newhash');

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });

    it('deve lançar exceção para hash vazio', () => {
      const user = User.create(validProps);

      expect(() => user.updatePassword('')).toThrow(
        new DomainException(UserErrorMessages.PASSWORD_HASH_REQUIRED),
      );
    });
  });

  describe('deactivate', () => {
    it('deve desativar o usuário', () => {
      const user = User.create(validProps);
      user.deactivate();

      expect(user.isActive).toBe(false);
    });

    it('deve lançar exceção ao desativar usuário já inativo', () => {
      const user = User.create({ ...validProps, isActive: false });

      expect(() => user.deactivate()).toThrow(
        new DomainException(UserErrorMessages.ALREADY_INACTIVE),
      );
    });

    it('deve atualizar updatedAt ao desativar', () => {
      const user = User.create(validProps);
      const previousUpdatedAt = user.updatedAt;

      user.deactivate();

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('recordLogin', () => {
    it('deve registrar data do último login', () => {
      const user = User.create(validProps);

      expect(user.lastLoginAt).toBeNull();

      user.recordLogin();

      expect(user.lastLoginAt).toBeInstanceOf(Date);
    });

    it('deve atualizar updatedAt ao registrar login', () => {
      const user = User.create(validProps);
      const previousUpdatedAt = user.updatedAt;

      user.recordLogin();

      expect(user.updatedAt.getTime()).toBeGreaterThanOrEqual(
        previousUpdatedAt.getTime(),
      );
    });
  });

  describe('toJSON', () => {
    it('deve retornar objeto sem passwordHash', () => {
      const user = User.create(validProps);
      const json = user.toJSON();

      expect(json).toEqual({
        id: user.id,
        organizationId: VALID_ORG_ID,
        name: validProps.name,
        email: validProps.email,
        isActive: true,
        lastLoginAt: null,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(json).not.toHaveProperty('passwordHash');
    });
  });
});
