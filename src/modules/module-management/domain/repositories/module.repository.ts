import { Module } from '../entities/module.entity';

export abstract class ModuleRepository {
  abstract findById(id: string): Promise<Module | null>;
  abstract findByCode(code: string): Promise<Module | null>;
  abstract findAll(params?: { isActive?: boolean }): Promise<Module[]>;
  abstract create(module: Module): Promise<Module>;
  abstract update(module: Module): Promise<Module>;
  abstract delete(id: string): Promise<void>;
}
