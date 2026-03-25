import React, { useState, useEffect } from 'react';
import { Icons } from './Icons';
import { useLocation, Link } from 'react-router-dom';
import { helpCenterService } from '../services/helpCenterService';
import { ArticleSummary } from '../types';

export const ContextualHelp: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation();

  // Use the actual current path
  const currentContext = location.pathname;

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      helpCenterService.getContextualHelp(currentContext)
        .then(data => setArticles(data))
        .catch(err => console.error("Failed to load contextual help", err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, currentContext]);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {isOpen && (
        <div className="mb-4 w-80 bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden animate-fade-in-up">
          <div className="bg-brand-600 px-4 py-3 flex justify-between items-center">
            <h3 className="text-white font-medium text-sm">Trợ giúp nhanh</h3>
            <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white">
              <Icons.Close className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4 max-h-80 overflow-y-auto">
            <p className="text-xs text-slate-500 mb-3">
              Gợi ý cho màn hình: <code className="bg-slate-100 px-1 rounded">{currentContext}</code>
            </p>
            {loading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-4 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : articles.length > 0 ? (
              <div className="space-y-3">
                {articles.map(article => (
                  <Link 
                    key={article.id} 
                    to={`/article/${article.slug}`}
                    className="block p-3 rounded-lg border border-slate-100 hover:border-brand-200 hover:bg-brand-50 transition-all group"
                  >
                    <div className="text-sm font-medium text-slate-700 group-hover:text-brand-700 mb-1 line-clamp-2">
                      {article.title}
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-slate-500 text-sm">
                Không tìm thấy bài viết liên quan.
              </div>
            )}
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
             <Link to="/" className="text-xs font-medium text-brand-600 hover:text-brand-700">
               Đến trung tâm trợ giúp &rarr;
             </Link>
          </div>
        </div>
      )}
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-brand-600 text-white rounded-full shadow-lg hover:bg-brand-700 transition-transform hover:scale-105 flex items-center justify-center focus:outline-none focus:ring-4 focus:ring-brand-500/30"
      >
        {isOpen ? <Icons.Close className="w-6 h-6" /> : <Icons.Help className="w-8 h-8" />}
      </button>
    </div>
  );
};