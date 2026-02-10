import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationModuleErrorMessages } from '../../constants/error-messages';
import { OrganizationModule } from '../organization-module.entity';

const VALID_ORG_ID = '550e8400-e29b-41d4-a716-446655440000';
const VALID_MODULE_ID = '660e8400-e29b-41d4-a716-446655440000';

describe('OrganizationModule Entity', () => {
  const validProps = {
    organizationId: VALID_ORG_ID,
    moduleId: VALID_MODULE_ID,
  };

  describe('create', () => {
    it('should create an organization module with valid properties', () => {
      const orgModule = OrganizationModule.create(validProps);

      expect(orgModule.id).toBeDefined();
      expect(orgModule.organizationId).toBe(VALID_ORG_ID);
      expect(orgModule.moduleId).toBe(VALID_MODULE_ID);
      expect(orgModule.isActive).toBe(false);
      expect(orgModule.activatedAt).toBeNull();
      expect(orgModule.deactivatedAt).toBeNull();
      expect(orgModule.createdAt).toBeInstanceOf(Date);
      expect(orgModule.updatedAt).toBeInstanceOf(Date);
    });

    it('should use provided id when supplied', () => {
      const id = '770e8400-e29b-41d4-a716-446655440000';
      const orgModule = OrganizationModule.create({ ...validProps, id });

      expect(orgModule.id).toBe(id);
    });

    it('should allow isActive to be set to true on creation', () => {
      const orgModule = OrganizationModule.create({ ...validProps, isActive: true });
      expect(orgModule.isActive).toBe(true);
    });

    it('should throw an exception for empty organizationId', () => {
      expect(() =>
        OrganizationModule.create({ ...validProps, organizationId: '' }),
      ).toThrow(
        new DomainException(
          OrganizationModuleErrorMessages.ORGANIZATION_ID_REQUIRED,
        ),
      );
    });

    it('should throw an exception for invalid organizationId format', () => {
      expect(() =>
        OrganizationModule.create({
          ...validProps,
          organizationId: 'not-a-uuid',
        }),
      ).toThrow(
        new DomainException(
          OrganizationModuleErrorMessages.ORGANIZATION_ID_INVALID,
        ),
      );
    });

    it('should throw an exception for empty moduleId', () => {
      expect(() =>
        OrganizationModule.create({ ...validProps, moduleId: '' }),
      ).toThrow(
        new DomainException(OrganizationModuleErrorMessages.MODULE_ID_REQUIRED),
      );
    });

    it('should throw an exception for invalid moduleId format', () => {
      expect(() =>
        OrganizationModule.create({ ...validProps, moduleId: 'not-a-uuid' }),
      ).toThrow(
        new DomainException(OrganizationModuleErrorMessages.MODULE_ID_INVALID),
      );
    });
  });

  describe('activate', () => {
    it('should activate an inactive organization module', () => {
      const orgModule = OrganizationModule.create({ ...validProps, isActive: false });
      orgModule.activate();

      expect(orgModule.isActive).toBe(true);
      expect(orgModule.activatedAt).toBeInstanceOf(Date);
      expect(orgModule.deactivatedAt).toBeNull();
      expect(orgModule.updatedAt).toBeInstanceOf(Date);
    });

    it('should not change activatedAt/updatedAt if already active', () => {
      const activatedAt = new Date();
      const updatedAt = new Date();
      const orgModule = OrganizationModule.create({
        ...validProps,
        isActive: true,
        activatedAt,
        updatedAt,
      });

      orgModule.activate();

      expect(orgModule.isActive).toBe(true);
      expect(orgModule.activatedAt).toBe(activatedAt);
      expect(orgModule.updatedAt).toBe(updatedAt);
    });
  });

  describe('deactivate', () => {
    it('should deactivate an active organization module', () => {
      const activatedAt = new Date();
      const orgModule = OrganizationModule.create({
        ...validProps,
        isActive: true,
        activatedAt,
      });
      orgModule.deactivate();

      expect(orgModule.isActive).toBe(false);
      expect(orgModule.deactivatedAt).toBeInstanceOf(Date);
      expect(orgModule.activatedAt).toBe(activatedAt); // activatedAt should remain
      expect(orgModule.updatedAt).toBeInstanceOf(Date);
    });

    it('should not change deactivatedAt/updatedAt if already inactive', () => {
      const deactivatedAt = new Date();
      const updatedAt = new Date();
      const orgModule = OrganizationModule.create({
        ...validProps,
        isActive: false,
        deactivatedAt,
        updatedAt,
      });

      orgModule.deactivate();

      expect(orgModule.isActive).toBe(false);
      expect(orgModule.deactivatedAt).toBe(deactivatedAt);
      expect(orgModule.updatedAt).toBe(updatedAt);
    });
  });

  describe('toJSON', () => {
    it('should return all properties correctly', () => {
      const activatedAt = new Date();
      const createdAt = new Date();
      const updatedAt = new Date();
      const orgModule = OrganizationModule.create({
        ...validProps,
        id: 'some-uuid',
        isActive: true,
        activatedAt,
        createdAt,
        updatedAt,
      });
      const json = orgModule.toJSON();

      expect(json).toEqual({
        id: 'some-uuid',
        organizationId: VALID_ORG_ID,
        moduleId: VALID_MODULE_ID,
        isActive: true,
        activatedAt: activatedAt,
        deactivatedAt: null,
        createdAt: createdAt,
        updatedAt: updatedAt,
      });
    });
  });
});
