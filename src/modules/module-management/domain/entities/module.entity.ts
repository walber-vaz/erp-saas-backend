import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '../constants/error-messages';

// A minimal Module entity for CreatePermissionUseCase dependency
export interface ModuleProps {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Module {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: Required<ModuleProps>) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.isActive = props.isActive;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: ModuleProps): Module {
    // Basic validation
    if (!props.code)
      throw new DomainException(ModuleErrorMessages.CODE_REQUIRED);
    if (!props.name)
      throw new DomainException(ModuleErrorMessages.NAME_REQUIRED);

    const now = new Date();
    return new Module({
      id: props.id ?? uuidv7(),
      code: props.code,
      name: props.name,
      description: props.description ?? null,
      isActive: props.isActive ?? true,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
