import React from 'react';
import { SignInForm } from '../../components/auth/SignInForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export const SignInPage: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    return <Navigate to="/admin" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-[400px]">
        <div className="text-center mb-8">
          <span className="text-2xl font-black text-brand-600">CataPos</span>
        </div>
        <Card>
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl">Đăng nhập</CardTitle>
            <CardDescription>
              Nhập email và mật khẩu để truy cập
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SignInForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
