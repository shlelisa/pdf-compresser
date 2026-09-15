import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Eye, Sparkles, RefreshCw } from 'lucide-react';
import { generatePagePreviews } from '../utils/pdfCompressor';

export default function PreviewModal({ item, options, onClose }) {
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [originalUrl, setOriginalUrl] = useState(null);
  const [compressedUrl, setCompressedUrl] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(100);

  useEffect(() => {
    let isMounted = true;
    if (!item || !item.file) return;

    const loadPreview = async () => {
      setIsLoading(true);
      try {
        const { totalPages: total, originalUrl: orig, compressedUrl: comp } = await generatePagePreviews(
          item.file,
          currentPage,
          {
            dpi: options.targetDpi || 120,
            quality: options.jpegQuality || 0.7,
            colorMode: options.colorMode || 'color'
          }
        );
        if (isMounted) {
          setTotalPages(total);
          setOriginalUrl(orig);
          setCompressedUrl(comp);
        }
      } catch (err) {
        console.error('Failed to generate page preview:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadPreview();

    return () => {
      isMounted = false;
    };
  }, [item, currentPage, options.targetDpi, options.jpegQuality, options.colorMode]);

  if (!item) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 8, 15, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem'
    }}>
      <div className="glass-panel" style={{
        width: '100%',
        maxWidth: '1100px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
      }}>
        {/* Header */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.2)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Eye size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', color: '#ffffff', margin: 0 }}>
              Visual Quality Preview — {item.file.name}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="btn btn-secondary"
            style={{ padding: '0.4rem', borderRadius: '50%' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Toolbar: Page Navigation & Zoom Controls */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: 'rgba(255, 255, 255, 0.03)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          {/* Page navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              disabled={currentPage <= 1 || isLoading}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ fontSize: '0.88rem', color: 'var(--text-muted)' }}>
              Page <strong style={{ color: '#ffffff' }}>{currentPage}</strong> of {totalPages}
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              disabled={currentPage >= totalPages || isLoading}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Settings info badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
            <span className="badge badge-indigo">
              {options.targetDpi || 120} DPI
            </span>
            <span className="badge badge-cyan">
              {Math.round((options.jpegQuality || 0.7) * 100)}% Quality
            </span>
            <span className="badge badge-emerald">
              Mode: {options.colorMode || 'color'}
            </span>
          </div>

          {/* Zoom controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              onClick={() => setZoomLevel((z) => Math.max(50, z - 25))}
            >
              <ZoomOut size={16} />
            </button>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)', minWidth: '45px', textAlign: 'center' }}>
              {zoomLevel}%
            </span>
            <button
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.6rem' }}
              onClick={() => setZoomLevel((z) => Math.min(200, z + 25))}
            >
              <ZoomIn size={16} />
            </button>
          </div>
        </div>

        {/* Side by side comparison view */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '1.5rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: '1.5rem',
          alignItems: 'start'
        }}>
          {/* Original View */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.4)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              Original Uncompressed Page
            </div>
            {isLoading ? (
              <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-subtle)' }}>
                <RefreshCw size={28} className="animate-spin" />
              </div>
            ) : (
              <div style={{ overflow: 'auto', maxHeight: '500px', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={originalUrl}
                  alt="Original PDF page"
                  style={{
                    maxWidth: '100%',
                    width: `${zoomLevel}%`,
                    height: 'auto',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </div>
            )}
          </div>

          {/* Compressed View */}
          <div style={{
            background: 'rgba(99, 102, 241, 0.05)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            textAlign: 'center'
          }}>
            <div style={{ fontWeight: '600', color: 'var(--accent-primary)', fontSize: '0.9rem', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
              <Sparkles size={16} /> Compressed Output Preview
            </div>
            {isLoading ? (
              <div style={{ height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-primary)' }}>
                <RefreshCw size={28} className="animate-spin" />
              </div>
            ) : (
              <div style={{ overflow: 'auto', maxHeight: '500px', display: 'flex', justifyContent: 'center' }}>
                <img
                  src={compressedUrl}
                  alt="Compressed PDF page"
                  style={{
                    maxWidth: '100%',
                    width: `${zoomLevel}%`,
                    height: 'auto',
                    borderRadius: '4px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)'
                  }}
                />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(0, 0, 0, 0.2)',
          display: 'flex',
          justify: 'flex-end'
        }}>
          <button className="btn btn-secondary" onClick={onClose}>
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
}
