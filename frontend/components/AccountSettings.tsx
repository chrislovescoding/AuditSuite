'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from './AuthContext';
import { X, User, Lock, Mail, Phone, Building, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';

interface AccountSettingsProps {
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onClose }) => {
  const { user, token, setUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Profile form data
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    department: '',
    phoneNumber: '',
  });

  // Password form data
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName,
        lastName: user.lastName,
        department: user.department || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateProfileForm = () => {
    const errors: { [key: string]: string } = {};

    if (!profileData.firstName.trim()) {
      errors.firstName = 'First name is required';
    }

    if (!profileData.lastName.trim()) {
      errors.lastName = 'Last name is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePasswordForm = () => {
    const errors: { [key: string]: string } = {};

    if (!passwordData.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      errors.newPassword = 'New password must be at least 8 characters long';
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateProfileForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setSuccess('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePasswordForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      if (response.ok) {
        setSuccess('Password changed successfully!');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to change password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to change password');
    } finally {
      setLoading(false);
    }
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

  if (!user || !mounted) return null;

  const modalContent = (
    <>
      {/* Background overlay */}
      <div
        className="fixed inset-0 z-[60] bg-black/70"
        onClick={onClose}
      />
      
      {/* Modal content - Fixed positioning relative to viewport */}
      <div 
        className="fixed inset-0 z-[70] flex items-center justify-center p-4"
        style={{ fontFamily: 'Times New Roman, serif' }}
      >
        <div 
          className="bg-[#35373A] border border-white/30 rounded-lg shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto"
          style={{ border: '6px solid rgba(255, 255, 255, 0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 backdrop-blur-sm p-2 rounded-lg border border-white/30">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-light text-white italic">Account Settings</h2>
                <p className="text-sm text-white/80">Manage your profile and security settings</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors border border-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Account Info */}
          <div className="px-6 py-4 bg-white/5 border-b border-white/20">
            <div className="flex items-center gap-4">
              <div>
                <div className="font-light text-white text-lg">{user.firstName} {user.lastName}</div>
                <div className="text-sm text-white/80">{user.email}</div>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border backdrop-blur-sm ${getStatusColor(user.status)}`}>
                    {user.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-white/70">{getRoleDisplayName(user.role)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/20">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'profile'
                  ? 'border-white text-white bg-white/10'
                  : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <User className="h-4 w-4" />
              Profile Information
            </button>
            <button
              onClick={() => setActiveTab('password')}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === 'password'
                  ? 'border-white text-white bg-white/10'
                  : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Lock className="h-4 w-4" />
              Change Password
            </button>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mx-6 mt-4 p-4 bg-green-500/20 border border-green-300/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
              <Check className="h-5 w-5 text-green-200" />
              <p className="text-green-200">{success}</p>
            </div>
          )}

          {error && (
            <div className="mx-6 mt-4 p-4 bg-red-500/20 border border-red-300/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 text-red-200" />
              <p className="text-red-200">{error}</p>
            </div>
          )}

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-light text-white/90 mb-2">
                      First Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileInputChange}
                        className={`w-full pl-10 pr-3 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                          formErrors.firstName ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {formErrors.firstName && (
                      <p className="mt-1 text-sm text-red-300">{formErrors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-light text-white/90 mb-2">
                      Last Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileInputChange}
                        className={`w-full pl-10 pr-3 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                          formErrors.lastName ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                        }`}
                        disabled={loading}
                      />
                    </div>
                    {formErrors.lastName && (
                      <p className="mt-1 text-sm text-red-300">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="department" className="block text-sm font-light text-white/90 mb-2">
                    Department
                  </label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                    <input
                      type="text"
                      id="department"
                      name="department"
                      value={profileData.department}
                      onChange={handleProfileInputChange}
                      className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50"
                      placeholder="Enter your department"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-light text-white/90 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                    <input
                      type="tel"
                      id="phoneNumber"
                      name="phoneNumber"
                      value={profileData.phoneNumber}
                      onChange={handleProfileInputChange}
                      className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50"
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-white/80 border border-white/30 rounded-lg hover:bg-white/10 hover:text-white transition-colors backdrop-blur-sm"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 border border-white/30"
                      disabled={loading}
                    >
                      {loading ? 'Updating...' : 'Update Profile'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {activeTab === 'password' && (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-light text-white/90 mb-2">
                    Current Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full pl-10 pr-10 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                        formErrors.currentPassword ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                    >
                      {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.currentPassword && (
                    <p className="mt-1 text-sm text-red-300">{formErrors.currentPassword}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-light text-white/90 mb-2">
                    New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full pl-10 pr-10 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                        formErrors.newPassword ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                    >
                      {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.newPassword && (
                    <p className="mt-1 text-sm text-red-300">{formErrors.newPassword}</p>
                  )}
                  <p className="mt-1 text-sm text-white/70">
                    Password must be at least 8 characters long
                  </p>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-light text-white/90 mb-2">
                    Confirm New Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordInputChange}
                      className={`w-full pl-10 pr-10 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                        formErrors.confirmPassword ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                      }`}
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/60 hover:text-white/80"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-300">{formErrors.confirmPassword}</p>
                  )}
                </div>

                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-white/80 border border-white/30 rounded-lg hover:bg-white/10 hover:text-white transition-colors backdrop-blur-sm"
                      disabled={loading}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 border border-white/30"
                      disabled={loading}
                    >
                      {loading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );

  return createPortal(modalContent, document.body);
};

export default AccountSettings; 