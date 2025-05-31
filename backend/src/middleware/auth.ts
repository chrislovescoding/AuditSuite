import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtPayload, hasPermission } from '../utils/auth';
import { UserRole, ROLE_PERMISSIONS } from '../models/User';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware to authenticate JWT token
 */
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
};

/**
 * Middleware to check if user has required permission
 */
export const requirePermission = (
  permission: keyof typeof ROLE_PERMISSIONS[UserRole]
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!hasPermission(req.user.role, permission)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        required: permission,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user has one of the required roles
 */
export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({ 
        error: 'Insufficient role permissions',
        required: roles,
        userRole: req.user.role
      });
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is system admin
 */
export const requireAdmin = requireRole(UserRole.SYSTEM_ADMIN);

/**
 * Middleware to check if user can manage users
 */
export const requireUserManagement = requirePermission('canManageUsers');

/**
 * Middleware to check if user can upload documents
 */
export const requireDocumentUpload = requirePermission('canUploadDocuments');

/**
 * Middleware to check if user can delete documents
 */
export const requireDocumentDelete = requirePermission('canDeleteDocuments'); 