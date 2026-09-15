import React from 'react';
import { FileText, Download, Eye, Trash2, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { formatBytes } from '../utils/pdfCompressor';

export default function FileQueue({ files, onRemoveFile, onDownloadFile, onOpenPreview, isCompressingAll }) {
  if (files.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '0.5rem' }}>
        <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={20} color="var(--accent-primary)" />
          File Queue ({files.length} {files.length === 1 ? 'file' : 'files'})
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {files.map((item) => {
          const isDone = item.status === 'completed';
          const isProcessing = item.status === 'compressing';
          const isError = item.status === 'error';

          return (
            <div
              key={item.id}
              style={{
                background: 'rgba(255, 255, 255, 0.03)',
                border: isProcessing ? '1px solid var(--accent-primary)' : '1px solid rgba(255, 255, 255, 0.07)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem 1.2rem',
                transition: 'all 0.2s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
                {/* File info */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', minWidth: '220px', flex: '1 1 300px' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    {isDone ? (
                      <CheckCircle2 size={22} color="var(--accent-emerald)" />
                    ) : isError ? (
                      <AlertCircle size={22} color="var(--accent-rose)" />
                    ) : isProcessing ? (
                      <RefreshCw size={22} color="var(--accent-primary)" className="animate-spin" />
                    ) : (
                      <FileText size={22} color="var(--accent-primary)" />
                    )}
                  </div>

                  <div>
                    <div style={{ fontWeight: '600', color: '#ffffff', fontSize: '0.95rem', wordBreak: 'break-all' }}>
                      {item.file.name}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', gap: '0.8rem', marginTop: '0.15rem' }}>
                      <span>Original: {formatBytes(item.file.size)}</span>
                      {isDone && (
                        <>
                          <span>→</span>
                          <span style={{ color: 'var(--accent-emerald)', fontWeight: '600' }}>
                            Compressed: {formatBytes(item.result.compressedSize)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status Badge & Savings */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  {isDone && (
                    <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '0.3rem 0.7rem' }}>
                      -{item.result.savingsPercent}% Saved
                    </span>
                  )}
                  {isProcessing && (
                    <span className="badge badge-indigo">
                      Processing ({item.progress || 0}%)
                    </span>
                  )}
                  {isError && (
                    <span className="badge badge-rose" style={{ background: 'rgba(244, 63, 94, 0.15)', color: '#f43f5e', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
                      Failed
                    </span>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem 0.75rem', fontSize: '0.8rem' }}
                      title="Preview before/after quality"
                      onClick={() => onOpenPreview(item)}
                    >
                      <Eye size={16} />
                      <span>Preview</span>
                    </button>

                    {isDone && (
                      <button
                        className="btn btn-primary"
                        style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }}
                        onClick={() => onDownloadFile(item)}
                      >
                        <Download size={16} />
                        <span>Download</span>
                      </button>
                    )}

                    <button
                      className="btn btn-secondary"
                      style={{ padding: '0.45rem', opacity: isCompressingAll ? 0.4 : 0.8 }}
                      disabled={isCompressingAll}
                      onClick={() => onRemoveFile(item.id)}
                      title="Remove file"
                    >
                      <Trash2 size={16} color="var(--text-subtle)" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Progress bar line during compression */}
              {isProcessing && (
                <div style={{ marginTop: '0.8rem' }}>
                  <div style={{ height: '5px', background: 'rgba(255, 255, 255, 0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${item.progress || 5}%`,
                      background: 'var(--gradient-brand)',
                      transition: 'width 0.25s ease'
                    }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.3rem', textAlign: 'right' }}>
                    {item.progressMsg || 'Processing...'}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
