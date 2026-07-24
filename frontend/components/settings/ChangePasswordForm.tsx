import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

import { changePasswordSchema, ChangePasswordValues } from '../../lib/validations/auth';
import { authApi } from '../../lib/api/auth';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Icons } from '../Icons';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

export const ChangePasswordForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    },
  });

  const newPassword = watch("newPassword") || "";

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);

  const onSubmit = async (data: ChangePasswordValues) => {
    setIsLoading(true);
    try {
      await authApi.changePassword(data);
      toast.success("Cập nhật mật khẩu thành công");
      reset();
    } catch (error) {
      if (error instanceof Error) {
        setError("currentPassword", { message: error.message });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đổi mật khẩu</CardTitle>
        <CardDescription>
          Đảm bảo tài khoản của bạn sử dụng một mật khẩu mạnh và an toàn.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Mật khẩu hiện tại</Label>
            <Input 
              id="currentPassword" 
              type="password" 
              disabled={isLoading}
              {...register("currentPassword")} 
            />
            {errors.currentPassword && <p className="text-xs text-red-500">{errors.currentPassword.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">Mật khẩu mới</Label>
            <Input 
              id="newPassword" 
              type="password" 
              disabled={isLoading}
              {...register("newPassword")} 
            />
            {errors.newPassword && <p className="text-xs text-red-500">{errors.newPassword.message}</p>}
            
            {/* Checklist */}
            <div className="pt-2 space-y-1">
              <div className="flex items-center gap-2 text-xs">
                {hasLength ? <Icons.Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                <span className={hasLength ? "text-slate-900 dark:text-slate-100" : "text-slate-500"}>Ít nhất 8 ký tự</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasUpper ? <Icons.Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                <span className={hasUpper ? "text-slate-900 dark:text-slate-100" : "text-slate-500"}>Chứa ít nhất 1 chữ hoa</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                {hasNumber ? <Icons.Check className="w-3 h-3 text-green-500" /> : <div className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600" />}
                <span className={hasNumber ? "text-slate-900 dark:text-slate-100" : "text-slate-500"}>Chứa ít nhất 1 chữ số</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới</Label>
            <Input 
              id="confirmNewPassword" 
              type="password" 
              disabled={isLoading}
              {...register("confirmNewPassword")} 
            />
            {errors.confirmNewPassword && <p className="text-xs text-red-500">{errors.confirmNewPassword.message}</p>}
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading && <Icons.Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu mật khẩu
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
