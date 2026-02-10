import 'dotenv/config';
import { PrismaClient, Prisma } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { v7 as uuid } from 'uuid';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({
  adapter,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error'] : ['error'],
});

async function main() {
  console.log('Start seeding...');

  // 1. Create a core "SYSTEM" module for RBAC permissions
  const systemModule = await prisma.module.upsert({
    where: { code: 'SYSTEM' },
    update: {},
    create: {
      id: 'a8d2a678-3b3d-4c3e-9a1f-5a8b7a6b3c3e', // Fixed ID for system module
      code: 'SYSTEM',
      name: 'System',
      description: 'Core system module for permissions and settings.',
    },
  });
  console.log(`Created/found module: ${systemModule.name}`);

  // 2. Create system-wide roles
  const roles: Prisma.RoleCreateInput[] = [
    {
      id: 'f8d2a678-3b3d-4c3e-9a1f-5a8b7a6b3c3f', // Fixed ID for SUPER_ADMIN
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Has all permissions across all organizations.',
      isSystem: true,
    },
    {
      id: 'e8d2a678-3b3d-4c3e-9a1f-5a8b7a6b3c3d', // Fixed ID for ORG_ADMIN
      code: 'ORG_ADMIN',
      name: 'Organization Admin',
      description: 'Has all permissions within their organization.',
      isSystem: true,
    },
    {
      id: 'd8d2a678-3b3d-4c3e-9a1f-5a8b7a6b3c3c', // Fixed ID for VIEWER
      code: 'VIEWER',
      name: 'Viewer',
      description: 'Has read-only access to all modules.',
      isSystem: true,
    },
  ];

  for (const role of roles) {
    const createdRole = await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
    console.log(`Created/found role: ${createdRole.name}`);
  }

  // 3. Create permissions for the RBAC module
  const rbacPermissionsData = [
    // Role management
    { resource: 'ROLE', action: 'CREATE', description: 'Create a new role' },
    { resource: 'ROLE', action: 'READ', description: 'Read role details' },
    { resource: 'ROLE', action: 'UPDATE', description: 'Update a role' },
    { resource: 'ROLE', action: 'DELETE', description: 'Delete a role' },
    // Permission management
    {
      resource: 'PERMISSION',
      action: 'CREATE',
      description: 'Create a new permission',
    },
    {
      resource: 'PERMISSION',
      action: 'READ',
      description: 'Read permission details',
    },
    {
      resource: 'PERMISSION',
      action: 'DELETE',
      description: 'Delete a permission',
    },
    // User-Role assignment
    {
      resource: 'USER_ROLE',
      action: 'ASSIGN',
      description: 'Assign a role to a user',
    },
    {
      resource: 'USER_ROLE',
      action: 'REVOKE',
      description: 'Revoke a role from a user',
    },
    {
      resource: 'USER_ROLE',
      action: 'READ',
      description: 'Read user-role assignments',
    },
  ];

  const createdPermissions: Awaited<
    ReturnType<typeof prisma.permission.upsert>
  >[] = [];
  for (const perm of rbacPermissionsData) {
    const permissionCode = `SYSTEM_${perm.resource}_${perm.action}`;
    const created = await prisma.permission.upsert({
      where: { code: permissionCode },
      update: {},
      create: {
        id: uuid(),
        moduleId: systemModule.id,
        code: permissionCode,
        resource: perm.resource,
        action: perm.action,
        description: perm.description,
      },
    });
    createdPermissions.push(created);
    console.log(`Created/found permission: ${created.code}`);
  }

  // 4. Assign all RBAC permissions to the ORG_ADMIN role
  const orgAdminRole = await prisma.role.findUnique({
    where: { id: 'e8d2a678-3b3d-4c3e-9a1f-5a8b7a6b3c3d' },
  });

  if (orgAdminRole) {
    for (const permission of createdPermissions) {
      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: orgAdminRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          id: uuid(),
          roleId: orgAdminRole.id,
          permissionId: permission.id,
        },
      });
      console.log(`Assigned ${permission.code} to ${orgAdminRole.code}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
