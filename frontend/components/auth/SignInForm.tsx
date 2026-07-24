import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

import { signInSchema, SignInValues } from '../../lib/validations/auth';
import { authApi } from '../../lib/api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Icons } from '../Icons';

export const SignInForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: SignInValues) => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const res = await authApi.signIn(data);
      if (res.token) {
        localStorage.setItem("accessToken", res.token);
      }
      toast.success("Đăng nhập thành công!");
      navigate('/settings'); // For demo purposes, redirect to settings
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Mật khẩu</Label>
          <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:underline dark:text-brand-500">
            Quên mật khẩu?
          </Link>
        </div>
        <Input 
          id="password" 
          type="password" 
          disabled={isLoading}
          {...register("password")} 
        />
        {errors.password && <p className="text-xs text-red-500">{errors.password.message}</p>}
      </div>

      <div className="flex items-center space-x-2 py-2">
        <input 
          type="checkbox" 
          id="rememberMe" 
          className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500" 
          disabled={isLoading}
          {...register("rememberMe")} 
        />
        <Label htmlFor="rememberMe" className="text-sm font-normal">Ghi nhớ đăng nhập</Label>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Đăng nhập
      </Button>

      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200 dark:border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500 dark:bg-slate-950 dark:text-slate-400">
            Hoặc tiếp tục với
          </span>
        </div>
      </div>

      <Button 
        type="button" 
        variant="outline" 
        className="w-full" 
        onClick={() => toast.info("Chức năng đang phát triển")}
        disabled={isLoading}
      >
        <svg className="mr-2 h-4 w-4" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
          <path fill="currentColor" d="M488 261.8C488 403.3 391.1 504 248 504 110.8 504 0 393.2 0 256S110.8 8 248 8c66.8 0 123 24.5 166.3 64.9l-67.5 64.9C258.5 52.6 94.3 116.6 94.3 256c0 86.5 69.1 156.6 153.7 156.6 98.2 0 135-70.4 140.8-106.9H248v-85.3h236.1c2.3 12.7 3.9 24.9 3.9 41.4z"></path>
        </svg>
        Google
      </Button>

      <div className="text-center text-sm text-slate-500 dark:text-slate-400 mt-4">
        Chưa có tài khoản?{' '}
        <Link to="/sign-up" className="text-brand-600 hover:underline dark:text-brand-500">
          Đăng ký
        </Link>
      </div>
    </form>
  );
};
