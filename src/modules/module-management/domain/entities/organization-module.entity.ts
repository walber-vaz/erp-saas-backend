import { v7 as uuidv7 } from 'uuid';
import { DomainException } from '@shared/exceptions/domain.exception';
import { OrganizationModuleErrorMessages } from '../constants/error-messages';

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export interface OrganizationModuleProps {
  id?: string;
  organizationId: string;
  moduleId: string;
  isActive?: boolean;
  activatedAt?: Date | null;
  deactivatedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export class OrganizationModule {
  readonly id: string;
  readonly organizationId: string;
  readonly moduleId: string;
  private _isActive: boolean;
  private _activatedAt: Date | null;
  private _deactivatedAt: Date | null;
  readonly createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: Required<OrganizationModuleProps>) {
    this.id = props.id;
    this.organizationId = props.organizationId;
    this.moduleId = props.moduleId;
    this._isActive = props.isActive;
    this._activatedAt = props.activatedAt;
    this._deactivatedAt = props.deactivatedAt;
    this.createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get activatedAt(): Date | null {
    return this._activatedAt;
  }

  get deactivatedAt(): Date | null {
    return this._deactivatedAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  static create(props: OrganizationModuleProps): OrganizationModule {
    OrganizationModule.validate(props);
    const now = new Date();
    return new OrganizationModule({
      id: props.id ?? uuidv7(),
      organizationId: props.organizationId,
      moduleId: props.moduleId,
      isActive: props.isActive ?? false, // Default to false, explicitly activated
      activatedAt: props.activatedAt ?? null,
      deactivatedAt: props.deactivatedAt ?? null,
      createdAt: props.createdAt ?? now,
      updatedAt: props.updatedAt ?? now,
    });
  }

  activate(): void {
    if (this._isActive) {
      return;
    }
    this._isActive = true;
    this._activatedAt = new Date();
    this._deactivatedAt = null;
    this._updatedAt = new Date();
  }

  deactivate(): void {
    if (!this._isActive) {
      return;
    }
    this._isActive = false;
    this._deactivatedAt = new Date();
    this._updatedAt = new Date();
  }

  private static validate(props: OrganizationModuleProps) {
    if (!props.organizationId) {
      throw new DomainException(
        OrganizationModuleErrorMessages.ORGANIZATION_ID_REQUIRED,
      );
    }
    if (!UUID_REGEX.test(props.organizationId)) {
      throw new DomainException(
        OrganizationModuleErrorMessages.ORGANIZATION_ID_INVALID,
      );
    }
    if (!props.moduleId) {
      throw new DomainException(
        OrganizationModuleErrorMessages.MODULE_ID_REQUIRED,
      );
    }
    if (!UUID_REGEX.test(props.moduleId)) {
      throw new DomainException(
        OrganizationModuleErrorMessages.MODULE_ID_INVALID,
      );
    }
  }

  toJSON() {
    return {
      id: this.id,
      organizationId: this.organizationId,
      moduleId: this.moduleId,
      isActive: this._isActive,
      activatedAt: this._activatedAt,
      deactivatedAt: this._deactivatedAt,
      createdAt: this.createdAt,
      updatedAt: this._updatedAt,
    };
  }
}
