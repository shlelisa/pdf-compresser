import React from 'react';
import { PieChart, Download, Sparkles, Archive } from 'lucide-react';
import { formatBytes } from '../utils/pdfCompressor';

export default function StatsSummary({ files, onDownloadAllZip }) {
  const completedFiles = files.filter((f) => f.status === 'completed');
  if (completedFiles.length === 0) return null;

  const totalOriginal = completedFiles.reduce((acc, curr) => acc + curr.result.originalSize, 0);
  const totalCompressed = completedFiles.reduce((acc, curr) => acc + curr.result.compressedSize, 0);
  const totalSaved = Math.max(0, totalOriginal - totalCompressed);
  const overallSavingsPercent = totalOriginal > 0 ? Math.round((totalSaved / totalOriginal) * 100) : 0;

  return (
    <div className="glass-panel" style={{
      padding: '1.5rem',
      marginBottom: '2rem',
      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
      border: '1px solid rgba(99, 102, 241, 0.3)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
            <PieChart size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.15rem', color: '#ffffff', margin: 0 }}>Overall Batch Compression Summary</h3>
            <span className="badge badge-emerald" style={{ fontSize: '0.85rem', padding: '0.25rem 0.65rem' }}>
              <Sparkles size={14} /> -{overallSavingsPercent}% Overall Saved
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
            <div>
              Total Original: <strong style={{ color: '#ffffff' }}>{formatBytes(totalOriginal)}</strong>
            </div>
            <div>→</div>
            <div>
              Total Compressed: <strong style={{ color: 'var(--accent-emerald)' }}>{formatBytes(totalCompressed)}</strong>
            </div>
            <div>
              Space Saved: <strong style={{ color: 'var(--accent-cyan)' }}>{formatBytes(totalSaved)}</strong>
            </div>
          </div>
        </div>

        {completedFiles.length > 1 && (
          <button
            className="btn btn-primary"
            style={{ padding: '0.75rem 1.4rem' }}
            onClick={onDownloadAllZip}
          >
            <Archive size={18} />
            <span>Download All as ZIP</span>
          </button>
        )}
      </div>
    </div>
  );
}
