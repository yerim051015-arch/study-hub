import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import type { User } from '@supabase/supabase-js';
import type {
  Subject,
  ScheduleEvent,
  TodoItem,
  MemoNode,
  DDayItem,
  StudySessionLog,
  ActiveTimer,
  SmartParseResult,
  Priority
} from '../types';
import {
  STORAGE_KEYS,
  DEFAULT_SUBJECTS,
  DEFAULT_SCHEDULES,
  DEFAULT_TODOS,
  DEFAULT_MEMOS,
  DEFAULT_DDAYS,
  DEFAULT_STUDY_LOGS,
  loadFromStorage,
  saveToStorage,
} from '../utils/storage';
import { soundManager } from '../utils/sound';
import { supabase } from '../lib/supabase';
import { supabaseService } from '../services/supabaseService';

export type NavTab = 'dashboard' | 'input' | 'calendar' | 'todo' | 'memo' | 'timer' | 'stats';

interface AppContextType {
  // Navigation & Theme
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;

  // Supabase Auth User State
  user: User | null;
  signOut: () => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;

  // Domain Data
  subjects: Subject[];
  schedules: ScheduleEvent[];
  todos: TodoItem[];
  memos: MemoNode[];
  ddays: DDayItem[];
  studyLogs: StudySessionLog[];

  // Active Selected Memo / Todo
  selectedMemoId: string | null;
  setSelectedMemoId: (id: string | null) => void;

  // Timer State
  activeTimer: ActiveTimer;
  startTimer: (subjectId: string, todoId?: string, mode?: 'pomodoro' | 'stopwatch') => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => void;
  resetTimer: () => void;

  // CRUD Actions
  addSubject: (subject: Omit<Subject, 'id'>) => void;
  deleteSubject: (id: string) => void;

  addTodo: (todo: Omit<TodoItem, 'id' | 'createdAt'>) => string;
  toggleTodo: (id: string) => void;
  deleteTodo: (id: string) => void;

  addSchedule: (schedule: Omit<ScheduleEvent, 'id'>) => string;
  deleteSchedule: (id: string) => void;

