import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface RouteGuardProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'STAFF';
}

export const RouteGuard: React.FC<RouteGuardProps> = ({ children, requiredRole }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Truy cập bị từ chối</h1>
          <p className="text-slate-600 mb-6">Bạn không có quyền truy cập trang này.</p>
          <a href="/" className="text-brand-600 hover:underline">Quay về trang chủ</a>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
