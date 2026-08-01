import type { Subject, ScheduleEvent, TodoItem, MemoNode, DDayItem, StudySessionLog } from '../types';

const STORAGE_KEYS = {
  SUBJECTS: 'studyhub_subjects_v1',
  SCHEDULES: 'studyhub_schedules_v1',
  TODOS: 'studyhub_todos_v1',
  MEMOS: 'studyhub_memos_v1',
  DDAYS: 'studyhub_ddays_v1',
  LOGS: 'studyhub_study_logs_v1',
  THEME: 'studyhub_theme_v1',
};

export const DEFAULT_SUBJECTS: Subject[] = [
  { id: 'subj-1', name: '경영학원론', code: 'BUS101', professor: '김경영 교수님', room: '상경관 302호', color: 'violet' },
  { id: 'subj-2', name: '컴퓨터프로그래밍', code: 'CS102', professor: '박코딩 교수님', room: '공학관 501호', color: 'blue' },
  { id: 'subj-3', name: '마케팅원론', code: 'MKT201', professor: '이마켓 교수님', room: '경영관 204호', color: 'emerald' },
  { id: 'subj-4', name: '영어회화', code: 'ENG101', professor: 'John Smith', room: '교양관 101호', color: 'amber' },
];

export const DEFAULT_DDAYS: DDayItem[] = [
  { id: 'dday-1', title: '경영학원론 중간고사', targetDate: '2026-08-15', subjectId: 'subj-1' },
  { id: 'dday-2', title: '컴프로 조별과제 1차 발표', targetDate: '2026-08-10', subjectId: 'subj-2' },
  { id: 'dday-3', title: '토익 스피킹 시험', targetDate: '2026-08-25' },
];

const todayStr = new Date().toISOString().split('T')[0];

export const DEFAULT_TODOS: TodoItem[] = [
  {
    id: 'todo-1',
    title: '경영학원론 3장 마케팅 전략 요약노트 작성',
    subjectId: 'subj-1',
    dueDate: todayStr,
    dueTime: '20:00',
    completed: false,
    priority: 'high',
    memoId: 'memo-1',
    estimatedMinutes: 60,
    actualStudySeconds: 1500,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo-2',
    title: '컴퓨터프로그래밍 과제 2 실습 코드 제출',
    subjectId: 'subj-2',
    dueDate: todayStr,
    dueTime: '23:59',
    completed: true,
    priority: 'high',
    memoId: 'memo-2',
    estimatedMinutes: 90,
    actualStudySeconds: 4200,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'todo-3',
    title: '마케팅원론 사례 연구 읽기',
    subjectId: 'subj-3',
    dueDate: todayStr,
    dueTime: '18:00',
    completed: false,
    priority: 'medium',
    createdAt: new Date().toISOString(),
  },
];

export const DEFAULT_SCHEDULES: ScheduleEvent[] = [
  {
    id: 'sched-1',
    title: '경영학원론 정규 강의',
    subjectId: 'subj-1',
    date: todayStr,
    startTime: '10:00',
    endTime: '12:00',
    isFixedClass: true,
    location: '상경관 302호',
  },
  {
    id: 'sched-2',
    title: '컴퓨터프로그래밍 실습',
    subjectId: 'subj-2',
    date: todayStr,
    startTime: '14:00',
    endTime: '16:00',
    isFixedClass: true,
    location: '공학관 501호',
  },
  {
    id: 'sched-3',
    title: '경영학원론 3장 공부 (스마트 연동)',
    subjectId: 'subj-1',
    date: todayStr,
    startTime: '20:00',
    endTime: '21:00',
    isFixedClass: false,
    todoId: 'todo-1',
    memoId: 'memo-1',
  },
];

export const DEFAULT_MEMOS: MemoNode[] = [
  {
    id: 'memo-1',
    title: '경영학원론 - 3장 마케팅 환경 분석 핵심 요약',
    subjectId: 'subj-1',
    tags: ['경영학', '중간고사', '요약'],
    content: `# 📖 경영학원론 3장: 마케팅 환경 분석

## 1. 미시적 환경 분석 (Micro-environment)
- **기업 내부 (Company)**: 최고 경영층, 재무, R&D, 구매, 생산
- **공급자 (Suppliers)**: 원자재 및 부품 공급업체과의 상호 영향
- **마케팅 중개기관 (Intermediaries)**: 도소매상, 물류업체, 광고대행사
- **고객 (Customers)**: 소비자 시장, B2B 시장, 정부 시장

## 2. 거시적 환경 분석 (PEST 분석)
- **Political (정치적)**: 규제 정책, 세제 혜택
- **Economic (경제적)**: 환율, 물가상승률, 금리
- **Social (사회문화적)**: 인구 구조 변화, 라이프스타일
- **Technological (기술적)**: AI 자동화, 디지털 전환

> 💡 **시험 출제 포인트**: 3단계 SWOT 분석과 TOWS 전략 연결 작성 문제 출제 예상!
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedScheduleId: 'sched-3',
    linkedTodoId: 'todo-1',
  },
  {
    id: 'memo-2',
    title: '컴퓨터프로그래밍 - React & TypeScript 상태관리 정리',
    subjectId: 'subj-2',
    tags: ['React', 'TypeScript', '실습'],
    content: `# 💻 React + TypeScript 상태 관리 실습 노트

## Context API 패턴
- \`createContext\`로 전역 state 공급자 정의
- custom \`useContext\` 훅을 통한 타입 안전한 상태 접근

\`\`\`typescript
interface AppState {
  todos: TodoItem[];
  timer: ActiveTimer;
}
\`\`\`

## 뽀모도로 타이머 상태 업데이트 알고리즘
- 1초마다 \`secondsLeft\` 차감
- \`secondsLeft === 0\` 일 때 사운드 출력 및 break 모드 자동 전환
`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    linkedTodoId: 'todo-2',
  },
];

export const DEFAULT_STUDY_LOGS: StudySessionLog[] = [
  { id: 'log-1', subjectId: 'subj-1', durationSeconds: 3600, mode: 'pomodoro', date: todayStr, createdAt: new Date().toISOString() },
  { id: 'log-2', subjectId: 'subj-2', durationSeconds: 5400, mode: 'stopwatch', date: todayStr, createdAt: new Date().toISOString() },
  { id: 'log-3', subjectId: 'subj-3', durationSeconds: 1800, mode: 'pomodoro', date: todayStr, createdAt: new Date().toISOString() },
];

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`Failed loading ${key} from storage:`, e);
    return fallback;
  }
}

export function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`Failed saving ${key} to storage:`, e);
  }
}

export { STORAGE_KEYS };
