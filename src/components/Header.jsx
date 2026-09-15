import React from 'react';
import { ShieldCheck, Sun, Moon } from 'lucide-react';

export default function Header({ theme, onToggleTheme }) {
  const isDark = theme === 'dark';

  return (
    <header style={{ position: 'relative', textAlign: 'center', marginBottom: '2rem', paddingTop: '1rem' }}>
      {/* Theme Toggle Button */}
      <div style={{ position: 'absolute', top: '0.5rem', right: '0' }}>
        <button
          type="button"
          onClick={onToggleTheme}
          className="btn btn-secondary"
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '9999px',
            fontSize: '0.85rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)'
          }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? (
            <>
              <Sun size={16} color="#f59e0b" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={16} color="#2563eb" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.35rem 0.85rem',
        borderRadius: '9999px',
        background: 'rgba(59, 130, 246, 0.12)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        color: 'var(--accent-primary)',
        fontSize: '0.82rem',
        fontWeight: '500',
        marginBottom: '1rem'
      }}>
        <ShieldCheck size={14} />
        <span>100% Private — Processing stays in your browser</span>
      </div>

      <h1 style={{
        fontSize: '2.25rem',
        fontWeight: '800',
        color: 'var(--text-main)',
        letterSpacing: '-0.03em',
        marginBottom: '0.5rem'
      }}>
        Compress PDF Files
      </h1>

      <p style={{
        fontSize: '1rem',
        color: 'var(--text-muted)',
        maxWidth: '520px',
        margin: '0 auto'
      }}>
        Choose your compression level to reduce PDF size while maintaining quality.
      </p>
    </header>
  );
}
