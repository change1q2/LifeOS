import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './pages/Dashboard';
import { GenericListPage } from './pages/GenericListPage';
import { MoodPage } from './pages/MoodPage';
import { GoalsPage } from './pages/GoalsPage';
import { HealthPage } from './pages/HealthPage';
import { FinancePage } from './pages/FinancePage';

export default function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-7">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learning" element={<GenericListPage module="learning" />} />
            <Route path="/travel" element={<GenericListPage module="travel" />} />
            <Route path="/achievements" element={<GenericListPage module="achievements" />} />
            <Route path="/mood" element={<MoodPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/health" element={<HealthPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/social" element={<GenericListPage module="social" />} />
            <Route path="/insights" element={<GenericListPage module="insights" />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
