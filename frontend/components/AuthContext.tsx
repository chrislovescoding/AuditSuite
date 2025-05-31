'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
  department?: string;
  phoneNumber?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
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

interface AuthContextType {
  user: User | null;
  permissions: UserPermissions | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing token on mount
    const storedToken = localStorage.getItem('authToken');
    if (storedToken) {
      setToken(storedToken);
      fetchUserProfile(storedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async (authToken: string) => {
    try {
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setPermissions(data.permissions);
        setError(null);
      } else {
        // Token is invalid
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        setPermissions(null);
      }
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        setPermissions(data.permissions);
        setToken(data.token);
        localStorage.setItem('authToken', data.token);
        setError(null);
      } else {
        throw new Error(data.error || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    setPermissions(null);
    setToken(null);
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        permissions,
        token,
        login,
        logout,
        setUser,
        loading,
        error,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 