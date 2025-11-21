import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export interface UserWithCompany {
  id: string;
  email: string;
  role: string;
  companyId: string | null;
}

/**
 * Busca o usuário completo do banco de dados (incluindo companyId)
 */
export async function getUserFromRequest(req: AuthRequest): Promise<UserWithCompany> {
  if (!req.user?.id) {
    throw new AppError('User not authenticated', 401);
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      id: true,
      email: true,
      role: true,
      companyId: true
    }
  });

  if (!user) {
    throw new AppError('User not found', 404);
  }

  return user;
}

/**
 * Retorna o companyId para filtrar queries.
 * - Se o usuário é ADMIN: retorna undefined (para ver todos) ou o companyId do query param (se fornecido)
 * - Se o usuário não é ADMIN: retorna o companyId do usuário
 * 
 * @param req - Request do Express com usuário autenticado
 * @param companyIdFromQuery - Optional companyId do query param (para ADMIN filtrar por empresa específica)
 * @returns companyId para filtrar ou undefined para ver todos (apenas ADMIN)
 */
export async function getCompanyIdForQuery(
  req: AuthRequest,
  companyIdFromQuery?: string
): Promise<string | undefined> {
  const user = await getUserFromRequest(req);

  // Se for ADMIN, pode ver todos os dados
  if (user.role === 'ADMIN') {
    // Se forneceu um companyId no query, filtra por ele (para ver dados de uma empresa específica)
    if (companyIdFromQuery) {
      return companyIdFromQuery;
    }
    // Senão, retorna undefined para ver todos
    return undefined;
  }

  // Usuários normais só veem dados da própria empresa
  if (!user.companyId) {
    throw new AppError('User has no company assigned', 403);
  }

  return user.companyId;
}

/**
 * Valida se o usuário pode acessar dados de uma empresa específica
 * - ADMIN: pode acessar qualquer empresa
 * - Outros: só podem acessar a própria empresa
 */
export async function canAccessCompany(
  req: AuthRequest,
  companyId: string
): Promise<boolean> {
  const user = await getUserFromRequest(req);

  if (user.role === 'ADMIN') {
    return true;
  }

  return user.companyId === companyId;
}

/**
 * Valida e lança erro se o usuário não pode acessar dados de uma empresa
 */
export async function ensureCompanyAccess(
  req: AuthRequest,
  companyId: string
): Promise<void> {
  const canAccess = await canAccessCompany(req, companyId);
  
  if (!canAccess) {
    throw new AppError('Forbidden: You do not have access to this company data', 403);
  }
}

