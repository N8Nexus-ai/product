import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface CreateUserData {
  email: string;
  password: string;
  name?: string;
  role: Role;
  companyId?: string | null;
  active?: boolean;
}

interface UpdateUserData {
  email?: string;
  name?: string;
  role?: Role;
  companyId?: string | null;
  active?: boolean;
}

export class UserService {
  /**
   * Cria um novo usuário
   * IMPORTANTE: Apenas ADMINs podem criar outros ADMINs
   * 
   * @param createdByAdmin - Se o usuário criador é ADMIN
   * @param data - Dados do usuário a ser criado
   */
  async createUser(createdByAdmin: boolean, data: CreateUserData) {
    const { email, password, name, role, companyId, active = true } = data;

    // Validar que apenas ADMINs podem criar outros ADMINs
    if (role === Role.ADMIN && !createdByAdmin) {
      throw new AppError(
        'Forbidden: Only ADMINs can create other ADMIN users',
        403
      );
    }

    // ADMINs não devem ter companyId
    if (role === Role.ADMIN && companyId) {
      throw new AppError(
        'ADMIN users cannot be assigned to a company',
        400
      );
    }

    // Usuários normais devem ter companyId (a menos que seja ADMIN)
    if (role !== Role.ADMIN && !companyId) {
      throw new AppError(
        'Non-ADMIN users must be assigned to a company',
        400
      );
    }

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role,
        companyId: role === Role.ADMIN ? null : companyId || undefined,
        active
      },
      include: {
        company: true
      }
    });

    logger.info(`User created: ${email} with role ${role} by ${createdByAdmin ? 'ADMIN' : 'system'}`);

    // Não retornar senha
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  /**
   * Lista usuários
   * ADMINs veem todos os usuários, outros veem apenas da mesma empresa
   */
  async listUsers(
    requesterRole: string,
    requesterCompanyId: string | null,
    companyId?: string
  ) {
    const where: any = {};

    // Se não for ADMIN, filtra apenas por empresa do próprio usuário
    if (requesterRole !== 'ADMIN') {
      if (!requesterCompanyId) {
        throw new AppError('User has no company assigned', 403);
      }
      where.companyId = requesterCompanyId;
    } else {
      // ADMIN pode filtrar por empresa específica (se fornecido)
      if (companyId) {
        where.companyId = companyId;
      }
      // Se não fornecer companyId, ve todos (incluindo ADMINs sem companyId)
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users;
  }

  /**
   * Busca usuário por ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return user;
  }

  /**
   * Atualiza um usuário
   */
  async updateUser(
    userId: string,
    updatedByAdmin: boolean,
    data: UpdateUserData
  ) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Validar que apenas ADMINs podem alterar role para ADMIN
    if (data.role === Role.ADMIN && user.role !== Role.ADMIN && !updatedByAdmin) {
      throw new AppError(
        'Forbidden: Only ADMINs can change user role to ADMIN',
        403
      );
    }

    // Validar que apenas ADMINs podem alterar role de um ADMIN
    if (user.role === Role.ADMIN && data.role && data.role !== Role.ADMIN && !updatedByAdmin) {
      throw new AppError(
        'Forbidden: Only ADMINs can change ADMIN user roles',
        403
      );
    }

    // ADMINs não devem ter companyId
    const finalRole = data.role || user.role;
    if (finalRole === Role.ADMIN && data.companyId !== undefined && data.companyId !== null) {
      throw new AppError(
        'ADMIN users cannot be assigned to a company',
        400
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        companyId: finalRole === Role.ADMIN ? null : (data.companyId !== undefined ? data.companyId : user.companyId)
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        companyId: true,
        active: true,
        createdAt: true,
        updatedAt: true,
        company: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    logger.info(`User updated: ${user.email} by ${updatedByAdmin ? 'ADMIN' : 'system'}`);

    return updatedUser;
  }

  /**
   * Deleta um usuário
   */
  async deleteUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    logger.info(`User deleted: ${user.email}`);
  }
}

