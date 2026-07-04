import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { LearningPage } from './pages/LearningPage';
import { TravelPage } from './pages/TravelPage';
import { GenericListPage } from './pages/GenericListPage';
import { MoodPage } from './pages/MoodPage';
import { GoalsPage } from './pages/GoalsPage';
import { HealthPage } from './pages/HealthPage';
import { AchievementsPage } from './pages/AchievementsPage';
import { FinancePage } from './pages/FinancePage';
import { MilestonesPage } from './pages/MilestonesPage';

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
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-7">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learning" element={<LearningPage />} />
          <Route path="/travel" element={<TravelPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/mood" element={<MoodPage />} />
          <Route path="/goals" element={<GoalsPage />} />
          <Route path="/milestones" element={<MilestonesPage />} />
          <Route path="/health" element={<HealthPage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/social" element={<GenericListPage module="social" categoryConfig={{
            storageKey: 'lifeos_social_categories',
            defaults: ['挚友', '同事', '行业人脉', '家人', '导师', '其他'],
            fallbackCategory: '其他',
            icons: ['🤝', '💼', '🌐', '👨‍👩‍👧‍👦', '🎓', '✨'],
            allIcon: '👥',
            moduleName: 'social',
            dialogTitle: '管理社交分类',
            sectionTitle: '社交分类',
          }} />} />
          <Route path="/insights" element={<GenericListPage module="insights" categoryConfig={{
            storageKey: 'lifeos_insight_categories',
            defaults: ['学习', '旅行', '工作', '生活', '阅读', '对话', '反思', '其他'],
            fallbackCategory: '其他',
            icons: ['📚', '✈️', '💼', '🏠', '📖', '🗣️', '💭', '✨'],
            allIcon: '💡',
            moduleName: 'insights',
            dialogTitle: '管理感悟分类',
            sectionTitle: '感悟分类',
          }} />} />
        </Routes>
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
