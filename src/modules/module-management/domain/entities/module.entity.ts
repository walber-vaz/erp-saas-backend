import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { ModuleErrorMessages } from '../constants/error-messages';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface ModuleProps {
  id?: string;
  code: string;
  name: string;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Module {
  readonly id: string;
  readonly code: string;
  readonly name: string;
  readonly description: string | null;
  readonly icon: string | null;
  readonly isActive: boolean;
  readonly sortOrder: number;
  readonly createdAt: Date;
  readonly updatedAt: Date;

  private constructor(props: Required<ModuleProps>) {
    this.id = props.id;
    this.code = props.code;
    this.name = props.name;
    this.description = props.description;
    this.icon = props.icon;
    this.isActive = props.isActive;
    this.sortOrder = props.sortOrder;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  public static create(props: ModuleProps): Module {
    Module.validate(props);
    const now = new Date();
    return new Module({
      id: props.id ?? uuidv7(),
      code: props.code.toUpperCase(),
      name: props.name,
      description: props.description ?? null,
      icon: props.icon ?? null,
      isActive: props.isActive ?? true,
      sortOrder: props.sortOrder ?? 0,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  public update(props: Partial<ModuleProps>): Module {
    const updatedName = props.name !== undefined ? props.name : this.name;
    const updatedDescription =
      props.description !== undefined ? props.description : this.description;
    const updatedIcon = props.icon !== undefined ? props.icon : this.icon;
    const updatedSortOrder =
      props.sortOrder !== undefined ? props.sortOrder : this.sortOrder;

    if (!updatedName) {
      throw new DomainException(ModuleErrorMessages.NAME_REQUIRED);
    }

    const updatedModule = new Module({
      id: this.id,
      code: this.code,
      name: updatedName,
      description: updatedDescription,
      icon: updatedIcon,
      isActive: this.isActive,
      sortOrder: updatedSortOrder,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });

    return updatedModule;
  }

  public activate(): void {
    if (this.isActive) {
      return;
    }
    Object.assign(this, { isActive: true, updatedAt: new Date() });
  }

  public deactivate(): void {
    if (!this.isActive) {
      return;
    }
    Object.assign(this, { isActive: false, updatedAt: new Date() });
  }

  private static validate(props: ModuleProps) {
    if (!props.code) {
      throw new DomainException(ModuleErrorMessages.CODE_REQUIRED);
    }
    if (!props.name) {
      throw new DomainException(ModuleErrorMessages.NAME_REQUIRED);
    }
  }

  public toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this.name,
      description: this.description,
      icon: this.icon,
      isActive: this.isActive,
      sortOrder: this.sortOrder,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
