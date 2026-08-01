import React, { useState } from 'react';
import {
  Sparkles,
  Calendar,
  CheckSquare,
  FileText,
  Timer,
  Play,
  ArrowRight,
  Clock,
  Flame,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseNaturalLanguage } from '../utils/nlpParser';

export const DashboardView: React.FC = () => {
  const {
    subjects,
    schedules,
    todos,
    memos,
    studyLogs,
    setActiveTab,
    toggleTodo,
    startTimer,
    setSelectedMemoId,
    executeSmartCreate,
  } = useApp();

  const [nlpInput, setNlpInput] = useState('');
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySchedules = schedules.filter(s => s.date === todayStr);
  const pendingTodos = todos.filter(t => !t.completed);

  const totalStudyTodaySeconds = studyLogs
    .filter(l => l.date === todayStr)
    .reduce((acc, log) => acc + log.durationSeconds, 0);

  const formatHoursMinutes = (sec: number) => {
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h > 0) return `${h}시간 ${remM}분`;
    return `${m}분`;
  };

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nlpInput.trim()) return;
    const parsed = parseNaturalLanguage(nlpInput, subjects);
    executeSmartCreate(parsed);
    setNlpInput('');
  };

  const getSubjectColor = (subjId?: string) => {
    const found = subjects.find(s => s.id === subjId);
    return found?.color || 'violet';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Welcome Banner + Quick NLP Bar */}
      <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff', border: '2px solid #111111' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111111' }}>👋 좋은 하루입니다! StudyHub 통합 홈</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              오늘의 수업 일정, 할 일, 마크다운 메모 및 타이머가 한 곳에서 완벽하게 제어됩니다.
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-subdued)', fontWeight: 600 }}>오늘 누적 학업시간</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Flame size={20} color="#f43f5e" />
                <span>{formatHoursMinutes(totalStudyTodaySeconds)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick NLP Smart Input Bar */}
        <form onSubmit={handleQuickSubmit} style={{ position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            style={{
              padding: '0.9rem 1.25rem 0.9rem 3rem',
              fontSize: '1.05rem',
              borderRadius: '14px',
              border: '2px solid var(--border-glow)',
              background: 'var(--bg-card-solid)',
            }}
            placeholder="스마트 연동 입력 (예:오늘 저녁 8시 컴프로 팀플 회의 준비)"
            value={nlpInput}
            onChange={(e) => setNlpInput(e.target.value)}
          />
          <Sparkles
            size={20}
            color="var(--color-primary)"
            style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }}
          />

          <button
            type="submit"
            className="btn-primary"
            style={{
              position: 'absolute',
              right: '0.5rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.55rem 1.1rem',
              fontSize: '0.85rem',
            }}
          >
            <span>원스톱 연동</span>
          </button>
        </form>
      </div>

      {/* Main Grid: Today's Schedule & High Priority Todos */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.25rem' }}>
        {/* Today's Schedule & Classes Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="var(--color-primary)" />
              <span>오늘의 강의 & 학업 일정 ({todaySchedules.length})</span>
            </h3>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              onClick={() => setActiveTab('calendar')}
            >
              전체보기 <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {todaySchedules.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subdued)', padding: '1rem 0' }}>오늘 등록된 일정이 없습니다.</p>
            ) : (
              todaySchedules.map(sched => (
                <div
                  key={sched.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <span className={`subject-badge subj-bg-${getSubjectColor(sched.subjectId)}`}>
                      {subjects.find(s => s.id === sched.subjectId)?.name || '일반'}
                    </span>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginTop: '0.2rem' }}>{sched.title}</h4>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
                      <Clock size={12} />
                      <span>{sched.startTime} ~ {sched.endTime}</span>
                      {sched.location && <span>• {sched.location}</span>}
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => startTimer(sched.subjectId || subjects[0]?.id || 'subj-1', sched.todoId, 'pomodoro')}
                  >
                    <Play size={13} />
                    <span>시작</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Pending High Priority Todos Card */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckSquare size={20} color="#34d399" />
              <span>미완료 중요 할 일 ({pendingTodos.length})</span>
            </h3>
            <button
              style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
              onClick={() => setActiveTab('todo')}
            >
              전체보기 <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {pendingTodos.length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-subdued)', padding: '1rem 0' }}>모든 투두 항목을 완료했습니다! 🎉</p>
            ) : (
              pendingTodos.slice(0, 4).map(todo => (
                <div
                  key={todo.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: 'var(--bg-input)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                      style={{ width: '18px', height: '18px', accentColor: 'var(--color-primary)', cursor: 'pointer' }}
                    />
                    <div>
                      <span className={`subject-badge subj-bg-${getSubjectColor(todo.subjectId)}`}>
                        {subjects.find(s => s.id === todo.subjectId)?.name || '일반'}
                      </span>
                      <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginTop: '0.2rem' }}>{todo.title}</h4>
                    </div>
                  </div>

                  <button
                    className="btn-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
                    onClick={() => startTimer(todo.subjectId || subjects[0]?.id || 'subj-1', todo.id, 'pomodoro')}
                  >
                    <Timer size={13} />
                    <span>타이머</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recent Notes Preview Grid */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="#a78bfa" />
            <span>최근 스마트 메모 노드</span>
          </h3>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '0.82rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
            onClick={() => setActiveTab('memo')}
          >
            노트 전체보기 <ArrowRight size={14} />
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {memos.slice(0, 3).map(memo => {
            const subj = subjects.find(s => s.id === memo.subjectId);
            return (
              <div
                key={memo.id}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: 'var(--bg-card-solid)',
                  border: '1px solid var(--border-color)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                onClick={() => {
                  setSelectedMemoId(memo.id);
                  setActiveTab('memo');
                }}
              >
                {subj && (
                  <span className={`subject-badge subj-bg-${subj.color}`} style={{ marginBottom: '0.4rem' }}>
                    {subj.name}
                  </span>
                )}
                <h4 style={{ fontSize: '0.98rem', fontWeight: 700, marginBottom: '0.4rem' }}>{memo.title}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'block', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                  {memo.content.replace(/[#*>-\`]/g, '')}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
