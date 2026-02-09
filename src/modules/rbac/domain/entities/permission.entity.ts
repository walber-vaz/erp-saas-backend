import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { PermissionErrorMessages } from '../constants/error-messages';

export interface PermissionProps {
  id?: string;
  moduleId: string;
  code: string; // Made mandatory
  resource: string;
  action: string;
  description?: string | null;
  createdAt?: Date;
}

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const PERMISSION_CODE_REGEX = /^[A-Z0-9_]+$/;

export class Permission {
  readonly id: string;
  readonly moduleId: string;
  readonly code: string;
  private _resource: string;
  private _action: string;
  private _description: string | null;
  readonly createdAt: Date;

  private constructor(props: Required<PermissionProps>) {
    this.id = props.id;
    this.moduleId = props.moduleId;
    this.code = props.code;
    this._resource = props.resource;
    this._action = props.action;
    this._description = props.description;
    this.createdAt = props.createdAt;
  }

  get resource(): string {
    return this._resource;
  }

  get action(): string {
    return this._action;
  }

  get description(): string | null {
    return this._description;
  }

  static create(props: PermissionProps): Permission {
    Permission.validateModuleId(props.moduleId);

    const code = props.code;
    Permission.validateCode(code);

    return new Permission({
      id: props.id ?? uuidv7(),
      moduleId: props.moduleId,
      code,
      resource: props.resource,
      action: props.action,
      description: props.description ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  // Method to generate code based on module, resource, and action
  static generateCode(
    moduleCode: string,
    resource: string,
    action: string,
  ): string {
    return `${moduleCode}_${resource.toUpperCase()}_${action.toUpperCase()}`;
  }

  private static validateModuleId(moduleId: string): void {
    if (!moduleId) {
      throw new DomainException(PermissionErrorMessages.MODULE_ID_REQUIRED);
    }
    if (!UUID_REGEX.test(moduleId)) {
      throw new DomainException(PermissionErrorMessages.MODULE_ID_INVALID);
    }
  }

  private static validateCode(code: string): void {
    if (!code) {
      throw new DomainException(PermissionErrorMessages.CODE_REQUIRED);
    }
    if (!PERMISSION_CODE_REGEX.test(code)) {
      throw new DomainException(PermissionErrorMessages.CODE_INVALID_FORMAT);
    }
  }

  toJSON() {
    return {
      id: this.id,
      moduleId: this.moduleId,
      code: this.code,
      resource: this._resource,
      action: this._action,
      description: this._description,
      createdAt: this.createdAt,
    };
  }
}
