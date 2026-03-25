import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-white font-bold mb-4">CataPos Help Center</h3>
            <p className="text-sm">Hệ thống quản trị tri thức chuyên nghiệp dành cho Tenant.</p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Sản phẩm</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tính năng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Bảng giá</a></li>
              <li><a href="#" className="hover:text-white transition-colors">API</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Tài nguyên</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tài liệu hướng dẫn</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Cộng đồng</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Changelog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Gửi yêu cầu hỗ trợ</a></li>
              <li><a href="#" className="hover:text-white transition-colors">support@catapos.com</a></li>
              <li><a href="#" className="hover:text-white transition-colors">1900 1234</a></li>
            </ul>
          </div>
        </div>
        <div className="pt-8 border-t border-slate-800 text-sm text-center">
          © {new Date().getFullYear()} CataPos. All rights reserved.
        </div>
      </div>
    </footer>
  );
};