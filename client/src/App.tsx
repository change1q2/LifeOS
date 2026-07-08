import { useState, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthPage } from './pages/AuthPage';
import { Sidebar, MobileMenuButton } from './components/Sidebar';
const Dashboard = lazy(() => import('./pages/Dashboard'));
const LearningPage = lazy(() => import('./pages/LearningPage'));
const TravelPage = lazy(() => import('./pages/TravelPage'));
const GenericListPage = lazy(() => import('./pages/GenericListPage'));
const MoodPage = lazy(() => import('./pages/MoodPage'));
const GoalsPage = lazy(() => import('./pages/GoalsPage'));
const HealthPage = lazy(() => import('./pages/HealthPage'));
const AchievementsPage = lazy(() => import('./pages/AchievementsPage'));
const FinancePage = lazy(() => import('./pages/FinancePage'));
const MilestonesPage = lazy(() => import('./pages/MilestonesPage'));
const DownloadPage = lazy(() => import('./pages/DownloadPage'));

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-900">
        <div className="text-white">加载中...</div>
      </div>
    );
  }
  return user ? children : <Navigate to="/login" />;
}

function Layout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <MobileMenuButton onClick={() => setMobileSidebarOpen(true)} />
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onMobileClose={() => setMobileSidebarOpen(false)}
      />
      <main className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-7">
        <Suspense fallback={
          <div className="flex items-center justify-center h-full">
            <div className="text-white">加载中...</div>
          </div>
        }>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/learning" element={<LearningPage />} />
            <Route path="/travel" element={<TravelPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/milestones" element={<MilestonesPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/download" element={<DownloadPage />} />
            <Route path="/social" element={<GenericListPage module="social" categoryConfig={{
              storageKey: 'lifeos_social_categories',
              defaults: ['挚友', '同事', '行业人脉', '家人', '导师', '其他'],
              fallbackCategory: '其他',
              icons: ['👫', '💼', '🌍', '👨‍👩‍👧', '🎓', '✨'],
              allIcon: '🤝',
              moduleName: 'social',
              dialogTitle: '管理社交分类',
              sectionTitle: '社交分类',
            }} />} />
            <Route path="/insights" element={<GenericListPage module="insights" categoryConfig={{
              storageKey: 'lifeos_insight_categories',
              defaults: ['学习', '旅行', '工作', '生活', '阅读', '对话', '反思', '其他'],
              fallbackCategory: '其他',
              icons: ['🎓', '✈️', '💼', '🏠', '📖', '💬', '🧠', '✨'],
              allIcon: '💡',
              moduleName: 'insights',
              dialogTitle: '管理感悟分类',
              sectionTitle: '感悟分类',
            }} />} />
          </Routes>
        </Suspense>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<AuthPage />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}