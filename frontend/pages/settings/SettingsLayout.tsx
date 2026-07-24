import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Icons } from '../../components/Icons';

export const SettingsLayout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="bg-slate-50 dark:bg-slate-900 min-h-screen pb-12">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 mb-4 transition-colors">
            <Icons.Back className="w-4 h-4 mr-1" /> Quay lại trang chủ
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Cài đặt tài khoản</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
        {/* Sidebar Nav */}
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:w-64 flex-shrink-0">
          <Link
            to="/settings/profile"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              location.pathname.includes('/settings/profile') || location.pathname === '/settings'
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            Hồ sơ cá nhân
          </Link>
          <Link
            to="/settings/security"
            className={`px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-colors ${
              location.pathname.includes('/settings/security')
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-slate-50'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/50'
            }`}
          >
            Bảo mật & Đăng nhập
          </Link>
        </nav>

        {/* Content area */}
        <div className="flex-grow">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
