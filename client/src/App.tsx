import { BrowserRouter, Routes, Route } from 'react-router-dom';
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

export default function App() {
  return (
    <BrowserRouter>
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
    </BrowserRouter>
  );
}
