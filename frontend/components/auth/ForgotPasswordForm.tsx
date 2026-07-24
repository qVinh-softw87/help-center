import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

import { forgotPasswordSchema, ForgotPasswordValues } from '../../lib/validations/auth';
import { authApi } from '../../lib/api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Icons } from '../Icons';

export const ForgotPasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    setIsLoading(true);
    try {
      await authApi.forgotPassword(data);
      setIsSubmitted(true);
    } catch (error) {
      toast.error("Có lỗi xảy ra, vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
        <div className="mx-auto w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
          <Icons.Check className="w-6 h-6" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Kiểm tra email của bạn</h3>
        <p className="text-slate-500 text-sm">
          Chúng tôi đã gửi một liên kết khôi phục mật khẩu. Vui lòng kiểm tra hộp thư đến hoặc hộp thư rác.
        </p>
        <Button asChild variant="outline" className="mt-4 w-full">
          <Link to="/sign-in">Quay lại đăng nhập</Link>
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input 
          id="email" 
          type="email" 
          placeholder="name@example.com" 
          disabled={isLoading}
          {...register("email")} 
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Gửi yêu cầu
      </Button>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
        Nhớ mật khẩu?{' '}
        <Link to="/sign-in" className="text-brand-600 hover:underline dark:text-brand-500">
          Quay lại đăng nhập
        </Link>
      </div>
    </form>
  );
};
