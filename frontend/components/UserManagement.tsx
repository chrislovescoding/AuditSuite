'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Users, Plus, Search, Filter, BarChart3, UserCheck, UserX, Clock, AlertTriangle } from 'lucide-react';
import UserList from './UserList';
import UserModal from './UserModal';
import UserStats from './UserStats';

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
  createdBy?: string;
}

export interface UserStatsData {
  total: number;
  active: number;
  pending: number;
  suspended: number;
  byRole: {
    [key: string]: number;
  };
}

const UserManagement: React.FC = () => {
  const { token, permissions, user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; user: User | null }>({ show: false, user: null });

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/auth/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users);
        setError(null);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/auth/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  };

  useEffect(() => {
    if (token && permissions?.canManageUsers) {
      Promise.all([fetchUsers(), fetchStats()]).finally(() => {
        setLoading(false);
      });
    }
  }, [token, permissions]);

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleUserUpdated = () => {
    fetchUsers();
    fetchStats();
    setShowUserModal(false);
    setEditingUser(null);
  };

  const handleStatusUpdate = async (userId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/auth/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        await fetchUsers();
        await fetchStats();
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
  };

  const handleDeleteUser = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setDeleteConfirm({ show: true, user });
    }
  };

  const confirmDeleteUser = async () => {
    if (!deleteConfirm.user) return;

    try {
      const response = await fetch(`/api/auth/users/${deleteConfirm.user.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        await fetchUsers();
        await fetchStats();
        setDeleteConfirm({ show: false, user: null });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete user');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      setDeleteConfirm({ show: false, user: null });
    }
  };

  // Filter users based on search and filters
  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  // Check permissions
  if (!permissions?.canManageUsers) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to manage users.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const uniqueRoles = Array.from(new Set(users.map(user => user.role)));

  return (
    <div className="space-y-6" style={{ fontFamily: 'Times New Roman, serif' }}>
      {/* Error Alert */}
      {error && (
        <div className="bg-red-500/20 border border-red-300/30 text-red-200 px-4 py-3 rounded-lg backdrop-blur-sm">
          {error}
        </div>
      )}

      {/* Statistics */}
      {stats && <UserStats stats={stats} />}

      {/* Filters and Search */}
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-lg space-y-4">
        <div className="flex items-center gap-4 flex-wrap">
          {/* Search */}
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
              <input
                type="text"
                placeholder="Search users by name, email, or department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-white/60" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white"
            >
              <option value="all" className="bg-[#35373A] text-white">All Status</option>
              <option value="active" className="bg-[#35373A] text-white">Active</option>
              <option value="pending_approval" className="bg-[#35373A] text-white">Pending</option>
              <option value="suspended" className="bg-[#35373A] text-white">Suspended</option>
              <option value="inactive" className="bg-[#35373A] text-white">Inactive</option>
            </select>
          </div>

          {/* Role Filter */}
          <div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="bg-white/10 border border-white/30 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white"
            >
              <option value="all" className="bg-[#35373A] text-white">All Roles</option>
              {uniqueRoles.map(role => (
                <option key={role} value={role} className="bg-[#35373A] text-white">
                  {role.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Add User Button */}
          <button
            onClick={handleCreateUser}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg hover:bg-white/30 transition-colors border border-white/30"
          >
            <Plus className="h-4 w-4" />
            Add User
          </button>
        </div>

        {/* Results Count */}
        <div className="text-sm text-white/70">
          Showing {filteredUsers.length} of {users.length} users
        </div>
      </div>

      {/* Users List */}
      <UserList
        users={filteredUsers}
        currentUserId={currentUser?.id}
        onEditUser={handleEditUser}
        onStatusUpdate={handleStatusUpdate}
        onDeleteUser={handleDeleteUser}
      />

      {/* User Modal */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onClose={() => setShowUserModal(false)}
          onUserUpdated={handleUserUpdated}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 rounded-lg max-w-md mx-4" style={{ fontFamily: 'Times New Roman, serif' }}>
            <h2 className="text-xl font-light text-white mb-4">Confirm User Deletion</h2>
            <p className="text-white/80 mb-2">
              Are you sure you want to delete the following user?
            </p>
            {deleteConfirm.user && (
              <div className="bg-white/10 p-4 rounded-lg mb-6 border border-white/20">
                <p className="text-white font-medium">
                  {deleteConfirm.user.firstName} {deleteConfirm.user.lastName}
                </p>
                <p className="text-white/70 text-sm">{deleteConfirm.user.email}</p>
                <p className="text-white/70 text-sm">
                  Role: {deleteConfirm.user.role.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                  ).join(' ')}
                </p>
              </div>
            )}
            <p className="text-red-300 text-sm mb-6">
              <strong>⚠️ PERMANENT DELETION - GDPR COMPLIANT</strong><br />
              This action cannot be undone. The user and ALL associated data will be permanently removed from the system, including:
              <br />• User profile and account information
              <br />• All documents uploaded by this user
              <br />• All audit log entries for this user
              <br />• Any other personal data associated with this account
              <br /><br />
              This deletion complies with GDPR Article 17 (Right to Erasure).
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={confirmDeleteUser}
                className="flex-1 bg-red-500/20 text-red-200 border border-red-300/30 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors backdrop-blur-sm"
              >
                Delete User
              </button>
              <button
                onClick={() => setDeleteConfirm({ show: false, user: null })}
                className="flex-1 bg-white/10 text-white border border-white/30 px-4 py-2 rounded-lg hover:bg-white/20 transition-colors backdrop-blur-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement; 