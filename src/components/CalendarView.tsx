import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, Clock, MapPin, FileText, Play, Trash2, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ScheduleEvent } from '../types';

export const CalendarView: React.FC = () => {
  const {
    schedules,
    subjects,
    deleteSchedule,
    startTimer,
    setSelectedMemoId,
    setActiveTab,
    addSchedule,
  } = useApp();

  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [selectedEvent, setSelectedEvent] = useState<ScheduleEvent | null>(null);

  // New Event Modal Form
  const [showAddModal, setShowAddModal] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState(todayStr);
  const [newStartTime, setNewStartTime] = useState('14:00');
  const [newEndTime, setNewEndTime] = useState('16:00');
  const [newSubjectId, setNewSubjectId] = useState(subjects[0]?.id || '');
  const [newIsFixed, setNewIsFixed] = useState(false);
  const [newLocation, setNewLocation] = useState('');

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };
  const goToday = () => setCurrentDate(new Date());

  // Generate Month Days Grid
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayOfMonth = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysArray: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) daysArray.push(null);
  for (let i = 1; i <= daysInMonth; i++) daysArray.push(i);

  const formatPad = (n: number) => n.toString().padStart(2, '0');

  const getEventsForDay = (dayNum: number) => {
    const dateStr = `${year}-${formatPad(month + 1)}-${formatPad(dayNum)}`;
    return schedules.filter(s => s.date === dateStr);
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    addSchedule({
      title: newTitle,
      subjectId: newSubjectId,
      date: newDate,
      startTime: newStartTime,
      endTime: newEndTime,
      isFixedClass: newIsFixed,
      location: newLocation,
    });
    setNewTitle('');
    setShowAddModal(false);
  };

  const getSubjectColor = (subjId?: string) => {
    const found = subjects.find(s => s.id === subjId);
    return found?.color || 'violet';
  };

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {/* Calendar Header Controls */}
      <div className="glass-panel" style={{ padding: '1rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CalendarIcon size={22} color="var(--color-primary)" />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {year}년 {month + 1}월
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button className="icon-btn" onClick={prevMonth} style={{ width: 34, height: 34 }}>
              <ChevronLeft size={18} />
            </button>
            <button className="btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }} onClick={goToday}>
              오늘
            </button>
            <button className="icon-btn" onClick={nextMonth} style={{ width: 34, height: 34 }}>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* View Mode Toggle & Add Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="nav-tabs">
            <button
              className={`nav-tab-btn ${viewMode === 'month' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
              onClick={() => setViewMode('month')}
            >
              월간 뷰
            </button>
            <button
              className={`nav-tab-btn ${viewMode === 'week' ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem' }}
              onClick={() => setViewMode('week')}
            >
              주간/시간표 뷰
            </button>
          </div>

          <button className="btn-primary" style={{ padding: '0.45rem 0.9rem', fontSize: '0.85rem' }} onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>일정 추가</span>
          </button>
        </div>
      </div>

      {/* Month View Grid */}
      {viewMode === 'month' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          {/* Weekday Labels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-subdued)', textAlign: 'center' }}>
            <span style={{ color: '#f43f5e' }}>일</span>
            <span>월</span>
            <span>화</span>
            <span>수</span>
            <span>목</span>
            <span>금</span>
            <span style={{ color: '#60a5fa' }}>토</span>
          </div>

          {/* Days Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.5rem' }}>
            {daysArray.map((dayNum, idx) => {
              if (dayNum === null) {
                return <div key={`empty-${idx}`} style={{ minHeight: '110px', background: 'transparent' }} />;
              }

              const dayEvents = getEventsForDay(dayNum);
              const isToday =
                new Date().getFullYear() === year &&
                new Date().getMonth() === month &&
                new Date().getDate() === dayNum;

              return (
                <div
                  key={`day-${dayNum}`}
                  style={{
                    minHeight: '110px',
                    padding: '0.5rem',
                    borderRadius: '12px',
                    background: isToday ? 'var(--color-primary-light)' : 'var(--bg-card-solid)',
                    border: isToday ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.35rem',
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.88rem', fontWeight: isToday ? 800 : 600, color: isToday ? 'var(--color-primary)' : 'var(--text-main)' }}>
                      {dayNum}
                    </span>
                    {isToday && <span style={{ fontSize: '0.68rem', fontWeight: 800, background: 'var(--color-primary)', color: 'white', padding: '0.05rem 0.35rem', borderRadius: '4px' }}>TODAY</span>}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', overflowY: 'auto' }}>
                    {dayEvents.map(evt => {
                      const color = getSubjectColor(evt.subjectId);
                      return (
                        <div
                          key={evt.id}
                          style={{
                            padding: '0.25rem 0.45rem',
                            borderRadius: '6px',
                            fontSize: '0.74rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          className={`subj-bg-${color}`}
                          onClick={() => setSelectedEvent(evt)}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {evt.isFixedClass ? '📚' : '✏️'} {evt.title}
                            </span>
                            {evt.startTime && <span style={{ fontSize: '0.68rem', opacity: 0.85 }}>{evt.startTime}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Week / Timetable View */}
      {viewMode === 'week' && (
        <div className="glass-panel" style={{ padding: '1.25rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary)' }}>
            📅 강의 및 학업 일정 시각화 시간표 (Week Schedule)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '0.5rem', overflowX: 'auto' }}>
            <div style={{ fontWeight: 700, fontSize: '0.8rem', color: 'var(--text-subdued)' }}>시간대</div>
            {['월', '화', '수', '목', '금', '토', '일'].map((day, idx) => (
              <div key={idx} style={{ textAlign: 'center', fontWeight: 700, fontSize: '0.88rem', padding: '0.35rem', background: 'var(--bg-input)', borderRadius: '8px' }}>
                {day}
              </div>
            ))}

            {/* Time Slot Rows */}
            {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'].map((timeSlot) => (
              <React.Fragment key={timeSlot}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-subdued)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center' }}>
                  {timeSlot}
                </div>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIdx) => {
                  const matchEvt = schedules.find(s => s.startTime && s.startTime.startsWith(timeSlot.substring(0, 2)));
                  return (
                    <div
                      key={dayIdx}
                      style={{
                        minHeight: '45px',
                        border: '1px dashed var(--border-color)',
                        borderRadius: '8px',
                        padding: '0.2rem',
                      }}
                    >
                      {matchEvt && dayIdx === 0 && (
                        <div
                          className={`subj-bg-${getSubjectColor(matchEvt.subjectId)}`}
                          style={{ padding: '0.25rem', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}
                          onClick={() => setSelectedEvent(matchEvt)}
                        >
                          {matchEvt.title}
                        </div>
                      )}
                    </div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Event Details & Connected Modules Modal */}
      {selectedEvent && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{ maxWidth: '500px', width: '100%', padding: '1.5rem', background: 'var(--bg-card-solid)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
              <div>
                <span className={`subject-badge subj-bg-${getSubjectColor(selectedEvent.subjectId)}`} style={{ marginBottom: '0.4rem' }}>
                  {subjects.find(s => s.id === selectedEvent.subjectId)?.name || '일반 일정'}
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{selectedEvent.title}</h3>
              </div>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setSelectedEvent(null)}>
                <X size={16} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Clock size={16} color="var(--color-primary)" />
                <span>{selectedEvent.date} {selectedEvent.startTime} ~ {selectedEvent.endTime}</span>
              </div>
              {selectedEvent.location && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <MapPin size={16} color="var(--color-secondary)" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
            </div>

            {/* Connected Modules Quick Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', padding: '1rem', borderRadius: '12px', background: 'var(--bg-input)', marginBottom: '1.25rem' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-subdued)' }}>⚡ 연동 모듈 바로가기</h4>

              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {selectedEvent.memoId && (
                  <button
                    className="btn-secondary"
                    style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                    onClick={() => {
                      setSelectedMemoId(selectedEvent.memoId!);
                      setActiveTab('memo');
                    }}
                  >
                    <FileText size={14} color="#a78bfa" />
                    <span>연동 메모 열기</span>
                  </button>
                )}

                <button
                  className="btn-primary"
                  style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
                  onClick={() => {
                    startTimer(selectedEvent.subjectId || subjects[0]?.id || 'subj-1', selectedEvent.todoId, 'pomodoro');
                  }}
                >
                  <Play size={14} />
                  <span>▶ 타이머 시작</span>
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <button
                style={{ color: '#f43f5e', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.85rem' }}
                onClick={() => {
                  deleteSchedule(selectedEvent.id);
                  setSelectedEvent(null);
                }}
              >
                <Trash2 size={16} />
                <span>일정 삭제</span>
              </button>

              <button className="btn-secondary" onClick={() => setSelectedEvent(null)}>
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Event Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(5px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            className="glass-panel animate-fade-in"
            style={{ maxWidth: '500px', width: '100%', padding: '1.5rem', background: 'var(--bg-card-solid)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>📅 새 일정 추가</h3>
              <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>일정 제목</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="예: 경영학원론 3장 복습"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>날짜</label>
                  <input
                    type="date"
                    className="input-field"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>과목 선택</label>
                  <select
                    className="input-field"
                    value={newSubjectId}
                    onChange={(e) => setNewSubjectId(e.target.value)}
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>시작 시간</label>
                  <input
                    type="time"
                    className="input-field"
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>종료 시간</label>
                  <input
                    type="time"
                    className="input-field"
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>장소 (선택)</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="예: 중앙도서관 3층 열람실"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.3rem' }}>
                <input
                  type="checkbox"
                  id="fixedClassCheck"
                  checked={newIsFixed}
                  onChange={(e) => setNewIsFixed(e.target.checked)}
                />
                <label htmlFor="fixedClassCheck" style={{ fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                  정규 수업 강의 시간표 항목 (고정 일정)
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>
                  취소
                </button>
                <button type="submit" className="btn-primary">
                  등록하기
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
