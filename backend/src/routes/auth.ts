import express, { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import { UserService } from '../services/userService';
import { UserRole, UserStatus } from '../models/User';
import { authenticateToken, requireAdmin, requireUserManagement } from '../middleware/auth';

const router = express.Router();

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: { error: 'Too many authentication attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // limit each IP to 10 login requests per windowMs
  message: { error: 'Too many login attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT token
 */
router.post('/login', 
  loginLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { email, password } = req.body;
      const authResponse = await UserService.login({ email, password });

      res.json({
        message: 'Login successful',
        ...authResponse
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(401).json({ 
        error: error instanceof Error ? error.message : 'Authentication failed' 
      });
    }
  }
);

/**
 * POST /api/auth/register
 * Register a new user (admin only)
 */
router.post('/register',
  authLimiter,
  authenticateToken,
  requireUserManagement,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    body('firstName').notEmpty().trim().withMessage('First name is required'),
    body('lastName').notEmpty().trim().withMessage('Last name is required'),
    body('role').isIn(Object.values(UserRole)).withMessage('Valid role is required'),
    body('department').optional().trim(),
    body('phoneNumber').optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const userData = req.body;
      const createdBy = req.user?.userId;

      const user = await UserService.createUser(userData, createdBy);
      
      // Remove password from response
      const { password, ...userResponse } = user;

      res.status(201).json({
        message: 'User created successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Registration failed' 
      });
    }
  }
);

/**
 * GET /api/auth/me
 * Get current user profile
 */
router.get('/me', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'User ID not found in token' });
    }

    const user = await UserService.getUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Remove password from response
    const { password, ...userResponse } = user;

    res.json({
      user: userResponse,
      permissions: require('../models/User').ROLE_PERMISSIONS[user.role]
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

/**
 * PUT /api/auth/me
 * Update current user profile
 */
router.put('/me',
  authenticateToken,
  [
    body('firstName').optional().notEmpty().trim(),
    body('lastName').optional().notEmpty().trim(),
    body('department').optional().trim(),
    body('phoneNumber').optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found in token' });
      }

      const updates = req.body;
      // Don't allow role updates through this endpoint
      delete updates.role;

      const user = await UserService.updateUser(userId, updates);
      
      // Remove password from response
      const { password, ...userResponse } = user;

      res.json({
        message: 'Profile updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update profile error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      });
    }
  }
);

/**
 * POST /api/auth/change-password
 * Change current user password
 */
router.post('/change-password',
  authenticateToken,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const userId = req.user?.userId;
      if (!userId) {
        return res.status(401).json({ error: 'User ID not found in token' });
      }

      const { currentPassword, newPassword } = req.body;
      await UserService.changePassword(userId, currentPassword, newPassword);

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      console.error('Change password error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to change password' 
      });
    }
  }
);

/**
 * GET /api/auth/users
 * Get all users (admin only)
 */
router.get('/users', authenticateToken, requireUserManagement, async (req: Request, res: Response) => {
  try {
    const users = await UserService.getAllUsers();
    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

/**
 * PUT /api/auth/users/:id
 * Update user information (admin only)
 */
router.put('/users/:id',
  authenticateToken,
  requireUserManagement,
  [
    body('firstName').optional().notEmpty().trim().withMessage('First name cannot be empty'),
    body('lastName').optional().notEmpty().trim().withMessage('Last name cannot be empty'),
    body('role').optional().isIn(Object.values(UserRole)).withMessage('Valid role is required'),
    body('department').optional().trim(),
    body('phoneNumber').optional().trim(),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { id } = req.params;
      const updates = req.body;

      // Don't allow updating email through this endpoint for security
      delete updates.email;
      delete updates.password;

      const user = await UserService.updateUser(id, updates);
      
      // Remove password from response
      const { password, ...userResponse } = user;

      res.json({
        message: 'User updated successfully',
        user: userResponse
      });
    } catch (error) {
      console.error('Update user error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to update user' 
      });
    }
  }
);

/**
 * PUT /api/auth/users/:id/status
 * Update user status (admin only)
 */
router.put('/users/:id/status',
  authenticateToken,
  requireUserManagement,
  [
    body('status').isIn(Object.values(UserStatus)).withMessage('Valid status is required'),
  ],
  async (req: Request, res: Response) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: errors.array() 
        });
      }

      const { id } = req.params;
      const { status } = req.body;
      const updatedBy = req.user?.userId || '';

      const user = await UserService.updateUserStatus(id, status, updatedBy);
      
      // Remove password from response
      const { password, ...userResponse } = user;

      res.json({
        message: `User status updated to ${status}`,
        user: userResponse
      });
    } catch (error) {
      console.error('Update user status error:', error);
      res.status(400).json({ 
        error: error instanceof Error ? error.message : 'Failed to update user status' 
      });
    }
  }
);

/**
 * GET /api/auth/stats
 * Get user statistics (admin only)
 */
router.get('/stats', authenticateToken, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await UserService.getUserStats();
    res.json({ stats });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ error: 'Failed to get user statistics' });
  }
});

/**
 * DELETE /api/auth/users/:id
 * Delete user (admin only)
 */
router.delete('/users/:id', authenticateToken, requireUserManagement, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const currentUserId = req.user?.userId;

    // Prevent users from deleting themselves
    if (id === currentUserId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    await UserService.deleteUser(id);

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(400).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete user' 
    });
  }
});

export default router; 