'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import LoginForm from '@/components/LoginForm'
import { useRouter } from 'next/navigation'

export default function LandingPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // If user is already logged in, redirect to dashboard
  if (user && !loading) {
    router.push('/dashboard')
    return null
  }

  // Show loading state while checking authentication
  if (loading) {
  return (
      <div className="min-h-screen bg-[#EDE5D4] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#173559]"></div>
    </div>
  )
  }

  // Always show login form if not authenticated
  return <LoginForm />
} 