-- ========================================================
-- 🎓 UniSync Supabase PostgreSQL Database Setup Script (V2)
-- Supabase 대시보드 (https://supabase.com) > SQL Editor에 전체 복사하여 [Run] 하세요.
-- ========================================================

-- 기존 테이블 및 제약 조건 초기화 (선택적)
DROP TABLE IF EXISTS study_logs CASCADE;
DROP TABLE IF EXISTS ddays CASCADE;
DROP TABLE IF EXISTS memos CASCADE;
DROP TABLE IF EXISTS todos CASCADE;
DROP TABLE IF EXISTS schedules CASCADE;
DROP TABLE IF EXISTS subjects CASCADE;

-- 1. 과목 테이블 (subjects)
CREATE TABLE subjects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT,
  professor TEXT,
  room TEXT,
  color TEXT NOT NULL DEFAULT 'violet',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 일정 테이블 (schedules)
CREATE TABLE schedules (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  start_time TEXT,
  end_time TEXT,
  is_fixed_class BOOLEAN DEFAULT FALSE,
  location TEXT,
  todo_id TEXT,
  memo_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 투두리스트 테이블 (todos)
CREATE TABLE todos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  title TEXT NOT NULL,
  due_date DATE,
  due_time TEXT,
  completed BOOLEAN DEFAULT FALSE,
  priority TEXT DEFAULT 'high',
  memo_id TEXT,
  estimated_minutes INT DEFAULT 60,
  actual_study_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 마크다운 메모 테이블 (memos)
CREATE TABLE memos (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  title TEXT NOT NULL,
  content TEXT,
  tags TEXT[],
  linked_schedule_id TEXT,
  linked_todo_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. D-Day 일정 테이블 (ddays)
CREATE TABLE ddays (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  title TEXT NOT NULL,
  target_date DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 공부 세션 시간 기록 테이블 (study_logs)
CREATE TABLE study_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  subject_id TEXT,
  todo_id TEXT,
  date DATE NOT NULL,
  duration_seconds INT DEFAULT 0,
  mode TEXT DEFAULT 'pomodoro',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 기본 샘플 과목 데이터 삽입
INSERT INTO subjects (id, name, code, professor, room, color)
VALUES 
  ('subj-1', '경영학원론', 'BUS101', '김경영 교수님', '상경관 302호', 'violet'),
  ('subj-2', '컴퓨터프로그래밍', 'CS102', '박코딩 교수님', '공학관 501호', 'blue'),
  ('subj-3', '마케팅원론', 'MKT201', '이마켓 교수님', '경영관 204호', 'emerald'),
  ('subj-4', '영어회화', 'ENG101', 'John Smith', '교양관 101호', 'amber')
ON CONFLICT (id) DO NOTHING;

-- Row Level Security (RLS) 활성화
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE memos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ddays ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_logs ENABLE ROW LEVEL SECURITY;

-- 익명(Anon) 및 인증(Auth) 유저 모두 읽기/쓰기 허용 정책
CREATE POLICY "Allow anon and auth all operations on subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all operations on schedules" ON schedules FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all operations on todos" ON todos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all operations on memos" ON memos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all operations on ddays" ON ddays FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow anon and auth all operations on study_logs" ON study_logs FOR ALL USING (true) WITH CHECK (true);
