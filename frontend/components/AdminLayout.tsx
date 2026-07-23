import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Icons } from './Icons';

export const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-800 text-slate-200 flex flex-col">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-xl font-bold">CataPos Admin</h1>
          <p className="text-xs text-slate-400">Help Center Manager</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin/categories"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Icons.Settings className="w-5 h-5" />
            Categories
          </Link>
          <Link
            to="/admin/articles"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
          >
            <Icons.Book className="w-5 h-5" />
            Articles
          </Link>
          {user?.role === 'ADMIN' && (
            <Link
              to="/admin/users"
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <Icons.User className="w-5 h-5" />
              Users
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-brand-600 flex items-center justify-center text-white font-medium">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-slate-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout().then(() => navigate('/'))}
            className="w-full flex items-center gap-3 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Icons.X className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
