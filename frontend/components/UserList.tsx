'use client';

import React, { useState } from 'react';
import { Edit, MoreVertical, Mail, Phone, Calendar, Building, UserCheck, UserX, Clock, Shield, Trash2 } from 'lucide-react';

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
  onDeleteUser: (userId: string) => void;
}

const UserList: React.FC<UserListProps> = ({ users, currentUserId, onEditUser, onStatusUpdate, onDeleteUser }) => {
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const getRoleDisplayName = (role: string) => {
    return role.split('_').map((word: string) => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-200 border-green-300/30';
      case 'pending_approval':
        return 'bg-yellow-500/20 text-yellow-200 border-yellow-300/30';
      case 'suspended':
        return 'bg-red-500/20 text-red-200 border-red-300/30';
      case 'inactive':
        return 'bg-gray-500/20 text-gray-200 border-gray-300/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-300/30';
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
        return 'bg-purple-500/20 text-purple-200 border-purple-300/30';
      case 'lead_auditor':
        return 'bg-blue-500/20 text-blue-200 border-blue-300/30';
      case 'senior_auditor':
        return 'bg-indigo-500/20 text-indigo-200 border-indigo-300/30';
      case 'auditor':
        return 'bg-cyan-500/20 text-cyan-200 border-cyan-300/30';
      case 'analyst':
        return 'bg-green-500/20 text-green-200 border-green-300/30';
      case 'external_reviewer':
        return 'bg-orange-500/20 text-orange-200 border-orange-300/30';
      case 'councillor':
        return 'bg-pink-500/20 text-pink-200 border-pink-300/30';
      default:
        return 'bg-gray-500/20 text-gray-200 border-gray-300/30';
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
    { value: 'active', label: 'Activate', color: 'text-green-200' },
    { value: 'suspended', label: 'Suspend', color: 'text-red-200' },
    { value: 'pending_approval', label: 'Set Pending', color: 'text-yellow-200' },
    { value: 'inactive', label: 'Deactivate', color: 'text-gray-200' },
  ];

  if (users.length === 0) {
    return (
      <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20 p-12 text-center">
        <Shield className="h-12 w-12 text-white/60 mx-auto mb-4" />
        <h3 className="text-lg font-light text-white italic mb-2">No users found</h3>
        <p className="text-white/70">Try adjusting your search or filters</p>
      </div>
    );
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg border border-white/20" style={{ fontFamily: 'Times New Roman, serif' }}>
      <div className="grid gap-1">
        {users
          .sort((a, b) => {
            // Put current user at the top
            if (a.id === currentUserId) return -1;
            if (b.id === currentUserId) return 1;
            // Sort others alphabetically by first name
            return a.firstName.localeCompare(b.firstName);
          })
          .map((user) => (
          <div
            key={user.id}
            className={`p-6 border-b border-white/10 last:border-b-0 hover:bg-white/10 transition-colors ${
              user.id === currentUserId ? 'bg-blue-500/20' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              {/* User Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                    <Shield className="h-4 w-4 text-white/80" />
                  </div>
                  <div>
                    <h3 className="font-light text-white">
                      {user.firstName} {user.lastName}
                      {user.id === currentUserId && (
                        <span className="ml-2 text-xs bg-blue-500/20 text-blue-200 px-2 py-1 rounded-full border border-blue-300/30">
                          You
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${getStatusColor(user.status)}`}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(user.status)}
                          {user.status.replace('_', ' ').toUpperCase()}
                        </div>
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border backdrop-blur-sm ${getRoleColor(user.role)}`}>
                        {getRoleDisplayName(user.role)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white/80">
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
                  <div className="mt-2 text-xs text-white/60">
                    Last login: {new Date(user.lastLoginAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <button
                  onClick={() => onEditUser(user)}
                  className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20"
                  title="Edit user"
                >
                  <Edit className="h-4 w-4" />
                </button>

                {/* Status Dropdown */}
                {user.id !== currentUserId && (
                  <div className="relative">
                    <button
                      onClick={() => setDropdownOpen(dropdownOpen === user.id ? null : user.id)}
                      className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors border border-white/20"
                      title="Change status"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {dropdownOpen === user.id && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setDropdownOpen(null)}
                        />
                        <div className="absolute right-0 mt-2 w-48 rounded-lg shadow-lg z-50 bg-[#35373A] border border-white/30">
                          <div className="py-1">
                            {statusOptions
                              .filter(option => option.value !== user.status)
                              .map((option) => (
                                <button
                                  key={option.value}
                                  onClick={() => {
                                    onStatusUpdate(user.id, option.value);
                                    setDropdownOpen(null);
                                  }}
                                  className={`w-full text-left px-4 py-2 text-sm ${option.color} hover:bg-white/10 transition-colors`}
                                >
                                  {option.label}
                                </button>
                              ))}
                            
                            {/* Separator */}
                            <div className="border-t border-white/20 my-1"></div>
                            
                            {/* Delete Option */}
                            <button
                              onClick={() => {
                                onDeleteUser(user.id);
                                setDropdownOpen(null);
                              }}
                              className="w-full text-left px-4 py-2 text-sm text-red-300 hover:bg-red-500/20 transition-colors flex items-center gap-2"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete User
                            </button>
                          </div>
                        </div>
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