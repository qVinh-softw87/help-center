import React from 'react';
import { ChangePasswordForm } from '../../components/settings/ChangePasswordForm';

export const SecurityPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <ChangePasswordForm />
    </div>
  );
};
