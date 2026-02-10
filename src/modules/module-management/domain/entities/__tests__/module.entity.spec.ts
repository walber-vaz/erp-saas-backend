import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '../../constants/error-messages';
import { Module } from '../module.entity';

describe('Module Entity', () => {
  const validProps = {
    code: 'FINANCE',
    name: 'Financeiro',
    description: 'Módulo para gestão financeira',
  };

  describe('create', () => {
    it('should create a module with valid properties', () => {
      const module = Module.create(validProps);

      expect(module.id).toBeDefined();
      expect(module.code).toBe(validProps.code);
      expect(module.name).toBe(validProps.name);
      expect(module.description).toBe(validProps.description);
      expect(module.isActive).toBe(true);
      expect(module.createdAt).toBeInstanceOf(Date);
      expect(module.updatedAt).toBeInstanceOf(Date);
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

    it('should set isActive to true if not provided', () => {
      const module = Module.create({ ...validProps, isActive: undefined });
      expect(module.isActive).toBe(true);
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

  describe('toJSON', () => {
    it('should return all properties correctly', () => {
      const module = Module.create(validProps);
      const json = module.toJSON();

      expect(json).toEqual({
        id: module.id,
        code: validProps.code,
        name: validProps.name,
        description: validProps.description,
        isActive: module.isActive,
        createdAt: module.createdAt,
        updatedAt: module.updatedAt,
      });
    });
  });
});
