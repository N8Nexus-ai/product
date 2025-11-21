import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../../config/env';
import { AppError } from '../../middleware/errorHandler';
import { logger } from '../../utils/logger';

const prisma = new PrismaClient();

interface RegisterData {
  email: string;
  password: string;
  name?: string;
  companyName?: string;
}

export class AuthService {
  
  async register(data: RegisterData) {
    const { email, password, name, companyName } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new AppError('User already exists', 409);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create company if name provided
    let companyId: string | undefined;

    if (companyName) {
      const company = await prisma.company.create({
        data: {
          name: companyName,
          active: true,
          setupStatus: 'pending'
        }
      });
      companyId = company.id;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'CLIENT',
        companyId
      },
      include: {
        company: true
      }
    });

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    logger.info(`User registered: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      token
    };
  }

  async login(email: string, password: string) {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        company: true
      }
    });

    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    if (!user.active) {
      throw new AppError('User account is inactive', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401);
    }

    // Generate token
    const token = this.generateToken(user.id, user.email, user.role);

    logger.info(`User logged in: ${email}`);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        company: user.company
      },
      token
    };
  }

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        company: true
      }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      company: user.company
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.secret) as {
        id: string;
        email: string;
        role: string;
      };

      // Generate new token
      const token = this.generateToken(decoded.id, decoded.email, decoded.role);

      return { token };
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  private generateToken(id: string, email: string, role: string): string {
    return jwt.sign(
      { id, email, role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
  }
}

