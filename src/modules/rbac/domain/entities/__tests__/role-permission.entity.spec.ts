import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RolePermissionErrorMessages } from '../../constants/error-messages';
import { RolePermission } from '../role-permission.entity';

describe('RolePermission Entity', () => {
  const validProps = {
    roleId: uuidv4(),
    permissionId: uuidv4(),
    conditions: { ip_range: '192.168.1.0/24' },
  };

  describe('create', () => {
    it('should create a role-permission with valid properties', () => {
      const rolePermission = RolePermission.create(validProps);

      expect(rolePermission.id).toBeDefined();
      expect(rolePermission.roleId).toBe(validProps.roleId);
      expect(rolePermission.permissionId).toBe(validProps.permissionId);
      expect(rolePermission.conditions).toEqual(validProps.conditions);
      expect(rolePermission.createdAt).toBeInstanceOf(Date);
    });

    it('should use provided id when supplied', () => {
      const id = uuidv4();
      const rolePermission = RolePermission.create({ ...validProps, id });

      expect(rolePermission.id).toBe(id);
    });

    it('should set conditions to null if not provided', () => {
      const rolePermission = RolePermission.create({
        ...validProps,
        conditions: undefined,
      });
      expect(rolePermission.conditions).toBeNull();
    });

    it('should throw an exception for an empty roleId', () => {
      expect(() =>
        RolePermission.create({ ...validProps, roleId: '' }),
      ).toThrow(
        new DomainException(RolePermissionErrorMessages.ROLE_ID_REQUIRED),
      );
    });

    it('should throw an exception for an invalid roleId format', () => {
      expect(() =>
        RolePermission.create({ ...validProps, roleId: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(RolePermissionErrorMessages.ROLE_ID_INVALID),
      );
    });

    it('should throw an exception for an empty permissionId', () => {
      expect(() =>
        RolePermission.create({ ...validProps, permissionId: '' }),
      ).toThrow(
        new DomainException(RolePermissionErrorMessages.PERMISSION_ID_REQUIRED),
      );
    });

    it('should throw an exception for an invalid permissionId format', () => {
      expect(() =>
        RolePermission.create({ ...validProps, permissionId: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(RolePermissionErrorMessages.PERMISSION_ID_INVALID),
      );
    });
  });

  describe('toJSON', () => {
    it('should return all properties correctly', () => {
      const rolePermission = RolePermission.create(validProps);
      const json = rolePermission.toJSON();

      expect(json).toEqual({
        id: rolePermission.id,
        roleId: rolePermission.roleId,
        permissionId: rolePermission.permissionId,
        conditions: rolePermission.conditions,
        createdAt: rolePermission.createdAt,
      });
    });
  });
});
