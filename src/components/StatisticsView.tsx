import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { BarChart3, Trophy, Calendar, Plus, Trash2, Clock, BookOpen } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const StatisticsView: React.FC = () => {
  const { subjects, studyLogs, ddays, addDDay, deleteDDay } = useApp();

  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [showAddDDay, setShowAddDDay] = useState(false);

  // Calculate total study time per subject in minutes
  const chartData = subjects.map(subj => {
    const subjLogs = studyLogs.filter(l => l.subjectId === subj.id);
    const totalSec = subjLogs.reduce((acc, l) => acc + l.durationSeconds, 0);
    const totalMinutes = Math.round(totalSec / 60);

    const colorMap: Record<string, string> = {
      violet: '#a78bfa',
      blue: '#60a5fa',
      emerald: '#34d399',
      amber: '#fbbf24',
      rose: '#f43f5e',
      indigo: '#818cf8',
      cyan: '#22d3ee',
      pink: '#f472b6',
    };

    return {
      name: subj.name,
      minutes: totalMinutes,
      hours: +(totalMinutes / 60).toFixed(1),
      color: colorMap[subj.color] || '#8b5cf6',
    };
  });

  const getDDayCount = (targetDateStr: string) => {
    const target = new Date(targetDateStr).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'D-DAY';
    return diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };

  const handleAddDDay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;
    addDDay({
      title: newTitle,
      targetDate: newDate,
      subjectId: newSubjectId,
    });
    setNewTitle('');
    setShowAddDDay(false);
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Header Banner */}
      <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <BarChart3 size={24} color="var(--color-primary)" />
          <div>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 800 }}>학습 통계 & 시험 D-Day 리포트</h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              과목별 몰입 투자시간 그래프 시각화 및 주요 학사 일정 관리
            </p>
          </div>
        </div>

        <button className="btn-primary" onClick={() => setShowAddDDay(prev => !prev)}>
          <Plus size={16} />
          <span>D-Day 일정 추가</span>
        </button>
      </div>

      {/* Add D-Day Drawer Form */}
      {showAddDDay && (
        <form className="glass-panel animate-fade-in" onSubmit={handleAddDDay} style={{ padding: '1.25rem', background: 'var(--bg-card-solid)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem' }}>🎯 새 D-Day 일정 등록</h3>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input
              type="text"
              className="input-field"
              placeholder="예: 경영학원론 중간고사"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              required
            />
            <input type="date" className="input-field" value={newDate} onChange={(e) => setNewDate(e.target.value)} required />

            <select className="input-field" value={newSubjectId} onChange={(e) => setNewSubjectId(e.target.value)}>
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
            <button type="button" className="btn-secondary" onClick={() => setShowAddDDay(false)}>취소</button>
            <button type="submit" className="btn-primary">등록하기</button>
          </div>
        </form>
      )}

      {/* D-Day Countdown Cards Grid */}
      <div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Trophy size={18} color="#fbbf24" />
          <span>시험 및 주요 과제 D-Day 카운트다운</span>
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {ddays.map(dday => {
            const subj = subjects.find(s => s.id === dday.subjectId);
            const ddayLabel = getDDayCount(dday.targetDate);
            const isImminent = ddayLabel.startsWith('D-') && parseInt(ddayLabel.replace('D-', ''), 10) <= 7;

            return (
              <div
                key={dday.id}
                className="glass-panel"
                style={{
                  padding: '1.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isImminent ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-card)',
                  borderColor: isImminent ? '#f43f5e' : 'var(--border-color)',
                }}
              >
                <div>
                  {subj && (
                    <span className={`subject-badge subj-bg-${subj.color}`} style={{ marginBottom: '0.3rem' }}>
                      {subj.name}
                    </span>
                  )}
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, marginTop: '0.2rem' }}>{dday.title}</h4>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' }}>
                    <Calendar size={13} />
                    <span>{dday.targetDate}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                  <span
                    style={{
                      fontSize: '1.1rem',
                      fontWeight: 800,
                      padding: '0.3rem 0.75rem',
                      borderRadius: '10px',
                      background: isImminent ? '#f43f5e' : 'var(--color-primary-light)',
                      color: isImminent ? 'white' : 'var(--color-primary)',
                    }}
                  >
                    {ddayLabel}
                  </span>

                  <button
                    className="icon-btn"
                    style={{ width: 28, height: 28, color: '#f43f5e' }}
                    onClick={() => deleteDDay(dday.id)}
                    title="삭제"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Study Time Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.25rem' }}>
        {/* Bar Chart: Hours per Subject */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Clock size={18} color="var(--color-primary)" />
            <span>과목별 총 누적 공부시간 (단위: 시간)</span>
          </h3>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" stroke="var(--text-subdued)" fontSize={12} />
                <YAxis stroke="var(--text-subdued)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
                <Bar dataKey="hours" radius={[8, 8, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie Chart: Ratio */}
        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={18} color="var(--color-secondary)" />
            <span>과목별 공부 투자 비중 (%)</span>
          </h3>

          <div style={{ width: '100%', height: '260px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="minutes"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ name }) => `${name || ''}`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: 'var(--bg-card-solid)', border: '1px solid var(--border-color)', borderRadius: '8px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
