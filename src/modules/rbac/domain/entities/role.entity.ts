import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleErrorMessages } from '../constants/error-messages';

export interface RoleProps {
  id?: string;
  organizationId: string | null;
  name: string;
  code: string;
  description?: string | null;
  isSystem?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ROLE_CODE_REGEX = /^[A-Z0-9_]+$/;

export class Role {
  readonly id: string;
  readonly organizationId: string | null;
  private _name: string;
  readonly code: string;
  private _description: string | null;
  readonly isSystem: boolean;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: Required<RoleProps>) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this._name = props.name;
    this.code = props.code;
    this._description = props.description;
    this.isSystem = props.isSystem;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: RoleProps): Role {
    if (props.organizationId !== null) {
      Role.validateOrganizationId(props.organizationId);
    }
    Role.validateName(props.name);
    Role.validateCode(props.code);

    const now = new Date();
    return new Role({
      id: props.id ?? uuidv7(),
      organizationId: props.organizationId,
      name: props.name,
      code: props.code.toUpperCase(),
      description: props.description ?? null,
      isSystem: props.isSystem ?? false,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  static createSystemRole(
    props: Omit<RoleProps, 'organizationId' | 'isSystem'> & { id?: string },
  ): Role {
    Role.validateName(props.name);
    Role.validateCode(props.code);

    const now = new Date();
    return new Role({
      id: props.id ?? uuidv7(),
      organizationId: null, // System roles have null organizationId
      name: props.name,
      code: props.code.toUpperCase(),
      description: props.description ?? null,
      isSystem: true, // System roles are always isSystem: true
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  update(props: Partial<Pick<RoleProps, 'name' | 'description'>>): void {
    if (this.isSystem) {
      throw new DomainException(RoleErrorMessages.IS_SYSTEM_IMMUTABLE);
    }

    if (props.name !== undefined) {
      Role.validateName(props.name);
      this._name = props.name;
    }

    if (props.description !== undefined) {
      this._description = props.description;
    }

    this._updatedAt = new Date();
  }

  private static validateOrganizationId(organizationId: string): void {
    if (!UUID_REGEX.test(organizationId)) {
      throw new DomainException(RoleErrorMessages.ORGANIZATION_ID_INVALID);
    }
  }

  private static validateName(name: string): void {
    if (!name || name.trim().length < 2) {
      throw new DomainException(RoleErrorMessages.NAME_REQUIRED);
    }
  }

  private static validateCode(code: string): void {
    if (!code) {
      throw new DomainException(RoleErrorMessages.CODE_REQUIRED);
    }
    if (!ROLE_CODE_REGEX.test(code.toUpperCase())) {
      throw new DomainException(RoleErrorMessages.CODE_INVALID_FORMAT);
    }
  }

  toJSON() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      name: this._name,
      code: this.code,
      description: this._description,
      isSystem: this.isSystem,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
