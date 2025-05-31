import { 
  User, 
  UserRole, 
  UserStatus, 
  CreateUserDto, 
  LoginDto, 
  AuthResponse,
  ROLE_PERMISSIONS 
} from '../models/User';
import { 
  hashPassword, 
  comparePassword, 
  generateToken, 
  validatePassword, 
  validateEmail 
} from '../utils/auth';
import { UserRepository, AuditLogRepository } from '../database/repository';

export class UserService {
  /**
   * Initialize default admin user if none exists
   */
  static async initializeDefaultAdmin(): Promise<void> {
    try {
      // Check if any users exist
      const stats = await UserRepository.getStats();
      
      if (stats.total === 0) {
        const defaultAdmin: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
          email: 'admin@audit-suite.gov.uk',
          password: await hashPassword('AuditAdmin123!'),
          firstName: 'System',
          lastName: 'Administrator',
          role: UserRole.SYSTEM_ADMIN,
          status: UserStatus.ACTIVE,
          department: 'IT',
        };
        
        const createdAdmin = await UserRepository.create(defaultAdmin);
        console.log('🔑 Default admin user created: admin@audit-suite.gov.uk / AuditAdmin123!');
        
        // Log the admin creation
        await AuditLogRepository.create({
          userId: createdAdmin.id,
          action: 'USER_CREATED',
          resourceType: 'USER',
          resourceId: createdAdmin.id,
          details: { role: UserRole.SYSTEM_ADMIN, isDefaultAdmin: true },
        });
      }
    } catch (error) {
      console.error('Failed to initialize default admin:', error);
    }
  }

  /**
   * Create a new user
   */
  static async createUser(userData: CreateUserDto, createdBy?: string): Promise<User> {
    // Validate email
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email format');
    }

    // Check if email already exists
    const existingUser = await UserRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('Email already in use');
    }

    // Validate password
    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash password
    const hashedPassword = await hashPassword(userData.password);

    // Create user object
    const newUser: Omit<User, 'id' | 'createdAt' | 'updatedAt'> = {
      email: userData.email.toLowerCase(),
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      status: UserStatus.PENDING_APPROVAL, // New users need approval
      department: userData.department,
      phoneNumber: userData.phoneNumber,
      createdBy,
    };

    const user = await UserRepository.create(newUser);

    // Log user creation
    await AuditLogRepository.create({
      userId: createdBy,
      action: 'USER_CREATED',
      resourceType: 'USER',
      resourceId: user.id,
      details: { 
        email: user.email, 
        role: user.role, 
        createdFor: `${user.firstName} ${user.lastName}` 
      },
    });

    return user;
  }

  /**
   * Authenticate user login
   */
  static async login(loginData: LoginDto): Promise<AuthResponse> {
    const user = await UserRepository.findByEmail(loginData.email);
    
    if (!user) {
      throw new Error('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new Error(`Account is ${user.status}. Please contact administrator.`);
    }

    const isPasswordValid = await comparePassword(loginData.password, user.password);
    if (!isPasswordValid) {
      // Log failed login attempt
      await AuditLogRepository.create({
        userId: user.id,
        action: 'LOGIN_FAILED',
        resourceType: 'USER',
        resourceId: user.id,
        details: { reason: 'Invalid password', email: user.email },
      });
      
      throw new Error('Invalid email or password');
    }

    // Update last login time
    await UserRepository.updateLastLogin(user.id);

    // Generate token
    const token = generateToken(user);

    // Get permissions
    const permissions = ROLE_PERMISSIONS[user.role];

    // Log successful login
    await AuditLogRepository.create({
      userId: user.id,
      action: 'LOGIN_SUCCESS',
      resourceType: 'USER',
      resourceId: user.id,
      details: { email: user.email },
    });

    // Return user without password
    const { password, ...userWithoutPassword } = user;

    return {
      user: userWithoutPassword,
      token,
      permissions,
    };
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: string): Promise<User | null> {
    return await UserRepository.findById(id);
  }

  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    return await UserRepository.findByEmail(email);
  }

  /**
   * Get all users (admin only)
   */
  static async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await UserRepository.findAll();
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Update user status (activate, deactivate, suspend)
   */
  static async updateUserStatus(userId: string, status: UserStatus, updatedBy: string): Promise<User> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const oldStatus = user.status;
    const updatedUser = await UserRepository.update(userId, { status });

    // Log status change
    await AuditLogRepository.create({
      userId: updatedBy,
      action: 'USER_STATUS_CHANGED',
      resourceType: 'USER',
      resourceId: userId,
      details: { 
        oldStatus, 
        newStatus: status, 
        targetUser: `${user.firstName} ${user.lastName}` 
      },
    });

    return updatedUser;
  }

  /**
   * Update user profile
   */
  static async updateUser(userId: string, updates: Partial<CreateUserDto>): Promise<User> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Don't allow email updates through this method for security
    delete updates.email;
    delete updates.password;

    const updatedUser = await UserRepository.update(userId, updates);

    // Log profile update
    await AuditLogRepository.create({
      userId: userId,
      action: 'USER_UPDATED',
      resourceType: 'USER',
      resourceId: userId,
      details: { updatedFields: Object.keys(updates) },
    });

    return updatedUser;
  }

  /**
   * Change password
   */
  static async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Validate new password
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(`Password validation failed: ${passwordValidation.errors.join(', ')}`);
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await UserRepository.updatePassword(userId, hashedNewPassword);

    // Log password change
    await AuditLogRepository.create({
      userId: userId,
      action: 'PASSWORD_CHANGED',
      resourceType: 'USER',
      resourceId: userId,
      details: { email: user.email },
    });
  }

  /**
   * Delete user (soft delete)
   */
  static async deleteUser(userId: string): Promise<void> {
    const user = await UserRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await UserRepository.delete(userId);

    // Log user deletion
    await AuditLogRepository.create({
      action: 'USER_DELETED',
      resourceType: 'USER',
      resourceId: userId,
      details: { 
        email: user.email, 
        name: `${user.firstName} ${user.lastName}`,
        deletionType: 'soft'
      },
    });
  }

  /**
   * Get user statistics
   */
  static async getUserStats() {
    const stats = await UserRepository.getStats();
    
    // Transform data to match frontend interface
    return {
      total: stats.total,
      active: stats.active,
      pending: stats.pendingApproval, // Map pendingApproval to pending
      suspended: stats.suspended,
      byRole: stats.byRole
    };
  }

  /**
   * Get users by role
   */
  static async getUsersByRole(role: UserRole): Promise<Omit<User, 'password'>[]> {
    const users = await UserRepository.findByRole(role);
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Get users by status
   */
  static async getUsersByStatus(status: UserStatus): Promise<Omit<User, 'password'>[]> {
    const users = await UserRepository.findByStatus(status);
    return users.map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }

  /**
   * Check if email is available
   */
  static async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
    return !(await UserRepository.emailExists(email, excludeUserId));
  }
} 