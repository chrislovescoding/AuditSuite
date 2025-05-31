export enum UserRole {
  SYSTEM_ADMIN = 'system_admin',
  LEAD_AUDITOR = 'lead_auditor',
  SENIOR_AUDITOR = 'senior_auditor',
  AUDITOR = 'auditor',
  ANALYST = 'analyst',
  EXTERNAL_REVIEWER = 'external_reviewer',
  COUNCILLOR = 'councillor'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_APPROVAL = 'pending_approval'
}

export interface User {
  id: string;
  email: string;
  password: string; // hashed
  firstName: string;
  lastName: string;
  role: UserRole;
  status: UserStatus;
  department?: string;
  phoneNumber?: string;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string; // User ID who created this account
}

export interface UserPermissions {
  canUploadDocuments: boolean;
  canDeleteDocuments: boolean;
  canViewAllDocuments: boolean;
  canManageUsers: boolean;
  canManageAudits: boolean;
  canApproveReports: boolean;
  canViewReports: boolean;
  canExportData: boolean;
  canManageSystem: boolean;
}

// Role-based permissions mapping
export const ROLE_PERMISSIONS: Record<UserRole, UserPermissions> = {
  [UserRole.SYSTEM_ADMIN]: {
    canUploadDocuments: true,
    canDeleteDocuments: true,
    canViewAllDocuments: true,
    canManageUsers: true,
    canManageAudits: true,
    canApproveReports: true,
    canViewReports: true,
    canExportData: true,
    canManageSystem: true,
  },
  [UserRole.LEAD_AUDITOR]: {
    canUploadDocuments: true,
    canDeleteDocuments: true,
    canViewAllDocuments: true,
    canManageUsers: false,
    canManageAudits: true,
    canApproveReports: true,
    canViewReports: true,
    canExportData: true,
    canManageSystem: false,
  },
  [UserRole.SENIOR_AUDITOR]: {
    canUploadDocuments: true,
    canDeleteDocuments: false,
    canViewAllDocuments: true,
    canManageUsers: false,
    canManageAudits: false,
    canApproveReports: true,
    canViewReports: true,
    canExportData: true,
    canManageSystem: false,
  },
  [UserRole.AUDITOR]: {
    canUploadDocuments: true,
    canDeleteDocuments: false,
    canViewAllDocuments: false, // Only their assigned documents
    canManageUsers: false,
    canManageAudits: false,
    canApproveReports: false,
    canViewReports: true,
    canExportData: false,
    canManageSystem: false,
  },
  [UserRole.ANALYST]: {
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canViewAllDocuments: true,
    canManageUsers: false,
    canManageAudits: false,
    canApproveReports: false,
    canViewReports: true,
    canExportData: true,
    canManageSystem: false,
  },
  [UserRole.EXTERNAL_REVIEWER]: {
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canViewAllDocuments: false, // Only specific assigned documents
    canManageUsers: false,
    canManageAudits: false,
    canApproveReports: false,
    canViewReports: true,
    canExportData: false,
    canManageSystem: false,
  },
  [UserRole.COUNCILLOR]: {
    canUploadDocuments: false,
    canDeleteDocuments: false,
    canViewAllDocuments: false, // Only final reports
    canManageUsers: false,
    canManageAudits: false,
    canApproveReports: false,
    canViewReports: true,
    canExportData: false,
    canManageSystem: false,
  },
};

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  department?: string;
  phoneNumber?: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
  permissions: UserPermissions;
} 