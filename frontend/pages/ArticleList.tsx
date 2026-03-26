import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useLanguage } from '../i18n';
import { helpCenterService } from '../services/helpCenterService';
import { ArticleSummary, EHelpArticleType } from '../types';
import { Icons } from '../components/Icons';

interface ArticleListProps {
  forcedType?: EHelpArticleType;
}

export const ArticleList: React.FC<ArticleListProps> = ({ forcedType }) => {
  const { language, t } = useLanguage();
  const { categoryId } = useParams();
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  
  const [articles, setArticles] = useState<ArticleSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');

  const formatPublishedAt = (publishedAt: string | null) => {
    if (!publishedAt) {
      return t('Chưa xuất bản', 'Not published');
    }

    return new Date(publishedAt).toLocaleDateString('vi-VN');
  };

  useEffect(() => {
    setLoading(true);
    const fetchArticles = async () => {
      try {
        if (forcedType) {
          switch(forcedType) {
            case EHelpArticleType.USER_MANUAL:
              setTitle(t('Hướng dẫn sử dụng', 'User Manuals'));
              break;
            case EHelpArticleType.BUSINESS_PLAYBOOK:
              setTitle(t('Giải pháp nghiệp vụ', 'Business Playbooks'));
              break;
            case EHelpArticleType.API_DOCS:
              setTitle(t('Tài liệu kỹ thuật', 'API Docs'));
              break;
            default:
              setTitle(t('Danh sách bài viết', 'Articles'));
          }
          const res = await helpCenterService.getArticles({ type: forcedType, languageCode: language });
          setArticles(res.articles);
        } else if (query) {
          setTitle(`${t('Kết quả tìm kiếm cho', 'Search results for')}: "${query}"`);
          const res = await helpCenterService.getArticles({ searchQuery: query, languageCode: language });
          setArticles(res.articles);
        } else if (categoryId) {
          setTitle(t('Danh sách bài viết', 'Articles')); 
          const res = await helpCenterService.getArticles({ categoryId: Number(categoryId), languageCode: language });
          setArticles(res.articles);
        } else {
           setTitle(t('Tất cả bài viết', 'All Articles'));
           const res = await helpCenterService.getArticles({ languageCode: language });
           setArticles(res.articles);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, [categoryId, query, forcedType, language, t]);

  const getTypeBadge = (type: EHelpArticleType) => {
    switch (type) {
      case EHelpArticleType.USER_MANUAL: return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">{t('Hướng dẫn', 'Guide')}</span>;
      case EHelpArticleType.BUSINESS_PLAYBOOK: return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-green-100 text-green-700">Playbook</span>;
      case EHelpArticleType.API_DOCS: return <span className="px-2 py-0.5 rounded text-xs font-semibold bg-purple-100 text-purple-700">API</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 min-h-screen">
      <div className="mb-8">
        {!forcedType && (
          <Link to="/" className="inline-flex items-center text-sm text-slate-500 hover:text-brand-600 mb-4 transition-colors">
            <Icons.Back className="w-4 h-4 mr-1" /> {t('Quay lại trang chủ', 'Back to home')}
          </Link>
        )}
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
      </div>

      {loading ? (
        <div className="space-y-4">
           {[1,2,3,4].map(i => <div key={i} className="h-32 bg-slate-100 rounded-xl animate-pulse" />)}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-20 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
          <Icons.Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900">{t('Không tìm thấy kết quả nào', 'No results found')}</h3>
          <p className="text-slate-500">{t('Thử tìm kiếm với từ khóa khác hoặc quay lại trang chủ.', 'Try another keyword or go back to the homepage.')}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {articles.map(article => (
            <Link 
              key={article.id}
              to={`/article/${article.slug}`}
              className="block bg-white p-6 rounded-xl border border-slate-200 hover:border-brand-400 hover:shadow-md transition-all group relative overflow-hidden"
            >
              {article.requiredPackage && (
                 <div className="absolute top-0 right-0 bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-bl-lg flex items-center gap-1">
                   <Icons.Lock className="w-3 h-3" /> {article.requiredPackage}
                 </div>
              )}
              
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 mb-1">
                  {getTypeBadge(article.type)}
                  <span className="text-xs text-slate-400">{formatPublishedAt(article.publishedAt)}</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-brand-600 transition-colors">
                {article.title}
              </h3>
              <p className="text-slate-600 text-sm mb-4 line-clamp-2">
                {article.summary}
              </p>

              <div className="flex items-center gap-4 text-xs text-slate-400">
                 <span>{article.viewCount} {t('lượt xem', 'views')}</span>
                 <span className="flex items-center gap-1"><Icons.ThumbsUp className="w-3 h-3" /> {article.helpfulCount}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};
