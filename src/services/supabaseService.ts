import { supabase } from '../lib/supabase';
import type { Subject, ScheduleEvent, TodoItem, MemoNode, DDayItem, StudySessionLog } from '../types';
import { DEFAULT_SUBJECTS } from '../utils/storage';

export const supabaseService = {
  // Ensure seed subjects exist in Supabase DB
  async seedDefaultSubjects() {
    try {
      for (const subj of DEFAULT_SUBJECTS) {
        const payload = {
          id: subj.id,
          name: subj.name,
          code: subj.code || null,
          professor: subj.professor || null,
          room: subj.room || null,
          color: subj.color,
        };
        const { error } = await supabase.from('subjects').upsert(payload);
        if (error) console.error('Supabase seedDefaultSubjects error:', error);
      }
    } catch (e) {
      console.warn('seedDefaultSubjects exception:', e);
    }
  },

  // Fetch All User Data from Supabase Cloud DB
  async fetchAllData() {
    try {
      await this.seedDefaultSubjects();

      const [subjRes, schedRes, todoRes, memoRes, ddayRes, logRes] = await Promise.all([
        supabase.from('subjects').select('*'),
        supabase.from('schedules').select('*'),
        supabase.from('todos').select('*'),
        supabase.from('memos').select('*'),
        supabase.from('ddays').select('*'),
        supabase.from('study_logs').select('*'),
      ]);

      if (subjRes.error) console.error('Supabase fetch subjects error:', subjRes.error);
      if (schedRes.error) console.error('Supabase fetch schedules error:', schedRes.error);
      if (todoRes.error) console.error('Supabase fetch todos error:', todoRes.error);
      if (memoRes.error) console.error('Supabase fetch memos error:', memoRes.error);
      if (ddayRes.error) console.error('Supabase fetch ddays error:', ddayRes.error);
      if (logRes.error) console.error('Supabase fetch study_logs error:', logRes.error);

      return {
        subjects: (subjRes.data as Subject[]) || null,
        schedules: (schedRes.data as ScheduleEvent[]) || null,
        todos: (todoRes.data as TodoItem[]) || null,
        memos: (memoRes.data as MemoNode[]) || null,
        ddays: (ddayRes.data as DDayItem[]) || null,
        studyLogs: (logRes.data as StudySessionLog[]) || null,
      };
    } catch (e) {
      console.warn('Supabase fetchAllData exception:', e);
      return null;
    }
  },

  // Save / Sync Actions
  async saveTodo(todo: TodoItem, userId?: string) {
    try {
      const payload = {
        id: todo.id,
        user_id: userId || null,
        subject_id: todo.subjectId || null,
        title: todo.title,
        due_date: todo.dueDate || null,
        due_time: todo.dueTime || null,
        completed: todo.completed,
        priority: todo.priority,
        memo_id: todo.memoId || null,
        estimated_minutes: todo.estimatedMinutes || 60,
        actual_study_seconds: todo.actualStudySeconds || 0,
      };
      const { data, error } = await supabase.from('todos').upsert(payload).select();
      if (error) {
        console.error('❌ Supabase saveTodo Error:', error);
        alert(`Supabase 저장 오류 [todos]: ${error.message} (${error.code})`);
      } else {
        console.log('✅ Supabase saveTodo Success:', data);
      }
    } catch (e) {
      console.warn('Supabase saveTodo exception:', e);
    }
  },

  async deleteTodo(id: string) {
    try {
      const { error } = await supabase.from('todos').delete().eq('id', id);
      if (error) console.error('Supabase deleteTodo error:', error);
    } catch (e) {
      console.warn('Supabase deleteTodo exception:', e);
    }
  },

  async saveSchedule(schedule: ScheduleEvent, userId?: string) {
    try {
      const payload = {
        id: schedule.id,
        user_id: userId || null,
        subject_id: schedule.subjectId || null,
        title: schedule.title,
        date: schedule.date,
        start_time: schedule.startTime || null,
        end_time: schedule.endTime || null,
        is_fixed_class: schedule.isFixedClass,
        location: schedule.location || null,
        todo_id: schedule.todoId || null,
        memo_id: schedule.memoId || null,
      };
      const { data, error } = await supabase.from('schedules').upsert(payload).select();
      if (error) {
        console.error('❌ Supabase saveSchedule Error:', error);
        alert(`Supabase 저장 오류 [schedules]: ${error.message} (${error.code})`);
      } else {
        console.log('✅ Supabase saveSchedule Success:', data);
      }
    } catch (e) {
      console.warn('Supabase saveSchedule exception:', e);
    }
  },

  async deleteSchedule(id: string) {
    try {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (error) console.error('Supabase deleteSchedule error:', error);
    } catch (e) {
      console.warn('Supabase deleteSchedule exception:', e);
    }
  },

  async saveMemo(memo: MemoNode, userId?: string) {
    try {
      const payload = {
        id: memo.id,
        user_id: userId || null,
        subject_id: memo.subjectId || null,
        title: memo.title,
        content: memo.content,
        tags: memo.tags,
        linked_schedule_id: memo.linkedScheduleId || null,
        linked_todo_id: memo.linkedTodoId || null,
        updated_at: new Date().toISOString(),
      };
      const { data, error } = await supabase.from('memos').upsert(payload).select();
      if (error) {
        console.error('❌ Supabase saveMemo Error:', error);
        alert(`Supabase 저장 오류 [memos]: ${error.message} (${error.code})`);
      } else {
        console.log('✅ Supabase saveMemo Success:', data);
      }
    } catch (e) {
      console.warn('Supabase saveMemo exception:', e);
    }
  },

  async deleteMemo(id: string) {
    try {
      const { error } = await supabase.from('memos').delete().eq('id', id);
      if (error) console.error('Supabase deleteMemo error:', error);
    } catch (e) {
      console.warn('Supabase deleteMemo exception:', e);
    }
  },

  async saveDDay(dday: DDayItem, userId?: string) {
    try {
      const payload = {
        id: dday.id,
        user_id: userId || null,
        subject_id: dday.subjectId || null,
        title: dday.title,
        target_date: dday.targetDate,
      };
      const { error } = await supabase.from('ddays').upsert(payload);
      if (error) console.error('Supabase saveDDay error:', error);
    } catch (e) {
      console.warn('Supabase saveDDay exception:', e);
    }
  },

  async deleteDDay(id: string) {
    try {
      const { error } = await supabase.from('ddays').delete().eq('id', id);
      if (error) console.error('Supabase deleteDDay error:', error);
    } catch (e) {
      console.warn('Supabase deleteDDay exception:', e);
    }
  },

  async saveStudyLog(log: StudySessionLog, userId?: string) {
    try {
      const payload = {
        id: log.id,
        user_id: userId || null,
        subject_id: log.subjectId,
        todo_id: log.todoId || null,
        date: log.date,
        duration_seconds: log.durationSeconds,
        mode: log.mode,
      };
      const { error } = await supabase.from('study_logs').upsert(payload);
      if (error) console.error('Supabase saveStudyLog error:', error);
    } catch (e) {
      console.warn('Supabase saveStudyLog exception:', e);
    }
  },
};
