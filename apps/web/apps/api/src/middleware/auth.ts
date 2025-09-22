import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient, UserRole } from '@prisma/client';

// Mock database for development
const mockUsers = [
  {
    id: '1',
    email: 'admin@edunft.io',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // admin123
    username: 'admin',
    role: UserRole.ADMIN,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    id: '2',
    email: 'university@edunft.io',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // university123
    username: 'university',
    role: UserRole.UNIVERSITY,
    isVerified: true,
    createdAt: new Date(),
  },
  {
    id: '3',
    email: 'student@edunft.io',
    passwordHash: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/8KzKz2K', // student123
    username: 'student',
    role: UserRole.STUDENT,
    isVerified: true,
    createdAt: new Date(),
  },
];

const prisma = new PrismaClient();

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: UserRole;
  };
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required',
        code: 'MISSING_TOKEN',
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET || 'dev-secret') as any;
    
    // Use mock database for development
    const user = mockUsers.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'User not found',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid token',
      code: 'INVALID_TOKEN',
    });
  }
};

export const requireRole = (roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        code: 'AUTH_REQUIRED',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        code: 'INSUFFICIENT_PERMISSIONS',
      });
    }

    next();
  };
};

export const requireVerified = (req: AuthRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required',
      code: 'AUTH_REQUIRED',
    });
  }

  // Admin users are always considered verified
  if (req.user.role === UserRole.ADMIN) {
    return next();
  }

  // For other roles, check if they have a verified organization
  // This would need to be implemented based on your business logic
  next();
};
