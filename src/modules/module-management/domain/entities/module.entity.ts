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
  private _name: string;
  private _description: string | null;
  private _icon: string | null;
  private _isActive: boolean;
  private _sortOrder: number;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: Required<ModuleProps>) {
    this.id = props.id;
    this.code = props.code;
    this._name = props.name;
    this._description = props.description;
    this._icon = props.icon;
    this._isActive = props.isActive;
    this._sortOrder = props.sortOrder;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get icon(): string | null {
    return this._icon;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get sortOrder(): number {
    return this._sortOrder;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  public static create(props: ModuleProps): Module {
    Module.validateCode(props.code);
    Module.validateName(props.name);
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

  public update(props: Partial<Pick<ModuleProps, 'name' | 'description' | 'icon' | 'sortOrder'>>): Module {
    if (props.name !== undefined) {
      Module.validateName(props.name);
      this._name = props.name;
    }
    if (props.description !== undefined) {
      this._description = props.description;
    }
    if (props.icon !== undefined) {
      this._icon = props.icon;
    }
    if (props.sortOrder !== undefined) {
      this._sortOrder = props.sortOrder;
    }
    this._updatedAt = new Date();
    return this;
  }

  public activate(): void {
    if (this._isActive) {
      return;
    }
    this._isActive = true;
    this._updatedAt = new Date();
  }

  public deactivate(): void {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    this._updatedAt = new Date();
  }

  private static validateCode(code: string): void {
    if (!code) {
      throw new DomainException(ModuleErrorMessages.CODE_REQUIRED);
    }
  }

  private static validateName(name: string): void {
    if (!name) {
      throw new DomainException(ModuleErrorMessages.NAME_REQUIRED);
    }
  }

  public toJSON() {
    return {
      id: this.id,
      code: this.code,
      name: this._name,
      description: this._description,
      icon: this._icon,
      isActive: this._isActive,
      sortOrder: this._sortOrder,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
