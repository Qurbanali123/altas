'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/utils/auth';
import { usePermissions } from '@/context/PermissionsContext';
import DashboardRouteGuard from '@/components/admin/DashboardRouteGuard';
import { useDashboardAuthGuard } from '@/hooks/useDashboardAuthGuard';

interface ProtectedDashboardProps {
  children: React.ReactNode;
}

export default function ProtectedDashboard({ children }: ProtectedDashboardProps) {
  const router = useRouter();
  const { session, loading } = usePermissions();

  useDashboardAuthGuard();

  useEffect(() => {
    if (!loading && !session && !isAuthenticated()) {
      router.replace('/login');
    }
  }, [loading, session, router]);

  if (loading && !session) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#591727', fontSize: '18px' }}>Verifying access...</p>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <DashboardRouteGuard>{children}</DashboardRouteGuard>;
}
