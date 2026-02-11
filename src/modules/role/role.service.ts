import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface RoleWithPermissions {
  id: string;
  name: string;
  permissions: string[];
}

export async function getRoleById(roleId: string): Promise<RoleWithPermissions | null> {
  const role = await prisma.role.findUnique({
    where: { id: roleId },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });
  if (!role) return null;
  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((rp: { permission: { name: string } }) => rp.permission.name),
  };
}

export async function getRoleByName(name: string): Promise<RoleWithPermissions | null> {
  const role = await prisma.role.findUnique({
    where: { name },
    include: {
      permissions: {
        include: { permission: true },
      },
    },
  });
  if (!role) return null;
  return {
    id: role.id,
    name: role.name,
    permissions: role.permissions.map((rp: { permission: { name: string } }) => rp.permission.name),
  };
}
