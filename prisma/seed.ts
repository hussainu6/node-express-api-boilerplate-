import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PERMISSIONS = [
  'user:create',
  'user:read',
  'user:update',
  'user:delete',
  'profile:read',
  'profile:update',
  '*', // admin wildcard
];

async function getOrCreatePermission(name: string) {
  const existing = await prisma.permission.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.permission.create({ data: { name } });
}

async function getOrCreateRole(name: string) {
  const existing = await prisma.role.findUnique({ where: { name } });
  if (existing) return existing;
  return prisma.role.create({ data: { name } });
}

async function getOrCreateRolePermission(roleId: string, permissionId: string) {
  const existing = await prisma.rolePermission.findUnique({
    where: { roleId_permissionId: { roleId, permissionId } },
  });
  if (existing) return existing;
  return prisma.rolePermission.create({
    data: { roleId, permissionId },
  });
}

async function main() {
  // Create permissions
  const permRecords = await Promise.all(
    PERMISSIONS.map((name) => getOrCreatePermission(name))
  );
  const permMap = Object.fromEntries(permRecords.map((p) => [p.name, p.id]));

  // Create roles
  const adminRole = await getOrCreateRole('ADMIN');
  const managerRole = await getOrCreateRole('MANAGER');
  const userRole = await getOrCreateRole('USER');

  // Assign all permissions to ADMIN
  for (const perm of permRecords) {
    await getOrCreateRolePermission(adminRole.id, perm.id);
  }

  // MANAGER: user:read, profile:*
  for (const name of ['user:read', 'profile:read', 'profile:update']) {
    const pid = permMap[name];
    if (pid) await getOrCreateRolePermission(managerRole.id, pid);
  }

  // USER: profile:read, profile:update
  for (const name of ['profile:read', 'profile:update']) {
    const pid = permMap[name];
    if (pid) await getOrCreateRolePermission(userRole.id, pid);
  }

  console.log('Seed completed: roles and permissions created.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
