import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleErrorMessages } from '../../constants/error-messages';
import { Role } from '../role.entity';

const VALID_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_ROLE_ID = '660e8400-e29b-41d4-a716-446655440000';

describe('Role Entity', () => {
  const validProps = {
    organizationId: VALID_ORG_ID,
    name: 'Administrador de Organização',
    code: 'ORG_ADMIN',
    description: 'Gerencia todos os aspectos da organização',
    isSystem: false,
  };

  describe('create', () => {
    it('deve criar um role com propriedades válidas', () => {
      const role = Role.create(validProps);

      expect(role.id).toBeDefined();
      expect(role.organizationId).toBe(VALID_ORG_ID);
      expect(role.name).toBe(validProps.name);
      expect(role.code).toBe('ORG_ADMIN');
      expect(role.description).toBe(validProps.description);
      expect(role.isSystem).toBe(false);
      expect(role.createdAt).toBeInstanceOf(Date);
      expect(role.updatedAt).toBeInstanceOf(Date);
    });

    it('deve usar id fornecido quando informado', () => {
      const role = Role.create({ ...validProps, id: VALID_ROLE_ID });
      expect(role.id).toBe(VALID_ROLE_ID);
    });

    it('deve retornar description como null se não fornecido', () => {
      const role = Role.create({ ...validProps, description: undefined });
      expect(role.description).toBeNull();
    });

    it('deve normalizar code para uppercase', () => {
      const role = Role.create({ ...validProps, code: 'org_admin' });
      expect(role.code).toBe('ORG_ADMIN');
    });

    it('deve lançar exceção para organizationId com formato inválido', () => {
      expect(() =>
        Role.create({ ...validProps, organizationId: 'not-a-uuid' }),
      ).toThrow(new DomainException(RoleErrorMessages.ORGANIZATION_ID_INVALID));
    });

    it('deve permitir organizationId nulo para roles de sistema', () => {
      const role = Role.create({
        ...validProps,
        organizationId: null,
        isSystem: true,
      });
      expect(role.organizationId).toBeNull();
      expect(role.isSystem).toBe(true);
    });

    it('deve lançar exceção para name vazio', () => {
      expect(() => Role.create({ ...validProps, name: '' })).toThrow(
        new DomainException(RoleErrorMessages.NAME_REQUIRED),
      );
    });

    it('deve lançar exceção para code vazio', () => {
      expect(() => Role.create({ ...validProps, code: '' })).toThrow(
        new DomainException(RoleErrorMessages.CODE_REQUIRED),
      );
    });

    it('deve lançar exceção para code com formato inválido', () => {
      expect(() =>
        Role.create({ ...validProps, code: 'invalid code' }),
      ).toThrow(new DomainException(RoleErrorMessages.CODE_INVALID_FORMAT));
    });
  });

  describe('createSystemRole', () => {
    it('deve criar um role de sistema com propriedades válidas', () => {
      const systemRole = Role.createSystemRole({
        name: 'Super Admin',
        code: 'SUPER_ADMIN',
        description: 'Acesso total ao sistema',
      });

      expect(systemRole.id).toBeDefined();
      expect(systemRole.organizationId).toBeNull();
      expect(systemRole.name).toBe('Super Admin');
      expect(systemRole.code).toBe('SUPER_ADMIN');
      expect(systemRole.description).toBe('Acesso total ao sistema');
      expect(systemRole.isSystem).toBe(true);
    });

    it('deve usar id fornecido para role de sistema', () => {
      const systemRole = Role.createSystemRole({
        id: VALID_ROLE_ID,
        name: 'Viewer',
        code: 'VIEWER',
      });
      expect(systemRole.id).toBe(VALID_ROLE_ID);
    });
  });

  describe('update', () => {
    let role: Role;

    beforeEach(async () => {
      role = Role.create(validProps);
      // Introduce a small delay to ensure updatedAt is different from createdAt
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    it('deve atualizar o nome e a descrição', () => {
      role.update({ name: 'Novo Nome', description: 'Nova Descrição' });

      expect(role.name).toBe('Novo Nome');
      expect(role.description).toBe('Nova Descrição');
      expect(role.updatedAt.getTime()).toBeGreaterThan(
        role.createdAt.getTime(),
      );
    });

    it('deve atualizar apenas o nome', () => {
      role.update({ name: 'Apenas Nome' });
      expect(role.name).toBe('Apenas Nome');
      expect(role.description).toBe(validProps.description);
    });

    it('deve atualizar apenas a descrição', () => {
      role.update({ description: 'Apenas Descrição' });
      expect(role.name).toBe(validProps.name);
      expect(role.description).toBe('Apenas Descrição');
    });

    it('deve lançar exceção ao tentar atualizar um role de sistema', () => {
      const systemRole = Role.createSystemRole({
        name: 'Super Admin',
        code: 'SUPER_ADMIN',
      });

      expect(() => systemRole.update({ name: 'Admin Modificado' })).toThrow(
        new DomainException(RoleErrorMessages.IS_SYSTEM_IMMUTABLE),
      );
    });

    it('deve lançar exceção para name vazio no update', () => {
      expect(() => role.update({ name: '' })).toThrow(
        new DomainException(RoleErrorMessages.NAME_REQUIRED),
      );
    });
  });

  describe('toJSON', () => {
    it('deve retornar todas as propriedades corretamente', () => {
      const role = Role.create({ ...validProps, id: VALID_ROLE_ID });
      const json = role.toJSON();

      expect(json).toEqual({
        id: VALID_ROLE_ID,
        organizationId: VALID_ORG_ID,
        name: validProps.name,
        code: validProps.code,
        description: validProps.description,
        isSystem: validProps.isSystem,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
      });
    });
  });
});
