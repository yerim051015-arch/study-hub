import React from 'react';
import {
  Sparkles,
  Calendar,
  CheckSquare,
  FileText,
  Timer,
  BarChart3,
  Moon,
  Sun,
  LayoutDashboard,
  Play,
  Pause,
  User,
  LogOut,
  Cloud,
} from 'lucide-react';
import { useApp, type NavTab } from '../context/AppContext';
import { AuthModal } from './AuthModal';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    isDarkMode,
    toggleTheme,
    activeTimer,
    pauseTimer,
    resumeTimer,
    ddays,
    user,
    signOut,
    isAuthModalOpen,
    setIsAuthModalOpen,
  } = useApp();

  const navItems: { id: NavTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: '대시보드', icon: <LayoutDashboard size={18} /> },
    { id: 'input', label: '스마트 입력', icon: <Sparkles size={18} /> },
    { id: 'calendar', label: '캘린더', icon: <Calendar size={18} /> },
    { id: 'todo', label: '투두리스트', icon: <CheckSquare size={18} /> },
    { id: 'memo', label: '스마트 메모', icon: <FileText size={18} /> },
    { id: 'timer', label: '뽀모도로 타이머', icon: <Timer size={18} /> },
    { id: 'stats', label: '통계 & 시간표', icon: <BarChart3 size={18} /> },
  ];

  // Nearest D-Day calculation
  const nearestDDay = [...ddays].sort((a, b) => new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime())[0];
  const getDDayCount = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().setHours(0, 0, 0, 0);
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return 'D-Day!';
    return days > 0 ? `D-${days}` : `D+${Math.abs(days)}`;
  };

  const formatTimerTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <header className="app-header">
        <div className="header-inner">
          {/* Brand Logo */}
          <div className="brand-logo" onClick={() => setActiveTab('dashboard')}>
            <div className="brand-icon-box">
              <Sparkles size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>StudyHub</span>
                <span className="brand-badge">대학생 올인원</span>
              </div>
              <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                스마트 연동 학습 시스템
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="nav-tabs">
            {navItems.map(item => (
              <button
                key={item.id}
                className={`nav-tab-btn ${activeTab === item.id ? 'active' : ''}`}
                onClick={() => setActiveTab(item.id)}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Right Actions & Auth Pill */}
          <div className="header-actions">
            {/* Active Floating Timer Widget if running or paused */}
            {(activeTimer.isRunning || activeTimer.elapsedSeconds > 0) && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(139, 92, 246, 0.15)',
                  border: '1px solid var(--border-glow)',
                  cursor: 'pointer',
                }}
                onClick={() => setActiveTab('timer')}
              >
                <Timer size={16} color="var(--color-primary)" className={activeTimer.isRunning ? 'pulse-glow' : ''} />
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem' }}>
                  {activeTimer.mode === 'pomodoro'
                    ? formatTimerTime(activeTimer.secondsLeft)
                    : formatTimerTime(activeTimer.elapsedSeconds)}
                </span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-main)', cursor: 'pointer', display: 'flex' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    activeTimer.isRunning ? pauseTimer() : resumeTimer();
                  }}
                >
                  {activeTimer.isRunning ? <Pause size={14} /> : <Play size={14} />}
                </button>
              </div>
            )}

            {/* D-Day Counter Pill */}
            {nearestDDay && (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.35rem 0.75rem',
                  borderRadius: '12px',
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.25)',
                  color: '#f43f5e',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                <span>{nearestDDay.title}</span>
                <span style={{ background: '#f43f5e', color: 'white', padding: '0.1rem 0.4rem', borderRadius: '6px', fontSize: '0.75rem' }}>
                  {getDDayCount(nearestDDay.targetDate)}
                </span>
              </div>
            )}

            {/* Supabase Cloud Auth Button */}
            {user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'var(--color-primary-light)', padding: '0.35rem 0.75rem', borderRadius: '12px', border: '1px solid var(--border-glow)' }}>
                <Cloud size={15} color="var(--color-primary)" />
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                  {user.email?.split('@')[0]}
                </span>
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', marginLeft: '0.2rem' }}
                  onClick={signOut}
                  title="로그아웃"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                className="btn-secondary"
                style={{ padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}
                onClick={() => setIsAuthModalOpen(true)}
              >
                <User size={15} color="var(--color-primary)" />
                <span>로그인 / 클라우드 연동</span>
              </button>
            )}

            {/* Theme Toggle Button */}
            <button
              className="icon-btn"
              onClick={toggleTheme}
              title={isDarkMode ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDarkMode ? <Sun size={19} color="#fbbf24" /> : <Moon size={19} color="#8b5cf6" />}
            </button>
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  );
};
