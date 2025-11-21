import { Request, Response, NextFunction } from 'express';
import { CompanyService } from './company.service';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { getUserFromRequest } from '../../utils/user-helper';

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  /**
   * Lista empresas
   * ADMINs veem todas, outros veem apenas a própria
   */
  listCompanies = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await getUserFromRequest(req);

      const companies = await this.companyService.listCompanies(
        user.role,
        user.companyId
      );

      res.json({
        status: 'success',
        data: companies
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca empresa por ID
   */
  getCompany = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const company = await this.companyService.getCompanyById(id);

      // Verificar se o usuário tem acesso
      const user = await getUserFromRequest(req);
      if (user.role !== 'ADMIN' && user.companyId !== company.id) {
        throw new AppError('Forbidden: You do not have access to this company', 403);
      }

      res.json({
        status: 'success',
        data: company
      });
    } catch (error) {
      next(error);
    }
  };
}

