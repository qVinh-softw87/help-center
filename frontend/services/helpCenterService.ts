import { 
  Category, 
  ArticleSummary, 
  ArticleResponse, 
  EHelpFeedbackType, 
  FeedbackResponse,
  EHelpArticleType
} from '../types';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000').replace(/\/$/, '');
const BASE_URL = `${API_BASE_URL}/api/help-center`;

const isNetworkError = (error: unknown) => error instanceof TypeError;

// Helper to construct headers with Authentication token
const getHeaders = () => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  // Retrieve token from storage (assumed key 'accessToken')
  const token = localStorage.getItem('accessToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// --- MOCK DATA FOR FALLBACK ---
const MOCK_CATEGORIES: Category[] = [
  { id: 1, name: "Bắt đầu sử dụng", slug: "getting-started", description: "Các hướng dẫn cơ bản cho người mới bắt đầu", iconUrl: "rocket", sortOrder: 1, articleCount: 5, languageCode: "vi" },
  { id: 2, name: "Quản lý đơn hàng", slug: "order-management", description: "Quy trình xử lý đơn hàng và vận chuyển", iconUrl: "shopping-bag", sortOrder: 2, articleCount: 12, languageCode: "vi" },
  { id: 3, name: "Thiết lập cửa hàng", slug: "store-settings", description: "Cấu hình máy in, thuế, và nhân viên", iconUrl: "settings", sortOrder: 3, articleCount: 8, languageCode: "vi" },
  { id: 4, name: "API Integration", slug: "api-docs", description: "Tài liệu kỹ thuật cho lập trình viên", iconUrl: "code", sortOrder: 4, articleCount: 3, languageCode: "vi" },
];

const MOCK_ARTICLES: ArticleSummary[] = [
  {
    id: 1, categoryId: 3, type: EHelpArticleType.USER_MANUAL, title: "Hướng dẫn kết nối máy in nhiệt K80", slug: "huong-dan-ket-noi-may-in-nhiet-k80",
    summary: "Hướng dẫn chi tiết cách kết nối và cấu hình máy in nhiệt K80 qua mạng LAN và USB.",
    viewCount: 150, helpfulCount: 12, notHelpfulCount: 1, isFeatured: true, isPinned: false, publishedAt: "2025-01-15T10:00:00Z", languageCode: "vi",
    contextPaths: ["/settings/print"],
    tags: ["máy in", "k80", "phần cứng"]
  },
  {
    id: 2, categoryId: 2, type: EHelpArticleType.BUSINESS_PLAYBOOK, title: "Quy trình xử lý đơn hàng hoàn", slug: "quy-trinh-xu-ly-don-hoan",
    summary: "Cách xử lý đơn hàng bị bom, hoàn trả kho và cập nhật tồn kho tự động.",
    viewCount: 89, helpfulCount: 20, notHelpfulCount: 0, isFeatured: false, isPinned: true, publishedAt: "2025-01-12T08:00:00Z", languageCode: "vi",
    requiredPackage: "PRO",
    tags: ["đơn hàng", "hoàn trả"]
  },
  {
    id: 3, categoryId: 1, type: EHelpArticleType.USER_MANUAL, title: "Tạo tài khoản nhân viên mới", slug: "tao-tai-khoan-nhan-vien",
    summary: "Hướng dẫn phân quyền và tạo tài khoản cho nhân viên bán hàng.",
    viewCount: 210, helpfulCount: 45, notHelpfulCount: 2, isFeatured: true, isPinned: false, publishedAt: "2025-01-10T09:30:00Z", languageCode: "vi",
    tags: ["nhân viên", "phân quyền"]
  }
];

const MOCK_ARTICLE_DETAIL: ArticleResponse = {
  article: {
    ...MOCK_ARTICLES[0],
    category: { id: 3, name: "Thiết lập cửa hàng", slug: "store-settings" },
    contentType: "markdown",
    content: `
# Hướng dẫn kết nối máy in nhiệt K80

Máy in nhiệt K80 là thiết bị không thể thiếu trong bán lẻ. Bài viết này sẽ hướng dẫn bạn cách cài đặt driver và kết nối với CataPos.

## 1. Chuẩn bị

- Máy in K80 (LAN hoặc USB)
- Giấy in khổ 80mm
- Máy tính đã cài đặt CataPos Agent (nếu dùng USB)

## 2. Các bước thực hiện

### Bước 1: Cắm nguồn và kết nối
Cắm dây nguồn vào máy in. Nếu dùng LAN, cắm dây mạng từ modem vào máy in. Nếu dùng USB, cắm vào máy tính.

### Bước 2: Cấu hình trên CataPos
1. Truy cập vào **Cấu hình** > **Máy in**.
2. Chọn **Thêm máy in mới**.
3. Nhập địa chỉ IP của máy in (ví dụ: \`192.168.1.200\`).

> **Lưu ý:** Đảm bảo máy tính và máy in cùng lớp mạng.

## 3. Khắc phục sự cố thường gặp
Nếu máy in không ra giấy:
- Kiểm tra chiều cuộn giấy.
- Kiểm tra đèn báo Error trên thân máy.

Cần hỗ trợ thêm? Liên hệ [Support Team](mailto:support@catapos.com).
    `
  },
  relatedArticles: [MOCK_ARTICLES[2]],
  hasAccess: true
};

export const helpCenterService = {
  getCategories: async (languageCode: string = 'vi'): Promise<Category[]> => {
    try {
      const res = await fetch(`${BASE_URL}/categories?languageCode=${languageCode}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn("API unavailable, falling back to mock data:", error);
      return MOCK_CATEGORIES;
    }
  },

  getArticles: async (params: { 
    categoryId?: number; 
    type?: string; 
    searchQuery?: string; 
    page?: number; 
    contextPath?: string;
    languageCode?: string;
  }): Promise<{ articles: ArticleSummary[], total: number }> => {
    try {
      const query = new URLSearchParams();
      // Default to 'vi' if not provided
      query.append('languageCode', params.languageCode || 'vi');
      
      if (params.categoryId) query.append('categoryId', params.categoryId.toString());
      if (params.type) query.append('type', params.type);
      if (params.searchQuery) query.append('searchQuery', params.searchQuery);
      if (params.page) query.append('page', params.page.toString());
      if (params.contextPath) query.append('contextPath', params.contextPath);

      const res = await fetch(`${BASE_URL}/articles?${query.toString()}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn("API unavailable, falling back to mock data:", error);
      let data = [...MOCK_ARTICLES];
      if (params.categoryId) data = data.filter(a => a.categoryId === Number(params.categoryId));
      if (params.searchQuery) data = data.filter(a => a.title.toLowerCase().includes(params.searchQuery!.toLowerCase()));
      if (params.contextPath) data = data.filter(a => a.contextPaths?.some(p => params.contextPath!.includes(p)));
      return { articles: data, total: data.length };
    }
  },

  getArticleBySlug: async (slug: string, languageCode: string = 'vi'): Promise<ArticleResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/articles/${slug}?languageCode=${languageCode}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn("API unavailable, falling back to mock data:", error);
      const mockArticle = MOCK_ARTICLES.find(a => a.slug === slug);
      if (mockArticle) {
        return {
          ...MOCK_ARTICLE_DETAIL,
          article: {
             ...MOCK_ARTICLE_DETAIL.article,
             ...mockArticle, 
             content: MOCK_ARTICLE_DETAIL.article.content 
          },
          hasAccess: mockArticle.requiredPackage !== 'PRO' 
        };
      }
      return MOCK_ARTICLE_DETAIL;
    }
  },

  getSearchSuggestions: async (query: string, languageCode: string = 'vi'): Promise<string[]> => {
    try {
      const res = await fetch(`${BASE_URL}/search/suggestions?query=${encodeURIComponent(query)}&languageCode=${languageCode}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn("API unavailable, falling back to mock data:", error);
      if (!query) return [];
      return [
        `${query} kết nối máy in`,
        `${query} lỗi không in được`,
        `cấu hình ${query}`
      ];
    }
  },

  getContextualHelp: async (contextPath: string, languageCode: string = 'vi'): Promise<ArticleSummary[]> => {
    try {
      const res = await fetch(`${BASE_URL}/contextual-help?contextPath=${encodeURIComponent(contextPath)}&languageCode=${languageCode}`, {
        headers: getHeaders()
      });
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      return json.data;
    } catch (error) {
      console.warn("API unavailable, falling back to mock data:", error);
      return MOCK_ARTICLES.filter(a => a.contextPaths?.some(p => contextPath.includes(p))) || [];
    }
  },

  sendFeedback: async (articleId: number, type: EHelpFeedbackType, comment?: string): Promise<FeedbackResponse> => {
    try {
      const res = await fetch(`${BASE_URL}/articles/${articleId}/feedback`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ type, comment })
      });
      if (!res.ok) {
        if (res.status === 401) {
          throw new Error('Vui long dang nhap de gui feedback.');
        }

        throw new Error(`Gui feedback that bai (${res.status})`);
      }

      const json = await res.json();
      return json.data;
    } catch (error) {
      if (!isNetworkError(error)) {
        throw error;
      }

      console.warn("API unavailable, falling back to mock data:", error);
      return {
        id: Math.floor(Math.random() * 1000),
        articleId,
        userId: null,
        type,
        comment: comment || '',
        createdAt: new Date().toISOString()
      };
    }
  }
};
