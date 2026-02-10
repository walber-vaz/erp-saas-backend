import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '@modules/auth/presentation/decorators/public.decorator';
import { PERMISSIONS_KEY } from '../decorators/require-permission.decorator';
import { PermissionCheckerService } from '@modules/rbac/application/services/permission-checker.service';
import { CheckModuleAccessUseCase } from '@modules/module-management/application/use-cases/check-module-access.use-case';
import { OrganizationModuleErrorMessages } from '@modules/module-management/domain/constants/error-messages';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionCheckerService: PermissionCheckerService,
    private readonly checkModuleAccessUC: CheckModuleAccessUseCase,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Acesso negado');
    }

    const moduleCodes = new Set<string>();
    for (const permission of requiredPermissions) {
      const moduleCode = permission.split('_')[0];
      if (moduleCode) {
        moduleCodes.add(moduleCode);
      }
    }

    for (const moduleCode of Array.from(moduleCodes)) {
      const hasModuleAccess = await this.checkModuleAccessUC.execute(
        user.organizationId,
        moduleCode,
      );
      if (!hasModuleAccess) {
        throw new ForbiddenException(
          OrganizationModuleErrorMessages.MODULE_NOT_CONTRACTED,
        );
      }
    }

    for (const permission of requiredPermissions) {
      const hasPermission =
        await this.permissionCheckerService.userHasPermission(
          user.userId,
          permission,
        );

      if (!hasPermission) {
        throw new ForbiddenException('Permissão insuficiente');
      }
    }

    return true;
  }
}
