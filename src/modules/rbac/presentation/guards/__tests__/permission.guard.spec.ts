import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionGuard } from '../permission.guard';
import { PermissionCheckerService } from '@modules/rbac/application/services/permission-checker.service';
import { PERMISSIONS_KEY } from '../../decorators/require-permission.decorator';
import { IS_PUBLIC_KEY } from '@modules/auth/presentation/decorators/public.decorator';

const USER_ID = '550e8400-e29b-41d4-a716-446655440001';

const createMockExecutionContext = (user?: {
  userId: string;
}): ExecutionContext =>
  ({
    getHandler: vi.fn(),
    getClass: vi.fn(),
    switchToHttp: () => ({
      getRequest: () => ({ user }),
    }),
  }) as unknown as ExecutionContext;

describe('PermissionGuard', () => {
  let guard: PermissionGuard;
  let reflector: Reflector;
  let permissionChecker: { userHasPermission: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    reflector = new Reflector();
    permissionChecker = {
      userHasPermission: vi.fn(),
    };
    guard = new PermissionGuard(
      reflector,
      permissionChecker as unknown as PermissionCheckerService,
    );
  });

  it('deve permitir acesso quando não há metadata @RequirePermission', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const context = createMockExecutionContext({ userId: USER_ID });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
  });

  it('deve permitir acesso quando rota é @Public()', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation(
      (key: string) => {
        if (key === PERMISSIONS_KEY) return ['FINANCE_INVOICE_CREATE'];
        if (key === IS_PUBLIC_KEY) return true;
        return undefined;
      },
    );

    const context = createMockExecutionContext();
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(permissionChecker.userHasPermission).not.toHaveBeenCalled();
  });

  it('deve permitir acesso quando usuário tem a permissão requerida', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation(
      (key: string) => {
        if (key === PERMISSIONS_KEY) return ['FINANCE_INVOICE_CREATE'];
        if (key === IS_PUBLIC_KEY) return false;
        return undefined;
      },
    );
    permissionChecker.userHasPermission.mockResolvedValue(true);

    const context = createMockExecutionContext({ userId: USER_ID });
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(permissionChecker.userHasPermission).toHaveBeenCalledWith(
      USER_ID,
      'FINANCE_INVOICE_CREATE',
    );
  });

  it('deve negar acesso (ForbiddenException) quando usuário não tem a permissão', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation(
      (key: string) => {
        if (key === PERMISSIONS_KEY) return ['FINANCE_INVOICE_DELETE'];
        if (key === IS_PUBLIC_KEY) return false;
        return undefined;
      },
    );
    permissionChecker.userHasPermission.mockResolvedValue(false);

    const context = createMockExecutionContext({ userId: USER_ID });

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('deve negar acesso (ForbiddenException) quando não há usuário no request', async () => {
    vi.spyOn(reflector, 'getAllAndOverride').mockImplementation(
      (key: string) => {
        if (key === PERMISSIONS_KEY) return ['FINANCE_INVOICE_CREATE'];
        if (key === IS_PUBLIC_KEY) return false;
        return undefined;
      },
    );

    const context = createMockExecutionContext(undefined);

    await expect(guard.canActivate(context)).rejects.toThrow(
      ForbiddenException,
    );
    expect(permissionChecker.userHasPermission).not.toHaveBeenCalled();
  });
});
