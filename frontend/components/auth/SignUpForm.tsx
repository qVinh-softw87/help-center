import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { signUpSchema, SignUpValues } from '../../lib/validations/auth';
import { authApi } from '../../lib/api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { Icons } from '../Icons';

export const SignUpForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch("password");

  const onSubmit = async (data: SignUpValues) => {
    setIsLoading(true);
    try {
      await authApi.signUp(data);
      toast.success("Tạo tài khoản thành công!");
      navigate(`/verify-email?email=${encodeURIComponent(data.email)}`);
    } catch (error) {
      if (error instanceof Error) {
        setError("email", { message: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Họ và Tên</Label>
        <Input 
          id="name" 
          placeholder="Nguyễn Văn A" 
          disabled={isLoading}
          {...register("name")} 
        />
        {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
      </div>

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

      <div className="space-y-2">
        <Label htmlFor="password">Mật khẩu</Label>
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
        <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
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
        Tạo tài khoản
      </Button>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
        Đã có tài khoản?{' '}
        <Link to="/sign-in" className="text-brand-600 hover:underline dark:text-brand-500">
          Đăng nhập
        </Link>
      </div>
    </form>
  );
};
