import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { RoleInheritanceErrorMessages } from '../constants/error-messages';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface RoleInheritanceProps {
  id?: string;
  parentRoleId: string;
  childRoleId: string;
  createdAt?: Date;
}

export class RoleInheritance {
  readonly id: string;
  readonly parentRoleId: string;
  readonly childRoleId: string;
  readonly createdAt: Date;

  private constructor(props: Required<RoleInheritanceProps>) {
    this.id = props.id;
    this.parentRoleId = props.parentRoleId;
    this.childRoleId = props.childRoleId;
    this.createdAt = props.createdAt;
  }

  public static create(props: RoleInheritanceProps): RoleInheritance {
    RoleInheritance.validate(props);
    return new RoleInheritance({
      id: props.id ?? uuidv7(),
      parentRoleId: props.parentRoleId,
      childRoleId: props.childRoleId,
      createdAt: props.createdAt ?? new Date(),
    });
  }

  private static validate(props: RoleInheritanceProps) {
    if (!props.parentRoleId) {
      throw new DomainException(
        RoleInheritanceErrorMessages.PARENT_ROLE_ID_REQUIRED,
      );
    }
    if (!UUID_REGEX.test(props.parentRoleId)) {
      throw new DomainException(
        RoleInheritanceErrorMessages.PARENT_ROLE_ID_INVALID,
      );
    }
    if (!props.childRoleId) {
      throw new DomainException(
        RoleInheritanceErrorMessages.CHILD_ROLE_ID_REQUIRED,
      );
    }
    if (!UUID_REGEX.test(props.childRoleId)) {
      throw new DomainException(
        RoleInheritanceErrorMessages.CHILD_ROLE_ID_INVALID,
      );
    }
    if (props.parentRoleId === props.childRoleId) {
      throw new DomainException(
        RoleInheritanceErrorMessages.CANNOT_INHERIT_SELF,
      );
    }
  }

  public toJSON() {
    return {
      id: this.id,
      parentRoleId: this.parentRoleId,
      childRoleId: this.childRoleId,
      createdAt: this.createdAt,
    };
  }
}
