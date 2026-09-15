import React from 'react';
import { ShieldCheck, Sun, Moon, Zap, Layers, Image, Type, Lock, PenTool, FileText, FileCode } from 'lucide-react';

export default function Header({ theme, onToggleTheme, activeTool, onSelectTool }) {
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
            padding: '0.45rem 0.8rem',
            borderRadius: '9999px',
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 8px rgba(15, 23, 42, 0.15)'
          }}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
        >
          {isDark ? (
            <>
              <Sun size={15} color="#f59e0b" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#2563eb" />
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
        All-in-One PDF Tool Suite
      </h1>
      
      <p style={{
        fontSize: '1rem',
        color: 'var(--text-muted)',
        maxWidth: '580px',
        margin: '0 auto 1.5rem auto'
      }}>
        Compress, merge, convert Word/Text/Images to PDF, watermark, sign, or encrypt 100% free & privately.
      </p>

      {/* Tool Navigation Tabs */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
        padding: '0.35rem',
        borderRadius: 'var(--radius-md)',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <button
          type="button"
          onClick={() => onSelectTool('compressor')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'compressor' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'compressor' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <Zap size={14} />
          <span>Compressor</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('merger')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'merger' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'merger' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <Layers size={14} />
          <span>Merger & Organizer</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('doc_to_pdf')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'doc_to_pdf' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'doc_to_pdf' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <FileText size={14} />
          <span>Word / Text to PDF</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('pdf_to_doc')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'pdf_to_doc' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'pdf_to_doc' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <FileCode size={14} />
          <span>PDF to Word</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('image_to_pdf')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'image_to_pdf' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'image_to_pdf' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <Image size={14} />
          <span>Images to PDF</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('sign')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'sign' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'sign' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <PenTool size={14} />
          <span>Digital Sign</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('watermark')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'watermark' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'watermark' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <Type size={14} />
          <span>Watermark</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectTool('protect')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            padding: '0.5rem 0.8rem',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            fontFamily: 'Outfit, sans-serif',
            fontWeight: '600',
            fontSize: '0.84rem',
            cursor: 'pointer',
            background: activeTool === 'protect' ? 'var(--gradient-button)' : 'transparent',
            color: activeTool === 'protect' ? '#ffffff' : 'var(--text-muted)',
            transition: 'all 0.2s ease'
          }}
        >
          <Lock size={14} />
          <span>Security</span>
        </button>
      </div>
    </header>
  );
}
