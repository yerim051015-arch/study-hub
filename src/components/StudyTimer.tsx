import React from 'react';
import { Timer as TimerIcon, Play, Pause, Square, RotateCcw, Award, CheckCircle2, Flame } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StudyTimer: React.FC = () => {
  const {
    activeTimer,
    subjects,
    todos,
    studyLogs,
    startTimer,
    pauseTimer,
    resumeTimer,
    stopTimer,
    resetTimer,
  } = useApp();

  const activeTodo = todos.find(t => t.id === activeTimer.todoId);

  const formatSeconds = (totalSec: number) => {
    const m = Math.floor(totalSec / 60);
    const s = totalSec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate Pomodoro Progress Ring percentage
  const pomodoroTotalSec = activeTimer.phase === 'work' ? 25 * 60 : 5 * 60;
  const progressPercent = activeTimer.mode === 'pomodoro'
    ? ((pomodoroTotalSec - activeTimer.secondsLeft) / pomodoroTotalSec) * 100
    : (activeTimer.elapsedSeconds % 3600 / 3600) * 100;

  const totalStudyTodaySeconds = studyLogs
    .filter(l => l.date === new Date().toISOString().split('T')[0])
    .reduce((acc, log) => acc + log.durationSeconds, 0);

  const formatHoursMinutes = (sec: number) => {
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h > 0) return `${h}시간 ${remM}분`;
    return `${m}분`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      {/* Top Banner Stats */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <TimerIcon size={24} color="var(--color-primary)" />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>뽀모도로 & 공부 타이머</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              25분 집중 + 5분 휴식 몰입 공부 및 과목별 자동 실시간 기록
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-subdued)', fontWeight: 600 }}>오늘 순 공부시간</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Flame size={18} color="#f43f5e" />
              <span>{formatHoursMinutes(totalStudyTodaySeconds + activeTimer.elapsedSeconds)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Timer Dial Panel */}
      <div className="glass-panel" style={{ padding: '2.5rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', background: 'var(--bg-card-solid)' }}>
        {/* Subject & Todo Selector Header */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <select
            className="input-field"
            style={{ width: '220px', fontWeight: 700 }}
            value={activeTimer.subjectId}
            onChange={(e) => startTimer(e.target.value, activeTimer.todoId, activeTimer.mode)}
          >
            {subjects.map(s => (
              <option key={s.id} value={s.id}>🎓 {s.name}</option>
            ))}
          </select>

          <select
            className="input-field"
            style={{ width: '260px' }}
            value={activeTimer.todoId || ''}
            onChange={(e) => startTimer(activeTimer.subjectId, e.target.value || undefined, activeTimer.mode)}
          >
            <option value="">📋 선택 안 함 (자유 학습)</option>
            {todos.filter(t => !t.completed).map(t => (
              <option key={t.id} value={t.id}>✓ {t.title}</option>
            ))}
          </select>
        </div>

        {/* Big Circular Progress Gauge */}
        <div style={{ position: 'relative', width: '280px', height: '280px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke="var(--bg-input)"
              strokeWidth="12"
              fill="transparent"
            />
            <circle
              cx="140"
              cy="140"
              r="120"
              stroke={activeTimer.phase === 'work' ? 'var(--color-primary)' : '#34d399'}
              strokeWidth="12"
              fill="transparent"
              strokeDasharray={2 * Math.PI * 120}
              strokeDashoffset={2 * Math.PI * 120 * (1 - progressPercent / 100)}
              strokeLinecap="round"
              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            />
          </svg>

          {/* Center Digital Display */}
          <div style={{ position: 'absolute', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: activeTimer.phase === 'work' ? 'var(--color-primary)' : '#34d399', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {activeTimer.mode === 'pomodoro' ? (activeTimer.phase === 'work' ? '🔥 집중 공부시간 (25분)' : '☕ 꿀맛같은 휴식 (5분)') : '⏱️ 스톱워치'}
            </span>

            <h1 style={{ fontSize: '3.5rem', fontWeight: 800, fontFamily: 'var(--font-mono)', lineHeight: 1, margin: '0.4rem 0' }}>
              {activeTimer.mode === 'pomodoro'
                ? formatSeconds(activeTimer.secondsLeft)
                : formatSeconds(activeTimer.elapsedSeconds)}
            </h1>

            {activeTodo && (
              <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                목표: {activeTodo.title}
              </span>
            )}
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {!activeTimer.isRunning ? (
            <button
              className="btn-primary"
              style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '16px' }}
              onClick={activeTimer.elapsedSeconds > 0 ? resumeTimer : () => startTimer(activeTimer.subjectId, activeTimer.todoId, activeTimer.mode)}
            >
              <Play size={20} />
              <span>{activeTimer.elapsedSeconds > 0 ? '이어서 시작' : '타이머 시작'}</span>
            </button>
          ) : (
            <button
              className="btn-secondary"
              style={{ padding: '0.8rem 2rem', fontSize: '1.1rem', borderRadius: '16px', background: 'rgba(251, 191, 36, 0.15)', borderColor: '#fbbf24', color: '#fbbf24' }}
              onClick={pauseTimer}
            >
              <Pause size={20} />
              <span>일시 정지</span>
            </button>
          )}

          <button
            className="btn-secondary"
            style={{ padding: '0.8rem 1.2rem', borderRadius: '16px', color: '#f43f5e' }}
            onClick={stopTimer}
            title="세션 저장 후 종지"
          >
            <Square size={18} />
            <span>종료 & 저장</span>
          </button>

          <button
            className="icon-btn"
            style={{ width: 48, height: 48, borderRadius: '16px' }}
            onClick={resetTimer}
            title="초기화"
          >
            <RotateCcw size={18} />
          </button>
        </div>
      </div>

      {/* Today's Study Log History */}
      <div className="glass-panel" style={{ padding: '1.25rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Award size={18} color="var(--color-primary)" />
          <span>오늘 누적 공부 세션 로그</span>
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {studyLogs.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subdued)' }}>아직 완료된 공부 세션이 없습니다. 타이머를 실행해보세요!</p>
          ) : (
            studyLogs.slice(0, 5).map(log => {
              const subj = subjects.find(s => s.id === log.subjectId);
              return (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'var(--bg-input)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle2 size={16} color="#34d399" />
                    <span className={`subject-badge subj-bg-${subj?.color || 'violet'}`}>
                      {subj?.name || '일반'}
                    </span>
                    <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>
                      {log.mode === 'pomodoro' ? '뽀모도로 25분 달성' : '스톱워치 학습'}
                    </span>
                  </div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.88rem', color: 'var(--color-primary)' }}>
                    +{formatHoursMinutes(log.durationSeconds)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
