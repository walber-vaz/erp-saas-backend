import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { UserRoleErrorMessages } from '../constants/error-messages';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface UserRoleProps {
  id?: string;
  userId: string;
  roleId: string;
  assignedBy: string;
  expiresAt?: Date | null;
  createdAt?: Date;
}

export class UserRole {
  readonly id: string;
  readonly userId: string;
  readonly roleId: string;
  readonly assignedBy: string;
  readonly expiresAt: Date | null;
  readonly createdAt: Date;

  private constructor(props: Required<UserRoleProps>) {
    this.id = props.id;
    this.userId = props.userId;
    this.roleId = props.roleId;
    this.assignedBy = props.assignedBy;
    this.expiresAt = props.expiresAt;
    this.createdAt = props.createdAt;
  }

  public static create(props: UserRoleProps): UserRole {
    UserRole.validate(props);
    return new UserRole({
      id: props.id ?? uuidv7(),
      userId: props.userId,
      roleId: props.roleId,
      assignedBy: props.assignedBy,
      expiresAt: props.expiresAt ?? null,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  public isExpired(): boolean {
    if (!this.expiresAt) {
      return false;
    }
    return new Date() > this.expiresAt;
  }

  private static validate(props: UserRoleProps) {
    if (!props.userId) {
      throw new DomainException(UserRoleErrorMessages.USER_ID_REQUIRED);
    }
    if (!UUID_REGEX.test(props.userId)) {
      throw new DomainException(UserRoleErrorMessages.USER_ID_INVALID);
    }
    if (!props.roleId) {
      throw new DomainException(UserRoleErrorMessages.ROLE_ID_REQUIRED);
    }
    if (!UUID_REGEX.test(props.roleId)) {
      throw new DomainException(UserRoleErrorMessages.ROLE_ID_INVALID);
    }
    if (!props.assignedBy) {
      throw new DomainException(UserRoleErrorMessages.ASSIGNED_BY_REQUIRED);
    }
    if (!UUID_REGEX.test(props.assignedBy)) {
      throw new DomainException(UserRoleErrorMessages.ASSIGNED_BY_INVALID);
    }
    if (props.expiresAt && !(props.expiresAt instanceof Date)) {
      throw new DomainException(UserRoleErrorMessages.EXPIRES_AT_INVALID);
    }
  }

  public toJSON() {
    return {
      id: this.id,
      userId: this.userId,
      roleId: this.roleId,
      assignedBy: this.assignedBy,
      expiresAt: this.expiresAt,
      createdAt: this.createdAt,
    };
  }
}
