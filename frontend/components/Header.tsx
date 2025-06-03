'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from './AuthContext';
import { User, LogOut, Settings, ChevronDown, Users } from 'lucide-react';
import AccountSettings from './AccountSettings';

const Header: React.FC = () => {
  const { user, logout, permissions } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showAccountSettings, setShowAccountSettings] = useState(false);

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
  };

  const handleAccountSettings = () => {
    setShowAccountSettings(true);
    setDropdownOpen(false);
  };

  const getRoleDisplayName = (role: string) => {
    return role.split('_').map(word => 
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
      default:
        return 'bg-white/20 text-white/80 border-white/30';
    }
  };

  return (
    <header 
      className="bg-white/10 backdrop-blur-lg border-b border-white/20 relative z-50"
      style={{ fontFamily: 'Times New Roman, serif' }}
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Title */}
          <Link href="/dashboard" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
            <img
              src="/Blackwood_Analytics_Logo.png"
              alt="Blackwood Analytics"
              className="h-12 w-auto object-contain"
            />
            <div>
              <h1 className="text-2xl font-bold text-white tracking-wide">BLACKWOOD ANALYTICS</h1>
              <p className="text-sm text-white/70 italic">Strategic Advisory Portal</p>
            </div>
          </Link>

          {/* User Menu */}
          {user && (
            <div className="relative z-50">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-white">
                      {user.firstName} {user.lastName}
                    </div>
                    <div className="text-sm text-white/70">
                      {getRoleDisplayName(user.role)}
                    </div>
                  </div>
                  <ChevronDown className={`h-4 w-4 text-white/60 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                </div>
              </button>

              {/* Dropdown Menu */}
              {dropdownOpen && (
                <>
                  {/* Click outside to close dropdown */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setDropdownOpen(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-80 rounded-lg shadow-2xl border-2 border-white/30 py-3 z-50" style={{ backgroundColor: '#35373A' }}>
                    {/* User Info */}
                    <div className="px-6 py-4 border-b border-white/30">
                      <div className="font-medium text-white text-lg">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-white/80 mb-3">{user.email}</div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(user.status)}`}>
                          {user.status.replace('_', ' ').toUpperCase()}
                        </span>
                        <span className="text-xs text-white/70">
                          {getRoleDisplayName(user.role)}
                        </span>
                      </div>
                      {user.department && (
                        <div className="text-xs text-white/70 mt-2">
                          Department: {user.department}
                        </div>
                      )}
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      <button
                        onClick={handleAccountSettings}
                        className="w-full text-left px-6 py-3 text-sm text-white/95 hover:bg-white/10 flex items-center gap-3 transition-colors"
                      >
                        <Settings className="h-4 w-4" />
                        Account Settings
                      </button>
                      
                      {permissions?.canManageUsers && (
                        <Link
                          href="/user-management"
                          className="w-full text-left px-6 py-3 text-sm text-white/95 hover:bg-white/10 flex items-center gap-3 transition-colors"
                          onClick={() => setDropdownOpen(false)}
                        >
                          <Users className="h-4 w-4" />
                          User Management
                        </Link>
                      )}
                      
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-6 py-3 text-sm text-red-300 hover:bg-red-500/20 flex items-center gap-3 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>

                    {/* Last Login */}
                    {user.lastLoginAt && (
                      <div className="px-6 py-3 border-t border-white/30">
                        <div className="text-xs text-white/70">
                          Last login: {new Date(user.lastLoginAt).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Account Settings Modal */}
      {showAccountSettings && (
        <AccountSettings onClose={() => setShowAccountSettings(false)} />
      )}
    </header>
  );
};

export default Header; 