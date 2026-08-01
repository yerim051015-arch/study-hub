import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SmartInputHub } from './components/SmartInputHub';
import { CalendarView } from './components/CalendarView';
import { TodoList } from './components/TodoList';
import { MemoEditor } from './components/MemoEditor';
import { StudyTimer } from './components/StudyTimer';
import { StatisticsView } from './components/StatisticsView';

const MainAppContent: React.FC = () => {
  const { activeTab } = useApp();

  return (
    <main className="main-content">
      {activeTab === 'dashboard' && <DashboardView />}
      {activeTab === 'input' && <SmartInputHub />}
      {activeTab === 'calendar' && <CalendarView />}
      {activeTab === 'todo' && <TodoList />}
      {activeTab === 'memo' && <MemoEditor />}
      {activeTab === 'timer' && <StudyTimer />}
      {activeTab === 'stats' && <StatisticsView />}
    </main>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <div className="app-container">
        <Header />
        <MainAppContent />
      </div>
    </AppProvider>
  );
};

export default App;
