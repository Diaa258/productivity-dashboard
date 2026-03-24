'use client';

import { useAuth } from '@/contexts/AuthContext';
import Dashboard from '@/components/dashboard/Dashboard';
import LoginPage from '@/components/auth/LoginPage';
import { RefreshProvider } from '@/contexts/RefreshContext';
import { Loader2 } from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <RefreshProvider>
      <Dashboard />
    </RefreshProvider>
  );
}
