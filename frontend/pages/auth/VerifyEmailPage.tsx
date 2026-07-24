import React from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Icons } from '../../components/Icons';

export const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get('email') || 'bạn';

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
      <div className="w-full max-w-[400px]">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
              <Icons.Mail className="w-8 h-8" />
            </div>
            <CardTitle className="text-2xl">Xác thực Email</CardTitle>
            <CardDescription>
              Chúng tôi đã gửi một liên kết xác thực đến <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-slate-500">
              Vui lòng kiểm tra hộp thư đến (và thư mục rác) và click vào liên kết để kích hoạt tài khoản.
            </p>
            <Button asChild className="w-full">
              <Link to="/sign-in">Đã xác thực, tới Đăng nhập</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
