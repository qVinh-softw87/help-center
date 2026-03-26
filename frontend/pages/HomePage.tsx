import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { SearchBar } from '../components/SearchBar';
import { Icons, getIconByName } from '../components/Icons';
import { helpCenterService } from '../services/helpCenterService';
import { Category } from '../types';

export const HomePage: React.FC = () => {
  const { language, t } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    helpCenterService.getCategories(language)
      .then(data => setCategories(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [language]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <div className="bg-gradient-to-b from-brand-50 to-white py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-slate-900 mb-6 tracking-tight">
            {t('Chúng tôi có thể giúp gì cho bạn?', 'How can we help you?')}
          </h1>
          <p className="text-lg text-slate-600 mb-10">
            {t('Tìm kiếm hướng dẫn, câu trả lời và tài liệu kỹ thuật cho CataPos.', 'Search guides, answers, and technical documentation for CataPos.')}
          </p>
          <div className="shadow-xl shadow-brand-500/10 rounded-xl">
            <SearchBar placeholder={t('Tìm kiếm bài viết, hướng dẫn...', 'Search articles and guides...')} />
          </div>
          
          <div className="mt-6 flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span>{t('Phổ biến:', 'Popular:')}</span>
            <Link to="/search?q=kết nối máy in" className="text-brand-600 hover:underline">{t('Kết nối máy in', 'Printer setup')}</Link>
            <Link to="/search?q=tạo đơn hàng" className="text-brand-600 hover:underline">{t('Tạo đơn hàng', 'Create order')}</Link>
            <Link to="/search?q=api" className="text-brand-600 hover:underline">API Key</Link>
          </div>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 w-full">
        <h2 className="text-2xl font-bold text-slate-900 mb-8">{t('Khám phá theo chủ đề', 'Explore by topic')}</h2>
        
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="h-48 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Link 
                key={category.id} 
                to={`/category/${category.id}`}
                className="group p-6 bg-white rounded-xl border border-slate-200 hover:border-brand-300 hover:shadow-lg hover:shadow-brand-500/5 transition-all duration-300 flex flex-col"
              >
                <div className="w-12 h-12 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600 mb-4 group-hover:bg-brand-600 group-hover:text-white transition-colors">
                  {getIconByName(category.iconUrl || '')}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4 line-clamp-2 flex-grow">
                  {category.description}
                </p>
                <div className="flex items-center text-sm font-medium text-brand-600 mt-auto">
                  {category.articleCount} {t('bài viết', 'articles')} <Icons.ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links / Support */}
      <div className="bg-slate-50 py-16 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{t('Vẫn chưa tìm thấy câu trả lời?', 'Still cannot find your answer?')}</h2>
          <p className="text-slate-600 mb-8">{t('Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn.', 'Our support team is always ready to help.')}</p>
          <div className="flex justify-center gap-4">
            <button className="px-6 py-3 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors">
              {t('Gửi yêu cầu hỗ trợ', 'Submit support request')}
            </button>
            <button className="px-6 py-3 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/20">
              {t('Chat với chúng tôi', 'Chat with us')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
