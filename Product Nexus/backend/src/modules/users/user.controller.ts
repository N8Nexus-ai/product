import { Request, Response, NextFunction } from 'express';
import { UserService } from './user.service';
import { AuthRequest } from '../../middleware/auth';
import { AppError } from '../../middleware/errorHandler';
import { getUserFromRequest } from '../../utils/user-helper';
import { Role } from '@prisma/client';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Cria um novo usuário
   * Apenas ADMINs podem criar outros ADMINs
   */
  createUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await getUserFromRequest(req);

      // Verificar se é ADMIN
      const isAdmin = user.role === 'ADMIN';

      const { email, password, name, role, companyId, active } = req.body;

      if (!email || !password || !role) {
        throw new AppError('Email, password and role are required', 400);
      }

      // Validar role
      if (!Object.values(Role).includes(role)) {
        throw new AppError('Invalid role', 400);
      }

      const newUser = await this.userService.createUser(isAdmin, {
        email,
        password,
        name,
        role,
        companyId,
        active
      });

      res.status(201).json({
        status: 'success',
        data: newUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Lista usuários
   */
  listUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const user = await getUserFromRequest(req);
      const { companyId } = req.query;

      const users = await this.userService.listUsers(
        user.role,
        user.companyId,
        companyId as string
      );

      res.json({
        status: 'success',
        data: users
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Busca usuário por ID
   */
  getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const user = await this.userService.getUserById(id);

      // Verificar se o usuário tem acesso
      const requester = await getUserFromRequest(req);
      if (requester.role !== 'ADMIN' && requester.companyId !== user.companyId) {
        throw new AppError('Forbidden: You do not have access to this user', 403);
      }

      res.json({
        status: 'success',
        data: user
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Atualiza um usuário
   */
  updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const requester = await getUserFromRequest(req);
      const isAdmin = requester.role === 'ADMIN';

      // Verificar se pode atualizar (só ADMIN pode atualizar qualquer usuário)
      if (!isAdmin) {
        const targetUser = await this.userService.getUserById(id);
        if (requester.companyId !== targetUser.companyId) {
          throw new AppError('Forbidden: You can only update users from your company', 403);
        }
      }

      const updatedUser = await this.userService.updateUser(id, isAdmin, req.body);

      res.json({
        status: 'success',
        data: updatedUser
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Deleta um usuário
   */
  deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Unauthorized', 401);
      }

      const { id } = req.params;
      const requester = await getUserFromRequest(req);
      const isAdmin = requester.role === 'ADMIN';

      // Apenas ADMIN pode deletar usuários
      if (!isAdmin) {
        throw new AppError('Forbidden: Only ADMINs can delete users', 403);
      }

      await this.userService.deleteUser(id);

      res.json({
        status: 'success',
        message: 'User deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  };
}

