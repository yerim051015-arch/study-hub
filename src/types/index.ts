export type SubjectColor = 'violet' | 'blue' | 'emerald' | 'amber' | 'rose' | 'indigo' | 'cyan' | 'pink';

export interface Subject {
  id: string;
  name: string;      // 예: 경영학원론, 컴퓨터프로그래밍
  code?: string;      // 예: BUS101, CS201
  professor?: string; // 예: 김경영 교수님
  room?: string;      // 예: 상경관 302호
  color: SubjectColor;
}

export type Priority = 'high' | 'medium' | 'low';

export interface TodoItem {
  id: string;
  title: string;
  subjectId?: string;
  dueDate?: string;     // YYYY-MM-DD
  dueTime?: string;     // HH:mm
  completed: boolean;
  priority: Priority;
  memoId?: string;       // 연동된 메모 노드 ID
  estimatedMinutes?: number;
  actualStudySeconds?: number;
  createdAt: string;
}

export interface ScheduleEvent {
  id: string;
  title: string;
  subjectId?: string;
  date: string;          // YYYY-MM-DD
  startTime?: string;    // HH:mm
  endTime?: string;      // HH:mm
  isFixedClass: boolean; // 강의 시간표(고정) vs 가변 일정
  location?: string;
  todoId?: string;
  memoId?: string;
}

export interface MemoNode {
  id: string;
  title: string;
  content: string;
  subjectId?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  linkedScheduleId?: string;
  linkedTodoId?: string;
}

export interface DDayItem {
  id: string;
  title: string;       // 예: 경영학원론 중간고사, 조별과제 발표
  targetDate: string;  // YYYY-MM-DD
  subjectId?: string;
}

export interface StudySessionLog {
  id: string;
  subjectId: string;
  todoId?: string;
  date: string;         // YYYY-MM-DD
  durationSeconds: number;
  mode: 'pomodoro' | 'stopwatch';
  createdAt: string;
}

export type TimerMode = 'pomodoro' | 'stopwatch';
export type PomodoroPhase = 'work' | 'break';

export interface ActiveTimer {
  isRunning: boolean;
  mode: TimerMode;
  phase: PomodoroPhase;
  secondsLeft: number;    // for pomodoro (work: 25*60, break: 5*60)
  elapsedSeconds: number;  // for stopwatch or session tracking
  subjectId: string;
  todoId?: string;
}

export interface SmartParseResult {
  rawText: string;
  date?: string;          // YYYY-MM-DD
  time?: string;          // HH:mm
  subjectId?: string;
  subjectName?: string;
  title: string;
  detectedType: 'all' | 'todo' | 'schedule' | 'memo';
  confidence: number;
}
