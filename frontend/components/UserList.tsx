'use client';

import React, { useState } from 'react';
import { Edit, MoreVertical, Mail, Phone, Calendar, Building, UserCheck, UserX, Clock, Shield } from 'lucide-react';

interface User {
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

interface UserListProps {
  users: User[];
  currentUserId?: string;
  onEditUser: (user: User) => void;
  onStatusUpdate: (userId: string, newStatus: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onEditUser, onStatusUpdate }) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const getRoleDisplayName = (role: string) => {
    return role.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <UserCheck className="h-3 w-3" />;
      case 'pending_approval':
        return <Clock className="h-3 w-3" />;
      case 'suspended':
        return <UserX className="h-3 w-3" />;
      default:
        return <UserX className="h-3 w-3" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'system_admin':
        return 'bg-purple-100 text-purple-800';
      case 'lead_auditor':
        return 'bg-blue-100 text-blue-800';
      case 'senior_auditor':
        return 'bg-indigo-100 text-indigo-800';
      case 'auditor':
        return 'bg-cyan-100 text-cyan-800';
      case 'analyst':
        return 'bg-green-100 text-green-800';
      case 'external_reviewer':
        return 'bg-orange-100 text-orange-800';
      case 'councillor':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const statusOptions = [
    { value: 'active', label: 'Activate', color: 'text-green-600' },
    { value: 'suspended', label: 'Suspend', color: 'text-red-600' },
    { value: 'pending_approval', label: 'Set Pending', color: 'text-yellow-600' },
    { value: 'inactive', label: 'Deactivate', color: 'text-gray-600' },
  ];

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border p-12 text-center">
        <Shield className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
        <p className="text-gray-500">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border">
      <div className="grid gap-1">
        {users.map((user) => (
          <div
            key={user.id}
            className={`p-6 border-b last:border-b-0 hover:bg-gray-50 transition-colors ${
              user.id === currentUserId ? 'bg-blue-50' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-gray-100 p-2 rounded-full">
                    <Shield className="h-4 w-4 text-gray-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          You
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(user.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(user.status)}
                          {user.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                  
                  {user.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{user.phoneNumber}</span>
                    </div>
                  )}
                  
                  {user.department && (
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      <span>{user.department}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>Joined {formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {user.lastLoginAt && (
                  <div className="mt-2 text-xs text-gray-500">
                    Last login: {new Date(user.lastLoginAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEditUser(user)}
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Edit user"
                >
                  <Edit className="h-4 w-4" />
                </button>

                {/* Status Dropdown */}
                {user.id !== currentUserId && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                      className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                      title="More actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {dropdownOpen === user.id && (
                      <>
                        <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border py-1 z-10">
                          <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b">
                            Change Status
                          </div>
                          {statusOptions
                            .filter(option => option.value !== user.status)
                            .map((option) => (
                              <button
                                key={option.value}
                                onClick={() => {
                                  onStatusUpdate(user.id, option.value);
                                  setDropdownOpen(null);
                                }}
                                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 ${option.color}`}
                              >
                                {option.label}
                              </button>
                            ))}
                        </div>
                        <div
                          className="fixed inset-0 z-5"
                          onClick={() => setDropdownOpen(null)}
                        />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UserList; 