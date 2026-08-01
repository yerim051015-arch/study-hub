import React, { useState } from 'react';
import { Folder, Plus, Trash2, Eye, Edit3, Tag, Clock, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MemoEditor: React.FC = () => {
  const {
    memos,
    subjects,
    selectedMemoId,
    setSelectedMemoId,
    addMemo,
    updateMemo,
    deleteMemo,
    setActiveTab,
  } = useApp();

  const [activeFolderSubjectId, setActiveFolderSubjectId] = useState<string | 'all'>('all');
  const [isPreview, setIsPreview] = useState(false);

  const activeMemo = memos.find(m => m.id === selectedMemoId) || memos[0];

  const filteredMemos = memos.filter(m => {
    if (activeFolderSubjectId === 'all') return true;
    return m.subjectId === activeFolderSubjectId;
  });

  const handleCreateMemo = () => {
    const defaultSubject = subjects[0];
    const newId = addMemo({
      title: '새 강의 필기 노트',
      content: `# 📝 새 강의 필기 노트\n\n## 1. 핵심 개념 정리\n- 중요 개념 1\n- 중요 개념 2\n\n## 2. 시험 및 과제 체크포인트\n> 💡 교수님 강조 내용 작성\n`,
      subjectId: defaultSubject?.id,
      tags: [defaultSubject?.name || '학습'],
    });
    setSelectedMemoId(newId);
  };

  const renderSimpleMarkdown = (mdText: string) => {
    if (!mdText) return null;

    const lines = mdText.split('\n');
    return lines.map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx} style={{ fontSize: '1.6rem', fontWeight: 800, marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx} style={{ fontSize: '1.3rem', fontWeight: 700, marginTop: '0.8rem', marginBottom: '0.4rem' }}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx} style={{ fontSize: '1.1rem', fontWeight: 600, marginTop: '0.6rem', marginBottom: '0.3rem' }}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('> ')) {
        return (
          <blockquote key={idx} style={{ borderLeft: '4px solid var(--color-primary)', paddingLeft: '0.8rem', margin: '0.5rem 0', color: 'var(--text-muted)', fontStyle: 'italic', background: 'var(--bg-input)', padding: '0.5rem 0.8rem', borderRadius: '6px' }}>
            {line.replace('> ', '')}
          </blockquote>
        );
      }
      if (line.startsWith('- ')) {
        return <li key={idx} style={{ marginLeft: '1.2rem', marginBottom: '0.25rem' }}>{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '0.5rem' }} />;
      }
      return <p key={idx} style={{ marginBottom: '0.4rem', lineHeight: 1.6 }}>{line}</p>;
    });
  };

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '260px 320px 1fr', gap: '1.25rem', height: 'calc(100vh - 140px)', minHeight: '600px' }}>
      {/* 1. Subject Folder Hierarchy Column */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Folder size={18} color="var(--color-primary)" />
            <span>학기 과목 폴더</span>
          </h3>
          <button className="icon-btn" style={{ width: 28, height: 28 }} onClick={handleCreateMemo} title="새 노트 작성">
            <Plus size={16} />
          </button>
        </div>

        <div style={{ fontSize: '0.78rem', color: 'var(--text-subdued)', fontWeight: 700 }}>2026학년도 2학기</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto' }}>
          <button
            className={`btn-secondary ${activeFolderSubjectId === 'all' ? 'active-filter' : ''}`}
            style={{
              justifyContent: 'flex-start',
              padding: '0.5rem 0.75rem',
              fontSize: '0.85rem',
              background: activeFolderSubjectId === 'all' ? 'var(--color-primary-light)' : 'transparent',
              borderColor: activeFolderSubjectId === 'all' ? 'var(--color-primary)' : 'transparent',
            }}
            onClick={() => setActiveFolderSubjectId('all')}
          >
            <Folder size={16} color="var(--color-primary)" />
            <span>전체 노트 ({memos.length})</span>
          </button>

          {subjects.map(subj => {
            const count = memos.filter(m => m.subjectId === subj.id).length;
            return (
              <button
                key={subj.id}
                className="btn-secondary"
                style={{
                  justifyContent: 'flex-start',
                  padding: '0.5rem 0.75rem',
                  fontSize: '0.85rem',
                  background: activeFolderSubjectId === subj.id ? 'var(--color-primary-light)' : 'transparent',
                  borderColor: activeFolderSubjectId === subj.id ? 'var(--color-primary)' : 'transparent',
                }}
                onClick={() => setActiveFolderSubjectId(subj.id)}
              >
                <span className={`subject-badge subj-bg-${subj.color}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.72rem' }}>
                  {subj.name}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-subdued)', marginLeft: 'auto' }}>({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Memo List Column */}
      <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-muted)' }}>
          노트 목록 ({filteredMemos.length})
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1 }}>
          {filteredMemos.length === 0 ? (
            <p style={{ fontSize: '0.85rem', color: 'var(--text-subdued)', textAlign: 'center', marginTop: '2rem' }}>
              이 폴더에 생성된 노트가 없습니다.
            </p>
          ) : (
            filteredMemos.map(memo => {
              const isSelected = memo.id === selectedMemoId;
              const subj = subjects.find(s => s.id === memo.subjectId);

              return (
                <div
                  key={memo.id}
                  style={{
                    padding: '0.85rem',
                    borderRadius: '12px',
                    background: isSelected ? 'var(--color-primary-light)' : 'var(--bg-card-solid)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--border-color)',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onClick={() => setSelectedMemoId(memo.id)}
                >
                  {subj && (
                    <span className={`subject-badge subj-bg-${subj.color}`} style={{ marginBottom: '0.3rem' }}>
                      {subj.name}
                    </span>
                  )}
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 700, marginBottom: '0.3rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {memo.title}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.74rem', color: 'var(--text-subdued)' }}>
                    <Clock size={12} />
                    <span>{memo.updatedAt.split('T')[0]}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. Markdown Editor / Live Preview Column */}
      <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', background: 'var(--bg-card-solid)' }}>
        {activeMemo ? (
          <>
            {/* Note Editor Bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              <input
                type="text"
                value={activeMemo.title}
                onChange={(e) => updateMemo(activeMemo.id, { title: e.target.value })}
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: 'var(--text-main)',
                  width: '100%',
                }}
              />

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  className={`btn-secondary ${isPreview ? 'active' : ''}`}
                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                  onClick={() => setIsPreview(prev => !prev)}
                >
                  {isPreview ? <Edit3 size={14} /> : <Eye size={14} />}
                  <span>{isPreview ? '편집 모드' : '프리뷰'}</span>
                </button>

                <button
                  className="icon-btn"
                  style={{ width: 32, height: 32, color: '#f43f5e' }}
                  onClick={() => deleteMemo(activeMemo.id)}
                  title="노트 삭제"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>

            {/* Tags & Linked Links */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Tag size={14} color="var(--color-primary)" />
                {activeMemo.tags.join(', ')}
              </span>

              {activeMemo.linkedScheduleId && (
                <button
                  style={{ background: 'none', border: 'none', color: 'var(--color-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.78rem', fontWeight: 600 }}
                  onClick={() => setActiveTab('calendar')}
                >
                  <ExternalLink size={12} />
                  <span>연동 캘린더 보기</span>
                </button>
              )}
            </div>

            {/* Markdown Body */}
            {isPreview ? (
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', background: 'var(--bg-input)', borderRadius: '12px' }}>
                {renderSimpleMarkdown(activeMemo.content)}
              </div>
            ) : (
              <textarea
                value={activeMemo.content}
                onChange={(e) => updateMemo(activeMemo.id, { content: e.target.value })}
                placeholder="마크다운 양식으로 필기노트를 입력하세요..."
                style={{
                  flex: 1,
                  width: '100%',
                  padding: '1rem',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  background: 'var(--bg-input)',
                  color: 'var(--text-main)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.92rem',
                  lineHeight: 1.6,
                  resize: 'none',
                  outline: 'none',
                }}
              />
            )}
          </>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-subdued)' }}>
            선택된 노트가 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
