'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../components/AuthContext';
import Header from '../../components/Header';
import UserManagement from '../../components/UserManagement';
import LoginForm from '../../components/LoginForm';
import { Loader2, AlertTriangle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UserManagementPage() {
  const { user, permissions, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
          fontFamily: 'Times New Roman, serif'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10 text-center bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-white mb-4" />
          <p className="text-white/90 text-lg">Loading user management...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
          fontFamily: 'Times New Roman, serif'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10">
          <LoginForm />
        </div>
      </div>
    );
  }

  // Check permissions
  if (!permissions?.canManageUsers) {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-fixed flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
          fontFamily: 'Times New Roman, serif'
        }}
      >
        <div className="absolute inset-0 bg-black/70"></div>
        <div className="relative z-10">
          <Header />
          <main className="container mx-auto px-6 py-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl text-center">
              <h2 className="text-3xl font-light text-white mb-4 italic">Access Restricted</h2>
              <p className="text-white/80">You don't have permission to access user management.</p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-6 px-6 py-3 bg-[#EDE5D4] text-[#173559] rounded-lg hover:bg-[#E0D5C7] transition-colors font-medium"
              >
                Return to Dashboard
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed relative dashboard-container"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1533929736458-ca588d08c8be?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80&sat=-100')`,
        fontFamily: 'Times New Roman, serif'
      }}
    >
      <div className="absolute inset-0 bg-black/70"></div>
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          {/* Page Title */}
          <div className="mb-8">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
              <h1 className="text-4xl font-light text-white italic mb-2">
                User Management
              </h1>
              <p className="text-white/80 text-lg">
                Manage user accounts, roles, and permissions for the Blackwood Analytics portal
              </p>
            </div>
          </div>

          {/* User Management Content */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-lg p-8 shadow-2xl">
            <UserManagement />
          </div>
        </main>
      </div>
    </div>
  );
} 