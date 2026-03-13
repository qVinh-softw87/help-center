import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { ArticleList } from './pages/ArticleList';
import { ArticleDetail } from './pages/ArticleDetail';
import { ContextualHelp } from './components/ContextualHelp';
import { EHelpArticleType } from './types';

const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
      <ContextualHelp />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="category/:categoryId" element={<ArticleList />} />
          <Route path="categories/user-manual" element={<ArticleList forcedType={EHelpArticleType.USER_MANUAL} />} />
          <Route path="categories/business-playbook" element={<ArticleList forcedType={EHelpArticleType.BUSINESS_PLAYBOOK} />} />
          <Route path="categories/api-docs" element={<ArticleList forcedType={EHelpArticleType.API_DOCS} />} />
          <Route path="search" element={<ArticleList />} />
          <Route path="article/:slug" element={<ArticleDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;