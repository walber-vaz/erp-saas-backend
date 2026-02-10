import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RolePermissionErrorMessages } from '../constants/error-messages';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface RolePermissionProps {
  id?: string;
  roleId: string;
  permissionId: string;
  conditions?: Record<string, any> | null;
  createdAt?: Date;
}

export class RolePermission {
  readonly id: string;
  readonly roleId: string;
  readonly permissionId: string;
  readonly conditions: Record<string, any> | null;
  readonly createdAt: Date;

  private constructor(props: Required<RolePermissionProps>) {
    this.id = props.id;
    this.roleId = props.roleId;
    this.permissionId = props.permissionId;
    this.conditions = props.conditions;
    this.createdAt = props.createdAt;
  }

  public static create(props: RolePermissionProps): RolePermission {
    RolePermission.validate(props);
    return new RolePermission({
      id: props.id ?? uuidv7(),
      roleId: props.roleId,
      permissionId: props.permissionId,
      conditions: props.conditions ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  private static validate(props: RolePermissionProps) {
    if (!props.roleId) {
      throw new DomainException(RolePermissionErrorMessages.ROLE_ID_REQUIRED);
    }
    if (!UUID_REGEX.test(props.roleId)) {
      throw new DomainException(RolePermissionErrorMessages.ROLE_ID_INVALID);
    }
    if (!props.permissionId) {
      throw new DomainException(
        RolePermissionErrorMessages.PERMISSION_ID_REQUIRED,
      );
    }
    if (!UUID_REGEX.test(props.permissionId)) {
      throw new DomainException(
        RolePermissionErrorMessages.PERMISSION_ID_INVALID,
      );
    }
  }

  public toJSON() {
    return {
      id: this.id,
      roleId: this.roleId,
      permissionId: this.permissionId,
      conditions: this.conditions,
      createdAt: this.createdAt,
    };
  }
}
