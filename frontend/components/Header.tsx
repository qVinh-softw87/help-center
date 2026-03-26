import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { SearchBar } from './SearchBar';

export const Header: React.FC = () => {
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();

  const isActive = (path: string) => {
    return location.pathname === path ? 'text-brand-600 font-semibold' : 'text-slate-600 hover:text-brand-600';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link to="/" className="flex items-center gap-2 group">
             <svg className="w-8 h-8 group-hover:scale-105 transition-transform" width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M262.491 76.5456C187.907 105.085 134.946 177.335 134.946 261.953C134.946 282.667 138.119 302.64 144.007 321.411C64.0419 318.862 0 253.235 0 172.651C0 90.4506 66.6367 23.8139 148.837 23.8139C194.405 23.8139 235.189 44.2912 262.491 76.5456Z" fill="#303F9F"></path><path d="M399.806 427.803C465.561 401.449 512 337.125 512 261.953C512 163.313 432.036 83.3488 333.395 83.3488C234.755 83.3488 154.791 163.313 154.791 261.953C154.791 272.609 155.724 283.047 157.513 293.189C182.314 255.261 225.161 230.202 273.86 230.202C350.581 230.202 412.775 292.396 412.775 369.116C412.775 390.089 408.128 409.976 399.806 427.803Z" fill="#FFB300"></path><path d="M392.93 369.116C392.93 434.877 339.621 488.186 273.86 488.186C208.1 488.186 154.791 434.877 154.791 369.116C154.791 303.356 208.1 250.047 273.86 250.047C339.621 250.047 392.93 303.356 392.93 369.116Z" fill="#FF4081"></path></svg>
             <div className="flex flex-col">
               <span className="font-semibold leading-none" style={{ color: 'rgb(23, 47, 204)' }}>CATA<span className="font-light">POS</span></span>
               <span className="text-xs text-slate-500 font-medium">Help Center</span>
             </div>
          </Link>

          <nav className="hidden md:flex gap-6">
            <Link to="/" className={`text-sm font-medium transition-colors ${isActive('/')}`}>{t('Trang chủ', 'Home')}</Link>
            <Link to="/categories/user-manual" className={`text-sm font-medium transition-colors ${isActive('/categories/user-manual')}`}>{t('Hướng dẫn sử dụng', 'User Manuals')}</Link>
            <Link to="/categories/business-playbook" className={`text-sm font-medium transition-colors ${isActive('/categories/business-playbook')}`}>{t('Giải pháp nghiệp vụ', 'Business Playbooks')}</Link>
            <Link to="/categories/api-docs" className={`text-sm font-medium transition-colors ${isActive('/categories/api-docs')}`}>{t('Tài liệu kỹ thuật', 'API Docs')}</Link>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block w-64">
            <SearchBar variant="header" placeholder={t('Tìm kiếm nhanh...', 'Quick search...')} />
          </div>
          <div className="flex items-center gap-2">
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as 'vi' | 'en')}
              className="bg-transparent text-sm font-medium text-slate-600 border-none outline-none cursor-pointer hover:text-brand-600"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>
    </header>
  );
};
