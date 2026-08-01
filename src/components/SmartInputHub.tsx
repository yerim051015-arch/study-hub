import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, CheckSquare, FileText, Timer, ArrowRight, CheckCircle2, HelpCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { parseNaturalLanguage } from '../utils/nlpParser';
import type { SmartParseResult } from '../types';

export const SmartInputHub: React.FC = () => {
  const { subjects, executeSmartCreate, setActiveTab } = useApp();
  const [inputText, setInputText] = useState('8월 5일 오후 3시에 경영학원론 3장 과제 제출');
  const [parseResult, setParseResult] = useState<SmartParseResult>(() =>
    parseNaturalLanguage('8월 5일 오후 3시에 경영학원론 3장 과제 제출', subjects)
  );
  const [justCreated, setJustCreated] = useState<boolean>(false);

  // Update live preview when input changes
  useEffect(() => {
    const result = parseNaturalLanguage(inputText, subjects);
    setParseResult(result);
  }, [inputText, subjects]);

  const handleCreate = () => {
    if (!inputText.trim()) return;
    executeSmartCreate(parseResult);
    setJustCreated(true);
    setTimeout(() => setJustCreated(false), 3000);
  };

  const sampleInputs = [
    '8월 5일 오후 3시에 경영학원론 3장 과제 제출',
    '오늘 저녁 8시 컴프로 팀플 회의 준비하기',
    '내일 오후 2시 마케팅원론 사례 연구 작성',
    '8월 12일 14:00 영어회화 스피킹 연습',
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Banner Intro */}
      <div className="glass-panel" style={{ padding: '2rem', background: '#ffffff', border: '2px solid #111111' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <div style={{ padding: '0.5rem', background: '#111111', color: 'white', borderRadius: '8px' }}>
            <Sparkles size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 900, color: '#111111' }}>⚡ 원스톱 스마트 입력 Hub</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', fontWeight: 600 }}>
              자연어 한 줄 작성으로 <strong>캘린더, 투두, 메모 노드, 타이머</strong> 4대 핵심 도구가 한 번에 유기적으로 연동됩니다.
            </p>
          </div>
        </div>

        {/* Big Input Bar */}
        <div style={{ marginTop: '1.5rem', position: 'relative' }}>
          <input
            type="text"
            className="input-field"
            style={{
              padding: '1.1rem 1.5rem 1.1rem 3.2rem',
              fontSize: '1.15rem',
              borderRadius: '16px',
              border: '2px solid var(--border-glow)',
              background: 'var(--bg-card-solid)',
            }}
            placeholder="예: 8월 5일 오후 3시에 경영학원론 3장 과제 제출"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
            }}
          />
          <Sparkles
            size={22}
            color="var(--color-primary)"
            style={{ position: 'absolute', left: '1.1rem', top: '50%', transform: 'translateY(-50%)' }}
          />

          <button
            className="btn-primary"
            style={{
              position: 'absolute',
              right: '0.6rem',
              top: '50%',
              transform: 'translateY(-50%)',
              padding: '0.7rem 1.4rem',
              borderRadius: '12px',
            }}
            onClick={handleCreate}
          >
            <span>✨ 1초 만에 원스톱 자동 등록</span>
          </button>
        </div>

        {/* Preset Sample Quick Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-subdued)', fontWeight: 600 }}>💡 추천 입력 예시:</span>
          {sampleInputs.map((sample, idx) => (
            <button
              key={idx}
              style={{
                fontSize: '0.78rem',
                padding: '0.3rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid var(--border-color)',
                background: 'var(--bg-card-solid)',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onClick={() => setInputText(sample)}
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* Success Banner */}
      {justCreated && (
        <div
          className="animate-fade-in"
          style={{
            padding: '1rem 1.5rem',
            borderRadius: '14px',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '1px solid rgba(52, 211, 153, 0.4)',
            color: '#34d399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <CheckCircle2 size={22} />
            <div>
              <strong style={{ fontSize: '1rem' }}>성공적으로 4개 모듈에 동시 연동되었습니다!</strong>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', opacity: 0.9 }}>
                캘린더 일정, 투두 체크박스, 스마트 마크다운 메모 및 타이머 링크가 생성되었습니다.
              </p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }} onClick={() => setActiveTab('calendar')}>
              📅 캘린더 보기
            </button>
            <button className="btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.82rem' }} onClick={() => setActiveTab('memo')}>
              📝 메모 보기
            </button>
          </div>
        </div>
      )}

      {/* Live Parser Analysis & Automation Preview Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
        {/* Real-time Recognition Analysis Card */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <HelpCircle size={18} color="var(--color-secondary)" />
            <span>AI / NLP 인식 분석 결과</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'var(--bg-input)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>📅 인식된 날짜 / 시간</span>
              <strong style={{ fontSize: '0.9rem', color: 'var(--color-primary)' }}>
                {parseResult.date || '오늘'} {parseResult.time || '19:00'}
              </strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'var(--bg-input)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>🎓 분류된 과목</span>
              {parseResult.subjectName ? (
                <span className={`subject-badge subj-bg-${subjects.find(s => s.id === parseResult.subjectId)?.color || 'violet'}`}>
                  {parseResult.subjectName}
                </span>
              ) : (
                <span style={{ fontSize: '0.88rem', color: 'var(--text-subdued)' }}>기본 (일반 학습)</span>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'var(--bg-input)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>📋 정제된 목표 제목</span>
              <strong style={{ fontSize: '0.9rem' }}>{parseResult.title || '입력 필요'}</strong>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0.8rem', borderRadius: '10px', background: 'var(--bg-input)' }}>
              <span style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>🎯 분석 신뢰도</span>
              <span style={{ fontSize: '0.88rem', fontWeight: 700, color: parseResult.confidence > 0.5 ? '#34d399' : '#fbbf24' }}>
                {Math.round(parseResult.confidence * 100)}%
              </span>
            </div>
          </div>
        </div>

        {/* 4-in-1 Automatic Linking Workflow Preview */}
        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ArrowRight size={18} color="var(--color-primary)" />
            <span>자동 생성이 일어나는 4대 도구</span>
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(96, 165, 250, 0.1)', border: '1px solid rgba(96, 165, 250, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#60a5fa', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <Calendar size={15} />
                <span>1. 캘린더 (Calendar)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {parseResult.date} {parseResult.time} 타임슬롯에 시각적 일정 블록 생성
              </p>
            </div>

            <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(52, 211, 153, 0.1)', border: '1px solid rgba(52, 211, 153, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#34d399', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <CheckSquare size={15} />
                <span>2. 투두 (Todo)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                우선순위 상 체크박스 생성 및 마감 기한 설정
              </p>
            </div>

            <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#a78bfa', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <FileText size={15} />
                <span>3. 메모 (Memo)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                과목 폴더에 마크다운 스마트 노트 템플릿 자동 생성
              </p>
            </div>

            <div style={{ padding: '0.8rem', borderRadius: '12px', background: 'rgba(251, 191, 36, 0.1)', border: '1px solid rgba(251, 191, 36, 0.25)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                <Timer size={15} />
                <span>4. 타이머 (Timer)</span>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                해당 투두/일정 1클릭 뽀모도로 타이머 시작 퀵 버튼 링크
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
