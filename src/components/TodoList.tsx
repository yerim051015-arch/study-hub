import React, { useState } from 'react';
import { CheckSquare, Plus, Play, FileText, Trash2, Calendar, Clock, AlertCircle, Filter } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Priority } from '../types';

export const TodoList: React.FC = () => {
  const {
    todos,
    subjects,
    toggleTodo,
    deleteTodo,
    addTodo,
    startTimer,
    setSelectedMemoId,
    setActiveTab,
  } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'today' | 'high' | string>('all');
  const [showAddForm, setShowAddForm] = useState(false);

  // New todo input fields
  const todayStr = new Date().toISOString().split('T')[0];
  const [newTitle, setNewTitle] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newDueDate, setNewDueDate] = useState(todayStr);
  const [newPriority, setNewPriority] = useState<Priority>('high');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addTodo({
      title: newTitle,
      subjectId: newSubjectId,
      dueDate: newDueDate,
      dueTime: '20:00',
      completed: false,
      priority: newPriority,
      estimatedMinutes: 60,
      actualStudySeconds: 0,
    });
    setNewTitle('');
    setShowAddForm(false);
  };

  const getSubjectColor = (subjId?: string) => {
    const found = subjects.find(s => s.id === subjId);
    return found?.color || 'violet';
  };

  const filteredTodos = todos.filter(t => {
    if (filterMode === 'today') return t.dueDate === todayStr;
    if (filterMode === 'high') return t.priority === 'high';
    if (filterMode.startsWith('subj-')) return t.subjectId === filterMode;
    return true;
  });

  const formatStudyTime = (sec?: number) => {
    if (!sec || sec <= 0) return '0분';
    const m = Math.floor(sec / 60);
    const h = Math.floor(m / 60);
    const remM = m % 60;
    if (h > 0) return `${h}시간 ${remM}분`;
    return `${m}분`;
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Header Bar */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <CheckSquare size={24} color="var(--color-primary)" />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>스마트 투두리스트</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              과목별, 마감기한별 할 일 및 1클릭 뽀모도로 타이머 연결
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowAddForm(prev => !prev)}>
          <Plus size={16} />
          <span>할 일 추가</span>
        </button>
      </div>

      {/* Quick Add Form Drawer */}
      {showAddForm && (
        <form className="glass-panel animate-fade-in" onSubmit={handleAdd} style={{ padding: '1.25rem', background: 'var(--bg-card-solid)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>📋 새 투두 등록</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="투두 제목 (예: 경영학원론 과제 제출)"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />

            <select className="input-field" value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)}>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>

            <input type="date" className="input-field" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />

            <select className="input-field" value={newPriority} onChange={(e) => setNewPriority(e.target.value as Priority)}>
              <option value="high">🔴 높은 우선순위</option>
              <option value="medium">🟡 중간 우선순위</option>
              <option value="low">🟢 낮음</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowAddForm(false)}>취소</button>
            <button type="submit" className="btn-primary">등록하기</button>
          </div>
        </form>
      )}

      {/* Filter Tabs Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
        <button
          className={`btn-secondary`}
          style={{
            background: filterMode === 'all' ? 'var(--color-primary-light)' : 'var(--bg-card-solid)',
            borderColor: filterMode === 'all' ? 'var(--color-primary)' : 'var(--border-color)',
            fontSize: '0.82rem',
            padding: '0.4rem 0.85rem',
          }}
          onClick={() => setFilterMode('all')}
        >
          <Filter size={14} />
          <span>전체 ({todos.length})</span>
        </button>

        <button
          className={`btn-secondary`}
          style={{
            background: filterMode === 'today' ? 'var(--color-primary-light)' : 'var(--bg-card-solid)',
            borderColor: filterMode === 'today' ? 'var(--color-primary)' : 'var(--border-color)',
            fontSize: '0.82rem',
            padding: '0.4rem 0.85rem',
          }}
          onClick={() => setFilterMode('today')}
        >
          <Calendar size={14} />
          <span>오늘 할 일 ({todos.filter(t => t.dueDate === todayStr).length})</span>
        </button>

        <button
          className={`btn-secondary`}
          style={{
            background: filterMode === 'high' ? 'rgba(244, 63, 94, 0.15)' : 'var(--bg-card-solid)',
            borderColor: filterMode === 'high' ? '#f43f5e' : 'var(--border-color)',
            color: filterMode === 'high' ? '#f43f5e' : 'var(--text-main)',
            fontSize: '0.82rem',
            padding: '0.4rem 0.85rem',
          }}
          onClick={() => setFilterMode('high')}
        >
          <AlertCircle size={14} />
          <span>중요/우선순위 상</span>
        </button>

        {subjects.map(subj => (
          <button
            key={subj.id}
            className={`btn-secondary`}
            style={{
              background: filterMode === subj.id ? 'var(--color-primary-light)' : 'var(--bg-card-solid)',
              borderColor: filterMode === subj.id ? 'var(--color-primary)' : 'var(--border-color)',
              fontSize: '0.82rem',
              padding: '0.4rem 0.85rem',
            }}
            onClick={() => setFilterMode(subj.id)}
          >
            <span className={`subject-badge subj-bg-${subj.color}`} style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem' }}>
              {subj.name}
            </span>
          </button>
        ))}
      </div>

      {/* Todo Items List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {filteredTodos.length === 0 ? (
          <div className="glass-panel" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
            <CheckSquare size={36} color="var(--text-subdued)" style={{ marginBottom: '0.5rem' }} />
            <p style={{ fontWeight: 600 }}>해당 조건에 해당하는 투두 항목이 없습니다.</p>
          </div>
        ) : (
          filteredTodos.map(todo => {
            const subjColor = getSubjectColor(todo.subjectId);
            const subjObj = subjects.find(s => s.id === todo.subjectId);

            return (
              <div
                key={todo.id}
                className="glass-panel"
                style={{
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '1rem',
                  opacity: todo.completed ? 0.65 : 1,
                  background: todo.completed ? 'var(--bg-input)' : 'var(--bg-card)',
                  transition: 'all 0.2s ease',
                }}
              >
                {/* Left Section: Checkbox + Content */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem', flex: 1 }}>
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id)}
                    style={{
                      width: '20px',
                      height: '20px',
                      accentColor: 'var(--color-primary)',
                      cursor: 'pointer',
                    }}
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {subjObj && (
                        <span className={`subject-badge subj-bg-${subjColor}`}>
                          {subjObj.name}
                        </span>
                      )}

                      <span
                        style={{
                          fontSize: '1rem',
                          fontWeight: 700,
                          textDecoration: todo.completed ? 'line-through' : 'none',
                          color: todo.completed ? 'var(--text-muted)' : 'var(--text-main)',
                        }}
                      >
                        {todo.title}
                      </span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      {todo.dueDate && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <Calendar size={13} />
                          {todo.dueDate} {todo.dueTime || ''}
                        </span>
                      )}

                      {todo.actualStudySeconds && todo.actualStudySeconds > 0 ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                          <Clock size={13} />
                          누적 공부 {formatStudyTime(todo.actualStudySeconds)}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>

                {/* Right Actions: Timer Start & Memo Link */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <button
                    className="btn-primary"
                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}
                    onClick={() => startTimer(todo.subjectId || subjects[0]?.id || 'subj-1', todo.id, 'pomodoro')}
                    title="해당 투두 공부시간 측정 타이머 시작"
                  >
                    <Play size={13} />
                    <span>▶ 타이머</span>
                  </button>

                  {todo.memoId && (
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.4rem 0.65rem', fontSize: '0.78rem' }}
                      onClick={() => {
                        setSelectedMemoId(todo.memoId!);
                        setActiveTab('memo');
                      }}
                      title="연동 메모 노트 열기"
                    >
                      <FileText size={14} color="#a78bfa" />
                    </button>
                  )}

                  <button
                    className="icon-btn"
                    style={{ width: 32, height: 32, color: '#f43f5e' }}
                    onClick={() => deleteTodo(todo.id)}
                    title="투두 삭제"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
