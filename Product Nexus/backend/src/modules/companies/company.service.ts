import { PrismaClient } from '@prisma/client';
import { AppError } from '../../middleware/errorHandler';

const prisma = new PrismaClient();

export class CompanyService {
  /**
   * Lista todas as empresas
   * ADMINs veem todas, outros veem apenas a própria empresa
   */
  async listCompanies(requesterRole: string, requesterCompanyId: string | null) {
    if (requesterRole === 'ADMIN') {
      // ADMIN vê todas as empresas
      return prisma.company.findMany({
        where: {
          active: true
        },
        select: {
          id: true,
          name: true,
          cnpj: true,
          industry: true,
          active: true,
          setupStatus: true,
          createdAt: true,
          _count: {
            select: {
              users: true,
              leads: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });
    }

    // Usuários normais veem apenas a própria empresa
    if (!requesterCompanyId) {
      throw new AppError('User has no company assigned', 403);
    }

    const company = await prisma.company.findUnique({
      where: {
        id: requesterCompanyId,
        active: true
      },
      select: {
        id: true,
        name: true,
        cnpj: true,
        industry: true,
        active: true,
        setupStatus: true,
        createdAt: true,
        _count: {
          select: {
            users: true,
            leads: true
          }
        }
      }
    });

    return company ? [company] : [];
  }

  /**
   * Busca empresa por ID
   */
  async getCompanyById(id: string) {
    const company = await prisma.company.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        cnpj: true,
        industry: true,
        active: true,
        setupStatus: true,
        config: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            users: true,
            leads: true,
            campaigns: true,
            integrations: true
          }
        }
      }
    });

    if (!company) {
      throw new AppError('Company not found', 404);
    }

    return company;
  }
}

