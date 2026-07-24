import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';

import { resetPasswordSchema, ResetPasswordValues } from '../../lib/validations/auth';
import { authApi } from '../../lib/api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { Icons } from '../Icons';

export const ResetPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch("password");

  const onSubmit = async (data: ResetPasswordValues) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      await authApi.resetPassword(token, data);
      toast.success("Đổi mật khẩu thành công! Chuyển hướng...");
      setTimeout(() => {
        navigate('/sign-in');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        setGlobalError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {globalError && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-200">
          {globalError}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu mới</Label>
        <Input 
          id="password" 
          type="password" 
          disabled={isLoading}
          {...register("password")} 
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
        <PasswordStrengthMeter password={password} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu mới</Label>
        <Input 
          id="confirmPassword" 
          type="password" 
          disabled={isLoading}
          {...register("confirmPassword")} 
        />
        {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Cập nhật mật khẩu
      </Button>
    </form>
  );
};
