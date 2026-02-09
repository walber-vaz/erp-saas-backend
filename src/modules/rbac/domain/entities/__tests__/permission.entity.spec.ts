import { DomainException } from '@shared/exceptions/domain.exception';
import { PermissionErrorMessages } from '../../constants/error-messages';
import { Permission } from '../permission.entity';

const VALID_MODULE_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_CODE = 'FINANCE_INVOICE_CREATE';

describe('Permission Entity', () => {
  const validProps = {
    moduleId: VALID_MODULE_ID,
    code: VALID_CODE,
    resource: 'Invoice',
    action: 'Create',
    description: 'Permissão para criar faturas',
  };

  describe('create', () => {
    it('deve criar uma permissão com propriedades válidas', () => {
      const permission = Permission.create(validProps);

      expect(permission.id).toBeDefined();
      expect(permission.moduleId).toBe(VALID_MODULE_ID);
      expect(permission.code).toBe(VALID_CODE);
      expect(permission.resource).toBe(validProps.resource);
      expect(permission.action).toBe(validProps.action);
      expect(permission.description).toBe(validProps.description);
      expect(permission.createdAt).toBeInstanceOf(Date);
    });

    it('deve usar id fornecido quando informado', () => {
      const id = '660e8400-e29b-41d4-a716-446655440000';
      const permission = Permission.create({ ...validProps, id });

      expect(permission.id).toBe(id);
    });

    it('deve retornar description como null se não fornecido', () => {
      const permission = Permission.create({
        ...validProps,
        description: undefined,
      });
      expect(permission.description).toBeNull();
    });

    it('deve lançar exceção para moduleId vazio', () => {
      expect(() => Permission.create({ ...validProps, moduleId: '' })).toThrow(
        new DomainException(PermissionErrorMessages.MODULE_ID_REQUIRED),
      );
    });

    it('deve lançar exceção para moduleId com formato inválido', () => {
      expect(() =>
        Permission.create({ ...validProps, moduleId: 'not-a-uuid' }),
      ).toThrow(new DomainException(PermissionErrorMessages.MODULE_ID_INVALID));
    });

    it('deve lançar exceção para code vazio', () => {
      expect(() => Permission.create({ ...validProps, code: '' })).toThrow(
        new DomainException(PermissionErrorMessages.CODE_REQUIRED),
      );
    });

    it('deve lançar exceção para code com formato inválido', () => {
      expect(() =>
        Permission.create({ ...validProps, code: 'invalid code' }),
      ).toThrow(
        new DomainException(PermissionErrorMessages.CODE_INVALID_FORMAT),
      );
    });
  });

  describe('generateCode', () => {
    it('deve gerar um código de permissão válido', () => {
      const moduleCode = 'RBAC';
      const resource = 'User';
      const action = 'Read';
      const code = Permission.generateCode(moduleCode, resource, action);

      expect(code).toBe('RBAC_USER_READ');
    });

    it('deve converter resource e action para maiúsculas', () => {
      const moduleCode = 'FINANCE';
      const resource = 'invoice';
      const action = 'create';
      const code = Permission.generateCode(moduleCode, resource, action);

      expect(code).toBe('FINANCE_INVOICE_CREATE');
    });
  });

  describe('toJSON', () => {
    it('deve retornar todas as propriedades corretamente', () => {
      const permission = Permission.create(validProps);
      const json = permission.toJSON();

      expect(json).toEqual({
        id: permission.id,
        moduleId: VALID_MODULE_ID,
        code: VALID_CODE,
        resource: validProps.resource,
        action: validProps.action,
        description: validProps.description,
        createdAt: permission.createdAt,
      });
    });
  });
});
