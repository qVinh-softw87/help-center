import React from 'react';
import { SignInForm } from '../../components/auth/SignInForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';

export const SignInPage: React.FC = () => {
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