  addMemo: (memo: Omit<MemoNode, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateMemo: (id: string, updates: Partial<MemoNode>) => void;
  deleteMemo: (id: string) => void;

  addDDay: (dday: Omit<DDayItem, 'id'>) => void;
  deleteDDay: (id: string) => void;

  // Magic One-Stop Smart Input
  executeSmartCreate: (parseResult: SmartParseResult) => { todoId: string; scheduleId: string; memoId: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Auth Modal
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Theme
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return loadFromStorage<boolean>(STORAGE_KEYS.THEME, false);
  });

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.THEME, isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark-theme');
      document.documentElement.classList.remove('light-theme');
    } else {
      document.documentElement.classList.add('light-theme');
      document.documentElement.classList.remove('dark-theme');
    }
  }, [isDarkMode]);

  const toggleTheme = () => setIsDarkMode(prev => !prev);

  // Data Collections
  const [subjects, setSubjects] = useState<Subject[]>(() => loadFromStorage(STORAGE_KEYS.SUBJECTS, DEFAULT_SUBJECTS));
  const [schedules, setSchedules] = useState<ScheduleEvent[]>(() => loadFromStorage(STORAGE_KEYS.SCHEDULES, DEFAULT_SCHEDULES));
  const [todos, setTodos] = useState<TodoItem[]>(() => loadFromStorage(STORAGE_KEYS.TODOS, DEFAULT_TODOS));
  const [memos, setMemos] = useState<MemoNode[]>(() => loadFromStorage(STORAGE_KEYS.MEMOS, DEFAULT_MEMOS));
  const [ddays, setDDays] = useState<DDayItem[]>(() => loadFromStorage(STORAGE_KEYS.DDAYS, DEFAULT_DDAYS));
  const [studyLogs, setStudyLogs] = useState<StudySessionLog[]>(() => loadFromStorage(STORAGE_KEYS.LOGS, DEFAULT_STUDY_LOGS));

  const [selectedMemoId, setSelectedMemoId] = useState<string | null>(memos.length > 0 ? memos[0].id : null);

  // Seed default subjects on mount
  useEffect(() => {
    supabaseService.seedDefaultSubjects();
  }, []);

  // Listen to Supabase Auth State
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user || null));

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user || null;
      setUser(currentUser);
      if (currentUser) {
        // Fetch Cloud DB Data upon login
        supabaseService.fetchAllData().then(cloudData => {
          if (cloudData) {
            if (cloudData.subjects && cloudData.subjects.length > 0) setSubjects(cloudData.subjects);
            if (cloudData.schedules && cloudData.schedules.length > 0) setSchedules(cloudData.schedules);
            if (cloudData.todos && cloudData.todos.length > 0) setTodos(cloudData.todos);
            if (cloudData.memos && cloudData.memos.length > 0) setMemos(cloudData.memos);
            if (cloudData.ddays && cloudData.ddays.length > 0) setDDays(cloudData.ddays);
            if (cloudData.studyLogs && cloudData.studyLogs.length > 0) setStudyLogs(cloudData.studyLogs);
          }
        });
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Auto save to LocalStorage (Fallback / Immediate Local Sync)
  useEffect(() => saveToStorage(STORAGE_KEYS.SUBJECTS, subjects), [subjects]);
  useEffect(() => saveToStorage(STORAGE_KEYS.SCHEDULES, schedules), [schedules]);
  useEffect(() => saveToStorage(STORAGE_KEYS.TODOS, todos), [todos]);
  useEffect(() => saveToStorage(STORAGE_KEYS.MEMOS, memos), [memos]);
  useEffect(() => saveToStorage(STORAGE_KEYS.DDAYS, ddays), [ddays]);
  useEffect(() => saveToStorage(STORAGE_KEYS.LOGS, studyLogs), [studyLogs]);

  // Active Timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimer>({
    isRunning: false,
    mode: 'pomodoro',
    phase: 'work',
    secondsLeft: 25 * 60,
    elapsedSeconds: 0,
    subjectId: subjects[0]?.id || 'subj-1',
  });

  // Timer Tick Interval
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (activeTimer.isRunning) {
      interval = setInterval(() => {
        setActiveTimer(prev => {
          if (!prev.isRunning) return prev;

          // Stopwatch mode
          if (prev.mode === 'stopwatch') {
            return {
              ...prev,
              elapsedSeconds: prev.elapsedSeconds + 1,
            };
          }

          // Pomodoro mode
          if (prev.secondsLeft <= 1) {
            // Phase transition!
            soundManager.playTimerComplete();
            confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });

            if (prev.phase === 'work') {
              // Log work session
              const nowStr = new Date().toISOString().split('T')[0];
              const newLog: StudySessionLog = {
                id: `log-${Date.now()}`,
                subjectId: prev.subjectId,
                todoId: prev.todoId,
                date: nowStr,
                durationSeconds: 25 * 60,
                mode: 'pomodoro',
                createdAt: new Date().toISOString(),
              };
              setStudyLogs(logs => [newLog, ...logs]);
              supabaseService.saveStudyLog(newLog, user?.id);

              // Update actual study time on todo if applicable
              if (prev.todoId) {
                setTodos(tList => tList.map(t => {
                  if (t.id === prev.todoId) {
                    const updated = { ...t, actualStudySeconds: (t.actualStudySeconds || 0) + 25 * 60 };
                    supabaseService.saveTodo(updated, user?.id);
                    return updated;
                  }
                  return t;
                }));
              }

              return {
                ...prev,
                phase: 'break',
                secondsLeft: 5 * 60,
                elapsedSeconds: prev.elapsedSeconds + 25 * 60,
              };
            } else {
              // Break finished -> back to work
              return {
                ...prev,
                phase: 'work',
                secondsLeft: 25 * 60,
              };
            }
          }

          return {
            ...prev,
            secondsLeft: prev.secondsLeft - 1,
            elapsedSeconds: prev.elapsedSeconds + 1,
          };
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning, user?.id]);

  // Timer actions
  const startTimer = (subjectId: string, todoId?: string, mode: 'pomodoro' | 'stopwatch' = 'pomodoro') => {
    soundManager.playTimerStart();
    setActiveTimer({
      isRunning: true,
      mode,
      phase: 'work',
      secondsLeft: mode === 'pomodoro' ? 25 * 60 : 0,
      elapsedSeconds: 0,
      subjectId,
      todoId,
    });
    setActiveTab('timer');
  };

  const pauseTimer = () => {
    soundManager.playClick();
    setActiveTimer(prev => ({ ...prev, isRunning: false }));
  };

  const resumeTimer = () => {
    soundManager.playClick();
    setActiveTimer(prev => ({ ...prev, isRunning: true }));
  };

  const stopTimer = () => {
    soundManager.playClick();
    if (activeTimer.elapsedSeconds > 10) {
      const nowStr = new Date().toISOString().split('T')[0];
      const newLog: StudySessionLog = {
        id: `log-${Date.now()}`,
        subjectId: activeTimer.subjectId,
        todoId: activeTimer.todoId,
        date: nowStr,
        durationSeconds: activeTimer.elapsedSeconds,
        mode: activeTimer.mode,
        createdAt: new Date().toISOString(),
      };
      setStudyLogs(logs => [newLog, ...logs]);
      supabaseService.saveStudyLog(newLog, user?.id);

      if (activeTimer.todoId) {
        setTodos(tList => tList.map(t => {
          if (t.id === activeTimer.todoId) {
            const updated = { ...t, actualStudySeconds: (t.actualStudySeconds || 0) + activeTimer.elapsedSeconds };
            supabaseService.saveTodo(updated, user?.id);
            return updated;
          }
          return t;
        }));
      }
    }
    setActiveTimer(prev => ({
      ...prev,
      isRunning: false,
      secondsLeft: 25 * 60,
      elapsedSeconds: 0,
    }));
  };

  const resetTimer = () => {
    soundManager.playClick();
    setActiveTimer(prev => ({
      ...prev,
      secondsLeft: prev.mode === 'pomodoro' ? 25 * 60 : 0,
      elapsedSeconds: 0,
    }));
  };

  // Subject Actions
  const addSubject = (sub: Omit<Subject, 'id'>) => {
    const newSub: Subject = { ...sub, id: `subj-${Date.now()}` };
    setSubjects(prev => [...prev, newSub]);
  };

  const deleteSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
  };

  // Todo Actions
  const addTodo = useCallback((t: Omit<TodoItem, 'id' | 'createdAt'>): string => {
    const id = `todo-${Date.now()}`;
    const newTodo: TodoItem = {
      ...t,
      id,
      createdAt: new Date().toISOString(),
    };
    setTodos(prev => [newTodo, ...prev]);
    supabaseService.saveTodo(newTodo, user?.id);
    return id;
  }, [user?.id]);

  const toggleTodo = (id: string) => {
    soundManager.playClick();
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const nextCompleted = !t.completed;
        if (nextCompleted) {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } });
        }
        const updated = { ...t, completed: nextCompleted };
        supabaseService.saveTodo(updated, user?.id);
        return updated;
      }
      return t;
    }));
  };

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    supabaseService.deleteTodo(id);
  };

  // Schedule Actions
  const addSchedule = useCallback((s: Omit<ScheduleEvent, 'id'>): string => {
    const id = `sched-${Date.now()}`;
    const newSched: ScheduleEvent = { ...s, id };
    setSchedules(prev => [...prev, newSched]);
    supabaseService.saveSchedule(newSched, user?.id);
    return id;
  }, [user?.id]);

  const deleteSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    supabaseService.deleteSchedule(id);
  };

  // Memo Actions
  const addMemo = useCallback((m: Omit<MemoNode, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const id = `memo-${Date.now()}`;
    const nowIso = new Date().toISOString();
    const newMemo: MemoNode = {
      ...m,
      id,
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    setMemos(prev => [newMemo, ...prev]);
    setSelectedMemoId(id);
    supabaseService.saveMemo(newMemo, user?.id);
    return id;
  }, [user?.id]);

  const updateMemo = (id: string, updates: Partial<MemoNode>) => {
    setMemos(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates, updatedAt: new Date().toISOString() };
        supabaseService.saveMemo(updated, user?.id);
        return updated;
      }
      return m;
    }));
  };

  const deleteMemo = (id: string) => {
    setMemos(prev => prev.filter(m => m.id !== id));
    if (selectedMemoId === id) {
      setSelectedMemoId(memos.find(m => m.id !== id)?.id || null);
    }
    supabaseService.deleteMemo(id);
  };

  // DDay Actions
  const addDDay = (d: Omit<DDayItem, 'id'>) => {
    const newD: DDayItem = { ...d, id: `dday-${Date.now()}` };
    setDDays(prev => [...prev, newD]);
    supabaseService.saveDDay(newD, user?.id);
  };

  const deleteDDay = (id: string) => {
    setDDays(prev => prev.filter(d => d.id !== id));
    supabaseService.deleteDDay(id);
  };

  // MAGIC ONE-STOP SMART INPUT ENGINE!
  const executeSmartCreate = useCallback((parseResult: SmartParseResult) => {
    const date = parseResult.date || new Date().toISOString().split('T')[0];
    const time = parseResult.time || '19:00';
    const subjectId = parseResult.subjectId || subjects[0]?.id;
    const title = parseResult.title || parseResult.rawText;

    // Calculate end time (+1 hour)
    const [h, m] = time.split(':').map(Number);
    const endH = (h + 1) % 24;
    const pad = (n: number) => n.toString().padStart(2, '0');
    const endTime = `${pad(endH)}:${pad(m)}`;

    // 1. Create Memo first
    const memoId = addMemo({
      title: `[스마트 연동] ${title}`,
      content: `# 📝 ${title}\n\n- **일시**: ${date} ${time}\n- **과목**: ${parseResult.subjectName || '일반'}\n- **자연어 원문**: "${parseResult.rawText}"\n\n## 📌 세부 학습 및 과제 메모\n여기에 필기 노트나 과제 상세 내용을 작성하세요.\n`,
      subjectId,
      tags: ['스마트입력', parseResult.subjectName || '학습'].filter(Boolean),
    });

    // 2. Create Todo
    const todoId = addTodo({
      title,
      subjectId,
      dueDate: date,
      dueTime: time,
      completed: false,
      priority: 'high' as Priority,
      memoId,
      estimatedMinutes: 60,
      actualStudySeconds: 0,
    });

    // 3. Create Schedule
    const scheduleId = addSchedule({
      title,
      subjectId,
      date,
      startTime: time,
      endTime,
      isFixedClass: false,
      todoId,
      memoId,
    });

    // Link memo back to todo & schedule
    updateMemo(memoId, { linkedTodoId: todoId, linkedScheduleId: scheduleId });

    // Trigger celebration chime & confetti
    soundManager.playTimerComplete();
    confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });

    return { todoId, scheduleId, memoId };
  }, [subjects, addMemo, addTodo, addSchedule, updateMemo]);

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isDarkMode,
        toggleTheme,
        user,
        signOut,
        isAuthModalOpen,
        setIsAuthModalOpen,
        subjects,
        schedules,
        todos,
        memos,
        ddays,
        studyLogs,
        selectedMemoId,
        setSelectedMemoId,
        activeTimer,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimer,
        resetTimer,
        addSubject,
        deleteSubject,
        addTodo,
        toggleTodo,
        deleteTodo,
        addSchedule,
        deleteSchedule,
        addMemo,
        updateMemo,
        deleteMemo,
        addDDay,
        deleteDDay,
        executeSmartCreate,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
