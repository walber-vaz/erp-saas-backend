import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserRoleErrorMessages } from '../../constants/error-messages';
import { UserRole } from '../user-role.entity';

describe('UserRole Entity', () => {
  const validProps = {
    userId: uuidv4(),
    roleId: uuidv4(),
    assignedBy: uuidv4(),
  };

  describe('create', () => {
    it('should create a user-role with valid properties', () => {
      const userRole = UserRole.create(validProps);

      expect(userRole.id).toBeDefined();
      expect(userRole.userId).toBe(validProps.userId);
      expect(userRole.roleId).toBe(validProps.roleId);
      expect(userRole.assignedBy).toBe(validProps.assignedBy);
      expect(userRole.expiresAt).toBeNull();
      expect(userRole.createdAt).toBeInstanceOf(Date);
    });

    it('should create a user-role with an expiration date', () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      const userRole = UserRole.create({ ...validProps, expiresAt });

      expect(userRole.expiresAt).toEqual(expiresAt);
    });

    it('should throw an exception for an empty userId', () => {
      expect(() => UserRole.create({ ...validProps, userId: '' })).toThrow(
        new DomainException(UserRoleErrorMessages.USER_ID_REQUIRED),
      );
    });

    it('should throw an exception for an invalid userId format', () => {
      expect(() =>
        UserRole.create({ ...validProps, userId: 'not-a-uuid' }),
      ).toThrow(new DomainException(UserRoleErrorMessages.USER_ID_INVALID));
    });

    it('should throw an exception for an empty roleId', () => {
      expect(() => UserRole.create({ ...validProps, roleId: '' })).toThrow(
        new DomainException(UserRoleErrorMessages.ROLE_ID_REQUIRED),
      );
    });

    it('should throw an exception for an invalid roleId format', () => {
      expect(() =>
        UserRole.create({ ...validProps, roleId: 'not-a-uuid' }),
      ).toThrow(new DomainException(UserRoleErrorMessages.ROLE_ID_INVALID));
    });

    it('should throw an exception for an empty assignedBy', () => {
      expect(() => UserRole.create({ ...validProps, assignedBy: '' })).toThrow(
        new DomainException(UserRoleErrorMessages.ASSIGNED_BY_REQUIRED),
      );
    });

    it('should throw an exception for an invalid assignedBy format', () => {
      expect(() =>
        UserRole.create({ ...validProps, assignedBy: 'not-a-uuid' }),
      ).toThrow(new DomainException(UserRoleErrorMessages.ASSIGNED_BY_INVALID));
    });
  });

  describe('isExpired', () => {
    it('should return false if expiresAt is null', () => {
      const userRole = UserRole.create(validProps);
      expect(userRole.isExpired()).toBe(false);
    });

    it('should return false if expiresAt is in the future', () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1);
      const userRole = UserRole.create({ ...validProps, expiresAt });
      expect(userRole.isExpired()).toBe(false);
    });

    it('should return true if expiresAt is in the past', () => {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() - 1);
      const userRole = UserRole.create({ ...validProps, expiresAt });
      expect(userRole.isExpired()).toBe(true);
    });
  });

  describe('toJSON', () => {
    it('should return all properties correctly', () => {
      const userRole = UserRole.create(validProps);
      const json = userRole.toJSON();

      expect(json).toEqual({
        id: userRole.id,
        userId: userRole.userId,
        roleId: userRole.roleId,
        assignedBy: userRole.assignedBy,
        expiresAt: userRole.expiresAt,
        createdAt: userRole.createdAt,
      });
    });
  });
});
