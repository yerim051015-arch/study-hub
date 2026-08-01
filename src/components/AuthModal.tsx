import React, { useState } from 'react';
import { LogIn, UserPlus, X, CheckCircle2, ShieldCheck } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('회원가입이 완료되었습니다! 로그인해 주세요.');
        setMode('signin');
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        setSuccessMsg('성공적으로 로그인되었습니다.');
        setTimeout(() => onClose(), 1000);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '인증 처리 중 오류가 발생했습니다.';
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1000,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{ maxWidth: '440px', width: '100%', padding: '2rem', background: 'var(--bg-card-solid)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="var(--color-primary)" />
            <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {mode === 'signin' ? 'UniSync 계정 로그인' : 'UniSync 회원가입'}
            </h3>
          </div>
          <button className="icon-btn" style={{ width: 32, height: 32 }} onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {errorMsg && (
          <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(244, 63, 94, 0.15)', border: '1px solid #f43f5e', color: '#f43f5e', fontSize: '0.85rem', marginBottom: '1rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ padding: '0.65rem 0.85rem', borderRadius: '10px', background: 'rgba(52, 211, 153, 0.15)', border: '1px solid #34d399', color: '#34d399', fontSize: '0.85rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>이메일 주소</label>
            <input
              type="email"
              className="input-field"
              placeholder="student@university.ac.kr"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem', display: 'block' }}>비밀번호</label>
            <input
              type="password"
              className="input-field"
              placeholder="6자 이상 비밀번호 입력"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '0.75rem', marginTop: '0.5rem', fontSize: '1rem' }} disabled={loading}>
            {mode === 'signin' ? <LogIn size={18} /> : <UserPlus size={18} />}
            <span>{loading ? '처리 중...' : mode === 'signin' ? '로그인' : '회원가입 완료'}</span>
          </button>
        </form>

        <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {mode === 'signin' ? (
            <p>
              계정이 없으신가요?{' '}
              <button style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => setMode('signup')}>
                회원가입하기
              </button>
            </p>
          ) : (
            <p>
              이미 계정이 있으신가요?{' '}
              <button style={{ color: 'var(--color-primary)', background: 'none', border: 'none', fontWeight: 700, cursor: 'pointer' }} onClick={() => setMode('signin')}>
                로그인하기
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
