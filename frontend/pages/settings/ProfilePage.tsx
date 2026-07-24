import React from 'react';
import { AvatarUploader } from '../../components/settings/AvatarUploader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Button } from '../../components/ui/button';

export const ProfilePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Hồ sơ cá nhân</CardTitle>
          <CardDescription>
            Cập nhật ảnh đại diện và thông tin cá nhân của bạn.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <AvatarUploader />
          
          <div className="space-y-4 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="name">Họ và Tên</Label>
              <Input id="name" defaultValue="Test User" />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="test@example.com" disabled />
              <p className="text-xs text-slate-500">Email không thể thay đổi.</p>
            </div>
            
            <Button>Lưu thay đổi</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
