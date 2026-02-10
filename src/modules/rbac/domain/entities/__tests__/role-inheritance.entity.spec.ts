import { v4 as uuidv4 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleInheritanceErrorMessages } from '../../constants/error-messages';
import { RoleInheritance } from '../role-inheritance.entity';

describe('RoleInheritance Entity', () => {
  const validProps = {
    parentRoleId: uuidv4(),
    childRoleId: uuidv4(),
  };

  describe('create', () => {
    it('should create a role-inheritance with valid properties', () => {
      const roleInheritance = RoleInheritance.create(validProps);

      expect(roleInheritance.id).toBeDefined();
      expect(roleInheritance.parentRoleId).toBe(validProps.parentRoleId);
      expect(roleInheritance.childRoleId).toBe(validProps.childRoleId);
      expect(roleInheritance.createdAt).toBeInstanceOf(Date);
    });

    it('should throw an exception for an empty parentRoleId', () => {
      expect(() =>
        RoleInheritance.create({ ...validProps, parentRoleId: '' }),
      ).toThrow(
        new DomainException(
          RoleInheritanceErrorMessages.PARENT_ROLE_ID_REQUIRED,
        ),
      );
    });

    it('should throw an exception for an invalid parentRoleId format', () => {
      expect(() =>
        RoleInheritance.create({ ...validProps, parentRoleId: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(
          RoleInheritanceErrorMessages.PARENT_ROLE_ID_INVALID,
        ),
      );
    });

    it('should throw an exception for an empty childRoleId', () => {
      expect(() =>
        RoleInheritance.create({ ...validProps, childRoleId: '' }),
      ).toThrow(
        new DomainException(
          RoleInheritanceErrorMessages.CHILD_ROLE_ID_REQUIRED,
        ),
      );
    });

    it('should throw an exception for an invalid childRoleId format', () => {
      expect(() =>
        RoleInheritance.create({ ...validProps, childRoleId: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(RoleInheritanceErrorMessages.CHILD_ROLE_ID_INVALID),
      );
    });

    it('should throw an exception if parentRoleId and childRoleId are the same', () => {
      const sameId = uuidv4();
      expect(() =>
        RoleInheritance.create({ parentRoleId: sameId, childRoleId: sameId }),
      ).toThrow(
        new DomainException(RoleInheritanceErrorMessages.CANNOT_INHERIT_SELF),
      );
    });
  });

  describe('toJSON', () => {
    it('should return all properties correctly', () => {
      const roleInheritance = RoleInheritance.create(validProps);
      const json = roleInheritance.toJSON();

      expect(json).toEqual({
        id: roleInheritance.id,
        parentRoleId: roleInheritance.parentRoleId,
        childRoleId: roleInheritance.childRoleId,
        createdAt: roleInheritance.createdAt,
      });
    });
  });
});
