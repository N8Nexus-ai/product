import { Router } from 'express';
import { CompanyController } from '../modules/companies/company.controller';
import { authenticate } from '../middleware/auth';

const router = Router();
const companyController = new CompanyController();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * GET /api/companies
 * Lista empresas
 * ADMINs veem todas, outros veem apenas a própria empresa
 */
router.get('/', companyController.listCompanies);

/**
 * GET /api/companies/:id
 * Busca empresa por ID
 */
router.get('/:id', companyController.getCompany);

export default router;

