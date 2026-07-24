import { 
  SignUpValues, 
  SignInValues, 
  ForgotPasswordValues, 
  ResetPasswordValues,
  ChangePasswordValues
} from "../validations/auth";

export interface AuthResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: any;
}

export const authApi = {
  signUp: async (data: SignUpValues): Promise<AuthResponse> => {
    // Giả lập API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.email === "test@example.com") {
          reject(new Error("Email đã tồn tại trong hệ thống."));
        } else {
          resolve({ success: true });
        }
      }, 1000);
    });
  },

  signIn: async (data: SignInValues): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.email === "test@example.com" && data.password === "Password123") {
          resolve({ 
            success: true, 
            token: "mock-jwt-token",
            user: { name: "Test User", email: "test@example.com" } 
          });
        } else {
          reject(new Error("Email hoặc mật khẩu không đúng."));
        }
      }, 1000);
    });
  },

  forgotPassword: async (data: ForgotPasswordValues): Promise<AuthResponse> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: "Email khôi phục đã được gửi." });
      }, 1000);
    });
  },

  resetPassword: async (token: string, data: ResetPasswordValues): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (!token) reject(new Error("Token không hợp lệ hoặc đã hết hạn."));
        resolve({ success: true, message: "Mật khẩu đã được thay đổi thành công." });
      }, 1000);
    });
  },

  changePassword: async (data: ChangePasswordValues): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (data.currentPassword !== "Password123") {
          reject(new Error("Mật khẩu hiện tại không đúng."));
        } else {
          resolve({ success: true, message: "Đã cập nhật mật khẩu thành công." });
        }
      }, 1000);
    });
  },

  uploadAvatar: async (file: File): Promise<{ success: boolean; avatarUrl: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Mock trả về object URL
        resolve({ success: true, avatarUrl: URL.createObjectURL(file) });
      }, 1500);
    });
  }
};
