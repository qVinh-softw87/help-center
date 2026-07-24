import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { ArticleList } from "./pages/ArticleList";
import { ArticleDetail } from "./pages/ArticleDetail";
import { LoginPage } from "./pages/LoginPage";
import { ContextualHelp } from "./components/ContextualHelp";
import { Toaster } from "sonner";
import { SignUpPage } from "./pages/auth/SignUpPage";
import { SignInPage } from "./pages/auth/SignInPage";
import { ForgotPasswordPage } from "./pages/auth/ForgotPasswordPage";
import { ResetPasswordPage } from "./pages/auth/ResetPasswordPage";
import { VerifyEmailPage } from "./pages/auth/VerifyEmailPage";
import { SettingsLayout } from "./pages/settings/SettingsLayout";
import { ProfilePage } from "./pages/settings/ProfilePage";
import { SecurityPage } from "./pages/settings/SecurityPage";
import { LanguageProvider } from "./i18n";
import { EHelpArticleType } from "./types";
import { RouteGuard } from "./components/RouteGuard";
import { AdminLayout } from "./components/AdminLayout";
import { ArticleManager } from "./pages/ArticleManager";
import { CategoryManager } from "./pages/CategoryManager";
import { UserManager } from "./pages/UserManager";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ChatbotWidget } from "./components/ChatbotWidget";

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <ChatbotWidget />
      <Footer />
      <ContextualHelp />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
      <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/settings" element={<SettingsLayout />}>
            <Route index element={<ProfilePage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="security" element={<SecurityPage />} />
          </Route>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="category/:categoryId" element={<ArticleList />} />
            <Route
              path="categories/user-manual"
              element={
                <ArticleList forcedType={EHelpArticleType.USER_MANUAL} />
              }
            />
            <Route
              path="categories/business-playbook"
              element={
                <ArticleList forcedType={EHelpArticleType.BUSINESS_PLAYBOOK} />
              }
            />
            <Route path="search" element={<ArticleList />} />
            <Route path="article/:slug" element={<ArticleDetail />} />
          </Route>
          
          <Route path="/admin" element={<RouteGuard requiredRole="STAFF"><AdminLayout /></RouteGuard>}>
            <Route index element={<ArticleManager />} />
            <Route path="articles" element={<ArticleManager />} />
            <Route path="categories" element={<RouteGuard requiredRole="ADMIN"><CategoryManager /></RouteGuard>} />
            <Route path="users" element={<RouteGuard requiredRole="ADMIN"><UserManager /></RouteGuard>} />
          </Route>
        </Routes>
      </Router>
      <Toaster position="top-right" richColors />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default App;
