import { Module } from '../entities/module.entity';

export abstract class ModuleRepository {
  abstract findById(id: string): Promise<Module | null>;
}
