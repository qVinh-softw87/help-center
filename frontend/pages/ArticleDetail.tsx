import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import { useLanguage } from '../i18n';
import { helpCenterService } from '../services/helpCenterService';
import { ArticleDetail as IArticleDetail, EHelpFeedbackType } from '../types';
import { Icons } from '../components/Icons';

// Component to render EditorJS block data
const BlockContentRenderer: React.FC<{ content: string }> = ({ content }) => {
  try {
    const data = JSON.parse(content);
    if (!data.blocks || !Array.isArray(data.blocks)) return null;

    return (
      <>
        {data.blocks.map((block: any) => {
          switch (block.type) {
            case 'header':
              const Tag = `h${block.data.level}` as React.ElementType;
              return <Tag key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            case 'paragraph':
              return <p key={block.id} dangerouslySetInnerHTML={{ __html: block.data.text }} />;
            case 'list':
              const ListTag = (block.data.style === 'ordered' ? 'ol' : 'ul') as React.ElementType;
              return (
                <ListTag key={block.id}>
                  {block.data.items.map((item: string, idx: number) => (
                    <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ListTag>
              );
            case 'quote':
              return (
                <blockquote key={block.id} className="border-l-4 border-brand-500 pl-4 italic text-slate-600 my-4">
                  <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
                  {block.data.caption && <footer className="text-sm mt-2 text-slate-500" dangerouslySetInnerHTML={{ __html: block.data.caption }} />}
                </blockquote>
              );
            case 'image':
              return (
                <figure key={block.id} className="my-6">
                  <img 
                    src={block.data.file?.url || block.data.url} 
                    alt={block.data.caption || ''} 
                    className={`rounded-lg shadow-md max-w-full ${block.data.withBorder ? 'border border-slate-200' : ''} ${block.data.withBackground ? 'bg-slate-50 p-4' : ''} ${block.data.stretched ? 'w-full' : ''}`} 
                  />
                  {block.data.caption && <figcaption className="text-center text-sm text-slate-500 mt-2">{block.data.caption}</figcaption>}
                </figure>
              );
            case 'code':
              return (
                <pre key={block.id} className="bg-slate-800 text-slate-100 p-4 rounded-lg overflow-x-auto my-4">
                  <code>{block.data.code}</code>
                </pre>
              );
            case 'delimiter':
              return <hr key={block.id} className="my-8 border-t border-slate-200" />;
            default:
              return null;
          }
        })}
      </>
    );
  } catch (e) {
    console.error("Error parsing content JSON", e);
    return <div className="p-4 bg-red-50 text-red-600 rounded">Unable to render article content.</div>;
  }
};

export const ArticleDetail: React.FC = () => {
  const { language, t } = useLanguage();
  const { slug } = useParams();
  const [data, setData] = useState<{ article: IArticleDetail, hasAccess: boolean, relatedArticles: any[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      helpCenterService.getArticleBySlug(slug, language)
        .then(res => setData(res))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [slug, language]);

  const handleFeedback = async (type: EHelpFeedbackType) => {
    if (data && !feedbackSent) {
      try {
        setFeedbackError(null);
        await helpCenterService.sendFeedback(data.article.id, type);
        setFeedbackSent(true);
      } catch (error) {
        setFeedbackError(
          error instanceof Error ? error.message : t('Không thể gửi feedback lúc này.', 'Unable to submit feedback right now.'),
        );
      }
    }
  };

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <div className="h-8 w-3/4 bg-slate-200 rounded animate-pulse mb-6" />
      <div className="h-4 w-1/2 bg-slate-100 rounded animate-pulse mb-12" />
      <div className="space-y-4">
        {[1,2,3,4,5].map(i => <div key={i} className="h-4 w-full bg-slate-100 rounded animate-pulse" />)}
      </div>
    </div>
  );

  if (!data) return <div className="p-12 text-center">Không tìm thấy bài viết</div>;

  const { article, hasAccess, relatedArticles } = data;

  const publishedAtText = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('vi-VN')
    : t('Chưa xuất bản', 'Not published yet');

  return (
    <div className="bg-white min-h-screen pb-12">
      {/* Breadcrumb / Header */}
      <div className="bg-slate-50 border-b border-slate-200 py-8">
         <div className="max-w-5xl mx-auto px-4">
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-4">
              <Link to="/" className="hover:text-brand-600">{t('Trung tâm trợ giúp', 'Help Center')}</Link>
              <Icons.ChevronRight className="w-4 h-4" />
              {article.category ? (
                <Link to={`/category/${article.categoryId}`} className="hover:text-brand-600">{article.category.name}</Link>
              ) : (
                <span>Bài viết</span>
              )}
            </div>
            <h1 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">{article.title}</h1>
            <div className="flex items-center gap-6 text-sm text-slate-500">
               <div className="flex items-center gap-2">
                 <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center font-bold text-xs">A</div>
                 <span>{t('Cập nhật', 'Updated')}: {publishedAtText}</span>
               </div>
               {article.requiredPackage && (
                 <span className="flex items-center gap-1 text-orange-600 font-medium bg-orange-50 px-2 py-0.5 rounded">
                   <Icons.Lock className="w-3 h-3" /> {t('Gói', 'Plan')} {article.requiredPackage}
                 </span>
               )}
            </div>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-4 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {hasAccess ? (
            <article className="markdown-content prose prose-slate max-w-none">
              {article.contentType === 'json' ? (
                <BlockContentRenderer content={article.content} />
              ) : (
                <ReactMarkdown>{article.content}</ReactMarkdown>
              )}
            </article>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 text-center my-8">
              <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <Icons.Lock className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('Nội dung bị giới hạn', 'Restricted content')}</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                {t('Bài viết này dành riêng cho gói cước', 'This article is available only for the')} <strong>{article.requiredPackage}</strong>.{' '}
                {t('Vui lòng nâng cấp gói cước của bạn để xem nội dung chi tiết.', 'Please upgrade your plan to view the full content.')}
              </p>
              <button className="bg-brand-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-brand-700 transition-colors">
                {t('Nâng cấp ngay', 'Upgrade now')}
              </button>
            </div>
          )}

          {/* Feedback Section */}
          {hasAccess && (
            <div className="mt-16 pt-8 border-t border-slate-200">
              <div className="bg-slate-50 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-slate-900">{t('Bài viết này có hữu ích không?', 'Was this article helpful?')}</h4>
                  <p className="text-sm text-slate-500">{article.helpfulCount} {t('người thấy hữu ích', 'people found this helpful')}</p>
                </div>
                {!feedbackSent ? (
                  <div className="flex gap-3">
                    <button 
                      onClick={() => handleFeedback(EHelpFeedbackType.HELPFUL)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      <Icons.ThumbsUp className="w-4 h-4" /> {t('Có', 'Yes')}
                    </button>
                    <button 
                      onClick={() => handleFeedback(EHelpFeedbackType.NOT_HELPFUL)}
                      className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg hover:border-red-500 hover:text-red-600 transition-colors"
                    >
                      <Icons.ThumbsDown className="w-4 h-4" /> {t('Không', 'No')}
                    </button>
                  </div>
                ) : (
                  <div className="text-green-600 font-medium text-sm animate-fade-in">
                    {t('Cảm ơn phản hồi của bạn!', 'Thanks for your feedback!')}
                  </div>
                )}
              </div>
              {feedbackError && (
                <p className="text-sm text-red-600">{feedbackError}</p>
              )}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block space-y-8">
          {relatedArticles.length > 0 && (
            <div>
              <h4 className="font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100">{t('Bài viết liên quan', 'Related articles')}</h4>
              <div className="space-y-3">
                {relatedArticles.map((rel: any) => (
                  <Link 
                    key={rel.id} 
                    to={`/article/${rel.slug}`} 
                    className="block text-sm text-slate-600 hover:text-brand-600 hover:underline line-clamp-2"
                  >
                    {rel.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
          
          <div className="bg-brand-50 rounded-xl p-6">
            <h4 className="font-bold text-brand-800 mb-2">{t('Cần trợ giúp thêm?', 'Need more help?')}</h4>
            <p className="text-sm text-brand-600 mb-4">
              {t('Không tìm thấy câu trả lời bạn cần? Liên hệ với đội hỗ trợ của chúng tôi.', 'Cannot find what you need? Contact our support team.')}
            </p>
            <button className="w-full py-2 bg-brand-600 text-white text-sm font-medium rounded-lg hover:bg-brand-700 transition-colors">
              {t('Gửi Ticket', 'Submit Ticket')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
