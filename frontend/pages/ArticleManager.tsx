import React, { useState, useEffect } from 'react';
import { helpCenterService } from '../services/helpCenterService';
import { AdminArticle, CreateArticleDto, UpdateArticleDto, EHelpArticleType, AdminCategory } from '../types';
import { Icons } from '../components/Icons';

export const ArticleManager: React.FC = () => {
  const [articles, setArticles] = useState<AdminArticle[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<CreateArticleDto>({
    categoryId: 0,
    type: EHelpArticleType.USER_MANUAL,
    title: '',
    summary: '',
    content: '',
    contentType: 'markdown',
    tags: [],
    contextPaths: [],
    isFeatured: false,
    isPinned: false,
    languageCode: 'vi',
  });

  const fetchArticles = async () => {
    try {
      const [articlesData, categoriesData] = await Promise.all([
        helpCenterService.getAdminArticles(),
        helpCenterService.getAdminCategories(),
      ]);
      setArticles(articlesData);
      setCategories(categoriesData);
      if (categoriesData.length > 0) {
        setFormData(prev => ({ ...prev, categoryId: categoriesData[0].id }));
      }
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load articles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await helpCenterService.updateArticle(editingId, formData as UpdateArticleDto);
      } else {
        await helpCenterService.createArticle(formData);
      }
      setShowModal(false);
      resetForm();
      fetchArticles();
    } catch (error) {
      console.error('Failed to save article:', error);
      alert('Failed to save article');
    }
  };

  const handleEdit = (article: AdminArticle) => {
    setEditingId(article.id);
    setFormData({
      categoryId: article.categoryId,
      type: article.type,
      title: article.title,
      summary: article.summary,
      content: article.content,
      contentType: article.contentType,
      tags: article.tags,
      contextPaths: article.contextPaths,
      isFeatured: article.isFeatured,
      isPinned: article.isPinned,
      languageCode: article.languageCode,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this article?')) {
      try {
        await helpCenterService.deleteArticle(id);
        fetchArticles();
      } catch (error) {
        console.error('Failed to delete article:', error);
        alert('Failed to delete article');
      }
    }
  };

  const handlePublish = async (id: number, publish: boolean) => {
    try {
      await helpCenterService.publishArticle(id, publish);
      fetchArticles();
    } catch (error) {
      console.error('Failed to update publish status:', error);
      alert('Failed to update publish status');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      categoryId: categories.length > 0 ? categories[0].id : 0,
      type: EHelpArticleType.USER_MANUAL,
      title: '',
      summary: '',
      content: '',
      contentType: 'markdown',
      tags: [],
      contextPaths: [],
      isFeatured: false,
      isPinned: false,
      languageCode: 'vi',
    });
  };

  const handleTagsChange = (value: string) => {
    setFormData({ ...formData, tags: value.split(',').map(tag => tag.trim()).filter(Boolean) });
  };

  const handleContextPathsChange = (value: string) => {
    setFormData({ ...formData, contextPaths: value.split(',').map(path => path.trim()).filter(Boolean) });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Article Management</h1>
        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
        >
          <Icons.Plus className="w-4 h-4" />
          Add Article
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-600"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full bg-white dark:bg-slate-800 rounded-lg shadow">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Language</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Views</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{article.title}</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">{article.slug}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {categories.find(c => c.id === article.categoryId)?.name || 'Unknown'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                      {article.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{article.languageCode}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {article.status === 'PUBLISHED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">
                        <Icons.CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                        <Icons.XCircle className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">{article.viewCount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(article)}
                      className="text-brand-600 hover:text-brand-900 mr-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handlePublish(article.id, article.status !== 'PUBLISHED')}
                      className="text-blue-600 hover:text-blue-900 mr-2"
                    >
                      {article.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}
                    </button>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 overflow-y-auto py-8">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-6">
              {editingId ? 'Edit Article' : 'Add New Article'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as EHelpArticleType })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    {Object.values(EHelpArticleType).map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Summary</label>
                <textarea
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Content</label>
                <textarea
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 font-mono text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tags (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.tags.join(', ')}
                    onChange={(e) => handleTagsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Context Paths (comma-separated)</label>
                  <input
                    type="text"
                    value={formData.contextPaths.join(', ')}
                    onChange={(e) => handleContextPathsChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Language</label>
                  <select
                    value={formData.languageCode}
                    onChange={(e) => setFormData({ ...formData, languageCode: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  >
                    <option value="vi">Tiếng Việt</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className="flex items-center gap-4 pt-6">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-700">Featured</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isPinned}
                      onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                      className="w-4 h-4 text-brand-600 border-slate-300 rounded focus:ring-brand-500"
                    />
                    <span className="text-sm text-slate-700 dark:text-slate-300">Pinned</span>
                  </label>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
