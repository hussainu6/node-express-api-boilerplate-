import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface UserDto {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  roleName: string;
  permissions: string[];
  createdAt: Date;
}

export async function createUser(
  email: string,
  hashedPassword: string,
  roleId: string,
  name?: string
): Promise<UserDto> {
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name: name ?? null,
      roleId,
    },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });
  return toDto(user);
}

export async function findByEmail(email: string): Promise<(UserDto & { password: string }) | null> {
  const user = await prisma.user.findFirst({
    where: { email: email.toLowerCase(), deletedAt: null },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });
  if (!user) return null;
  return { ...toDto(user), password: user.password };
}

export async function findById(id: string): Promise<UserDto | null> {
  const user = await prisma.user.findFirst({
    where: { id, deletedAt: null },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });
  if (!user) return null;
  return toDto(user);
}

export async function updateProfile(
  userId: string,
  data: { name?: string }
): Promise<UserDto | null> {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { name: data.name, updatedAt: new Date() },
    include: {
      role: {
        include: {
          permissions: { include: { permission: true } },
        },
      },
    },
  });
  if (user.deletedAt) return null;
  return toDto(user);
}

export async function listUsers(
  page: number,
  limit: number
): Promise<{ users: UserDto[]; total: number }> {
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: { deletedAt: null },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        role: {
          include: {
            permissions: { include: { permission: true } },
          },
        },
      },
    }),
    prisma.user.count({ where: { deletedAt: null } }),
  ]);
  return { users: users.map(toDto), total };
}

function toDto(user: {
  id: string;
  email: string;
  name: string | null;
  roleId: string;
  role: {
    name: string;
    permissions: { permission: { name: string } }[];
  };
  createdAt: Date;
}): UserDto {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    roleId: user.roleId,
    roleName: user.role.name,
    permissions: user.role.permissions.map((p) => p.permission.name),
    createdAt: user.createdAt,
  };
}
