import { Router } from 'express';
import { UserController } from '../modules/users/user.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const userController = new UserController();

// Todas as rotas requerem autenticação
router.use(authenticate);

/**
 * POST /api/users
 * Cria um novo usuário
 * Apenas ADMINs podem criar outros ADMINs
 */
router.post('/', userController.createUser);

/**
 * GET /api/users
 * Lista usuários
 * ADMINs veem todos, outros veem apenas da mesma empresa
 */
router.get('/', userController.listUsers);

/**
 * GET /api/users/:id
 * Busca usuário por ID
 */
router.get('/:id', userController.getUser);

/**
 * PUT /api/users/:id
 * Atualiza um usuário
 * Apenas ADMINs podem alterar role para ADMIN ou alterar role de ADMIN
 */
router.put('/:id', userController.updateUser);

/**
 * DELETE /api/users/:id
 * Deleta um usuário
 * Apenas ADMINs podem deletar usuários
 */
router.delete('/:id', authorize('ADMIN'), userController.deleteUser);

export default router;

