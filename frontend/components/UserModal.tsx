'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { X, User, Mail, Phone, Building, Shield, AlertCircle, Check } from 'lucide-react';

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

interface UserModalProps {
  user?: User | null;
  onClose: () => void;
  onUserUpdated: () => void;
}

const UserModal: React.FC<UserModalProps> = ({ user, onClose, onUserUpdated }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'auditor',
    department: '',
    phoneNumber: '',
  });

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const roles = [
    { value: 'system_admin', label: 'System Administrator', description: 'Full system access' },
    { value: 'lead_auditor', label: 'Lead Auditor', description: 'Manages audits and teams' },
    { value: 'senior_auditor', label: 'Senior Auditor', description: 'Approves reports and reviews' },
    { value: 'auditor', label: 'Auditor', description: 'Conducts audits and uploads documents' },
    { value: 'analyst', label: 'Analyst', description: 'Reviews and analyzes documents' },
    { value: 'external_reviewer', label: 'External Reviewer', description: 'Limited access for reviews' },
    { value: 'councillor', label: 'Councillor', description: 'Views final reports only' },
  ];

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        password: '', // Don't populate password for editing
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        department: user.department || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!user && !formData.password) {
      errors.password = 'Password is required for new users';
    } else if (!user && formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    }

    if (!formData.firstName) {
      errors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      errors.lastName = 'Last name is required';
    }

    if (!formData.role) {
      errors.role = 'Role is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = user 
        ? `/api/auth/users/${user.id}`
        : '/api/auth/register';
      
      const method = user ? 'PUT' : 'POST';
      
      const body = user 
        ? {
            firstName: formData.firstName,
            lastName: formData.lastName,
            department: formData.department,
            phoneNumber: formData.phoneNumber,
            role: formData.role,
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onUserUpdated();
        }, 1000);
      } else {
        throw new Error(data.error || `Failed to ${user ? 'update' : 'create'} user`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${user ? 'update' : 'create'} user`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    
    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div 
        className="bg-[#35373A] rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        style={{ 
          border: '6px solid rgba(255, 255, 255, 0.2)',
          fontFamily: 'Times New Roman, serif'
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-full border border-white/30">
              <User className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-light text-white italic">
                {user ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-sm text-white/80">
                {user ? 'Update user information and role' : 'Add a new user to the system'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/60 hover:text-white rounded-lg hover:bg-white/10 transition-colors border border-white/20"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Success Message */}
        {success && (
          <div className="m-6 p-4 bg-green-500/20 border border-green-300/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
            <Check className="h-5 w-5 text-green-200" />
            <p className="text-green-200">
              User {user ? 'updated' : 'created'} successfully!
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="m-6 p-4 bg-red-500/20 border border-red-300/30 rounded-lg flex items-center gap-3 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-red-200" />
            <p className="text-red-200">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-light text-white italic">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-light text-white/90 mb-2">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                    formErrors.firstName ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                  }`}
                  disabled={loading || success}
                />
                {formErrors.firstName && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.firstName}</p>
                )}
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-light text-white/90 mb-2">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                    formErrors.lastName ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                  }`}
                  disabled={loading || success}
                />
                {formErrors.lastName && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.lastName}</p>
                )}
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-light text-white italic">Contact Information</h3>
            
            <div>
              <label htmlFor="email" className="block text-sm font-light text-white/90 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                    formErrors.email ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                  }`}
                  disabled={loading || success}
                />
              </div>
              {formErrors.email && (
                <p className="mt-1 text-sm text-red-300">{formErrors.email}</p>
              )}
            </div>

            {!user && (
              <div>
                <label htmlFor="password" className="block text-sm font-light text-white/90 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50 ${
                    formErrors.password ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                  }`}
                  disabled={loading || success}
                  placeholder="Minimum 8 characters"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-300">{formErrors.password}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50"
                    disabled={loading || success}
                  />
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
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white placeholder-white/50"
                    disabled={loading || success}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Role Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-light text-white italic">Role & Permissions</h3>
            
            <div>
              <label htmlFor="role" className="block text-sm font-light text-white/90 mb-2">
                Role *
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/60 h-5 w-5" />
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className={`w-full pl-10 pr-4 py-2 bg-white/10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/40 text-white ${
                    formErrors.role ? 'border-red-300/50 bg-red-500/10' : 'border-white/30'
                  }`}
                  disabled={loading || success}
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value} className="bg-[#35373A] text-white">
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.role && (
                <p className="mt-1 text-sm text-red-300">{formErrors.role}</p>
              )}
              
              {/* Role Description */}
              {formData.role && (
                <div className="mt-2 p-3 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
                  <p className="text-sm text-white/80">
                    {roles.find(r => r.value === formData.role)?.description}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-6 border-t border-white/20">
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
              disabled={loading || success}
              className="px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors disabled:opacity-50 border border-white/30 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  {user ? 'Updating...' : 'Creating...'}
                </>
              ) : success ? (
                <>
                  <Check className="h-4 w-4" />
                  {user ? 'Updated!' : 'Created!'}
                </>
              ) : (
                user ? 'Update User' : 'Create User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal; 