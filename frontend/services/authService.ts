import {
  AuthUser,
  LoginDto,
  LoginResponse,
  AdminUser,
  CreateUserDto,
  UpdateUserDto,
} from "../types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000"
).replace(/\/$/, "");
const BASE_URL = `${API_BASE_URL}/api/auth`;

const TOKEN_KEY = "accessToken";
const USER_KEY = "authUser";

// Helper to construct headers with Authentication token
const getHeaders = () => {
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };
  const token = localStorage.getItem("accessToken");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

export const authService = {
  getToken: (): string | null => localStorage.getItem(TOKEN_KEY),
  getUser: (): AuthUser | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
  setAuth: (token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clearAuth: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },
  login: async (data: LoginDto): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: "Đăng nhập thất bại" }));
      throw new Error(
        errorData.message || `Đăng nhập thất bại (${res.status})`,
      );
    }
    const json = await res.json();
    return json.data;
  },
  register: async (data: any): Promise<LoginResponse> => {
    const res = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const errorData = await res
        .json()
        .catch(() => ({ message: "Đăng ký thất bại" }));
      throw new Error(
        errorData.message || `Đăng ký thất bại (${res.status})`,
      );
    }
    const json = await res.json();
    return json.data;
  },
  logout: async (): Promise<void> => {
    authService.clearAuth();
  },
  checkToken: async (): Promise<AuthUser> => {
    const token = authService.getToken();
    if (!token) throw new Error('Không có token');
    const res = await fetch(`${BASE_URL}/me`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!res.ok) {
      authService.clearAuth();
      throw new Error('Token không hợp lệ');
    }
    const json = await res.json();
    return json.data;
  },

  // Admin user methods
  getAdminUsers: async (): Promise<AdminUser[]> => {
    const res = await fetch(`${BASE_URL}/admin/users`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to get users');
    const json = await res.json();
    return json.data;
  },

  createUser: async (data: CreateUserDto): Promise<AdminUser> => {
    const res = await fetch(`${BASE_URL}/admin/users`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to create user');
    const json = await res.json();
    return json.data;
  },

  updateUser: async (id: number, data: UpdateUserDto): Promise<AdminUser> => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to update user');
    const json = await res.json();
    return json.data;
  },

  deleteUser: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete user');
  },
};
