import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '../../constants/error-messages';
import { Module } from '../module.entity';

describe('Module Entity', () => {
  const validProps = {
    code: 'FINANCE',
    name: 'Financeiro',
    description: 'Módulo para gestão financeira',
    icon: 'fa-money',
    sortOrder: 1,
  };

  describe('create', () => {
    it('should create a module with valid properties', () => {
      const module = Module.create(validProps);

      expect(module.id).toBeDefined();
      expect(module.code).toBe(validProps.code);
      expect(module.name).toBe(validProps.name);
      expect(module.description).toBe(validProps.description);
      expect(module.icon).toBe(validProps.icon);
      expect(module.isActive).toBe(true);
      expect(module.sortOrder).toBe(validProps.sortOrder);
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert code to uppercase', () => {
      const module = Module.create({ ...validProps, code: 'inventory' });
      expect(module.code).toBe('INVENTORY');
    });

    it('should use provided id when supplied', () => {
      const id = '660e8400-e29b-41d4-a716-446655440000';
      const module = Module.create({ ...validProps, id });

      expect(module.id).toBe(id);
    });

    it('should set description to null if not provided', () => {
      const module = Module.create({ ...validProps, description: undefined });
      expect(module.description).toBeNull();
    });

    it('should set icon to null if not provided', () => {
      const module = Module.create({ ...validProps, icon: undefined });
      expect(module.icon).toBeNull();
    });

    it('should set isActive to true if not provided', () => {
      const module = Module.create({ ...validProps, isActive: undefined });
      expect(module.isActive).toBe(true);
    });

    it('should set sortOrder to 0 if not provided', () => {
      const module = Module.create({ ...validProps, sortOrder: undefined });
      expect(module.sortOrder).toBe(0);
    });

    it('should throw an exception for empty code', () => {
      expect(() => Module.create({ ...validProps, code: '' })).toThrow(
        new DomainException(ModuleErrorMessages.CODE_REQUIRED),
      );
    });

    it('should throw an exception for empty name', () => {
      expect(() => Module.create({ ...validProps, name: '' })).toThrow(
        new DomainException(ModuleErrorMessages.NAME_REQUIRED),
      );
    });
  });

  describe('update', () => {
    it('should update module properties', () => {
      const module = Module.create(validProps);
      const newProps = {
        name: 'Novo Nome',
        description: 'Nova descrição',
        icon: 'fa-new-icon',
        sortOrder: 2,
      };
      const updatedModule = module.update(newProps);

      expect(updatedModule.name).toBe(newProps.name);
      expect(updatedModule.description).toBe(newProps.description);
      expect(updatedModule.icon).toBe(newProps.icon);
      expect(updatedModule.sortOrder).toBe(newProps.sortOrder);
      expect(updatedModule.updatedAt).toBeInstanceOf(Date);
      expect(updatedModule.updatedAt.getTime()).toBeGreaterThanOrEqual(
        module.updatedAt.getTime(),
      );
    });

    it('should only update provided properties', () => {
      const module = Module.create(validProps);
      const newProps = { name: 'Only Name' };
      const updatedModule = module.update(newProps);

      expect(updatedModule.name).toBe(newProps.name);
      expect(updatedModule.description).toBe(validProps.description);
      expect(updatedModule.icon).toBe(validProps.icon);
      expect(updatedModule.sortOrder).toBe(validProps.sortOrder);
    });

    it('should throw an exception if name is updated to empty', () => {
      const module = Module.create(validProps);
      expect(() => module.update({ name: '' })).toThrow(
        new DomainException(ModuleErrorMessages.NAME_REQUIRED),
      );
    });

    it('should update description to null if explicitly provided as null', () => {
      const module = Module.create(validProps);
      const updatedModule = module.update({ description: null });
      expect(updatedModule.description).toBeNull();
    });

    it('should update icon to null if explicitly provided as null', () => {
      const module = Module.create(validProps);
      const updatedModule = module.update({ icon: null });
      expect(updatedModule.icon).toBeNull();
    });
  });

  describe('activate', () => {
    it('should activate an inactive module', () => {
      const module = Module.create({ ...validProps, isActive: false });
      module.activate();
      expect(module.isActive).toBe(true);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('should not change updatedAt if module is already active', () => {
      const module = Module.create({ ...validProps, isActive: true });
      const originalUpdatedAt = module.updatedAt;
      module.activate();
      expect(module.isActive).toBe(true);
      expect(module.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('deactivate', () => {
    it('should deactivate an active module', () => {
      const module = Module.create({ ...validProps, isActive: true });
      module.deactivate();
      expect(module.isActive).toBe(false);
      expect(module.updatedAt).toBeInstanceOf(Date);
    });

    it('should not change updatedAt if module is already inactive', () => {
      const module = Module.create({ ...validProps, isActive: false });
      const originalUpdatedAt = module.updatedAt;
      module.deactivate();
      expect(module.isActive).toBe(false);
      expect(module.updatedAt).toBe(originalUpdatedAt);
    });
  });

  describe('toJSON', () => {
    it('should return all properties correctly', () => {
      const module = Module.create(validProps);
      const json = module.toJSON();

      expect(json).toEqual({
        id: module.id,
        code: validProps.code,
        name: validProps.name,
        description: validProps.description,
        icon: validProps.icon,
        isActive: module.isActive,
        sortOrder: validProps.sortOrder,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      });
    });
  });
});
