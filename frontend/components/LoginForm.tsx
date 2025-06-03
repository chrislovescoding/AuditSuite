'use client';

import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onBack?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onBack }) => {
  const { login, loading, error } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await login(formData.email, formData.password);
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center p-4"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
        fontFamily: 'Times New Roman, serif'
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/50"></div>
      
      {/* Blackwood Analytics Logo */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-10">
        <div className="flex flex-col items-center">
          {/* Logo Image */}
          <img
            src="/Blackwood_Analytics_Logo.png"
            alt="Blackwood Analytics"
            className="h-48 w-auto object-contain mb-4"
          />
        </div>
      </div>

      {/* Login Tile */}
      <div className="relative z-10 w-full max-w-lg">
        {/* Frosted Glass Container */}
        <div 
          className="bg-white/10 backdrop-blur-lg border-white/20 shadow-2xl p-12"
          style={{ 
            border: '6px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '12px'
          }}
        >
          {/* Main Heading */}
          <div className="text-center mb-8">
            <h1 className="text-4xl text-white mb-6 italic font-light">
              Clarity. Strategy. Results.
            </h1>
            <p className="text-lg text-white/90 leading-relaxed">
              Access our secure client portal to view strategic insights, 
              financial analysis, and bespoke research tailored to your organisation.
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm border border-red-300/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-300 flex-shrink-0" />
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-white/90 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 ${
                  formErrors.email ? 'border-red-300/50 bg-red-500/10' : 'border-white/20'
                }`}
                style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
                placeholder="your@email.com"
                disabled={loading}
              />
              {formErrors.email && (
                <p className="mt-2 text-sm text-red-300">{formErrors.email}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-white/90 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 bg-white/10 backdrop-blur-sm border text-white placeholder-white/60 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/50 focus:border-white/50 pr-12 ${
                    formErrors.password ? 'border-red-300/50 bg-red-500/10' : 'border-white/20'
                  }`}
                  style={{ border: '2px solid rgba(255, 255, 255, 0.2)' }}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-white/60 hover:text-white"
                  disabled={loading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {formErrors.password && (
                <p className="mt-2 text-sm text-red-300">{formErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white/20 backdrop-blur-sm hover:bg-white/30 disabled:bg-white/10 text-white font-medium py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-3 border border-white/30"
              style={{ border: '2px solid rgba(255, 255, 255, 0.3)' }}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Accessing Portal...
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  Access Portal
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm; 