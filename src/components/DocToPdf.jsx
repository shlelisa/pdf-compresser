import React, { useState, useRef } from 'react';
import { FileText, Download, RefreshCw, File, AlertCircle } from 'lucide-react';
import { convertDocToPdf } from '../utils/docToPdf';
import { formatBytes } from '../utils/pdfCompressor';

export default function DocToPdf() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      const name = selected.name.toLowerCase();
      const allowedExts = ['.docx', '.txt', '.md', '.html', '.htm', '.json', '.csv', '.log', '.xml', '.css', '.js'];
      const hasValidExt = allowedExts.some((ext) => name.endsWith(ext));
      
      if (hasValidExt) {
        setFile(selected);
        setErrorMessage('');
      } else {
        setErrorMessage('Supported files: Word (.docx), Text (.txt), Markdown (.md), HTML (.html), JSON, CSV, Log, and code files.');
      }
      e.target.value = null;
    }
  };

  const handleConvert = async () => {
    if (!file || isConverting) return;

    setIsConverting(true);
    setErrorMessage('');
    try {
      const pdfBlob = await convertDocToPdf(file, {}, (pct, msg) => setProgressMsg(msg));

      // Trigger automatic download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.[^/.]+$/, '');
      link.download = `${originalName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to convert document to PDF:', err);
      setErrorMessage(err.message || 'Failed to convert document to PDF.');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <div>
      {/* Upload Box */}
      <div
        className="glass-panel"
        style={{
          padding: '2.5rem 1.5rem',
          textAlign: 'center',
          border: '2px dashed var(--border-color)',
          borderRadius: 'var(--radius-xl)',
          marginBottom: '1.5rem',
          cursor: 'pointer'
        }}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".docx,.txt,.md,.html,.htm,.json,.csv,.log,.xml,.css,.js"
          style={{ display: 'none' }}
        />
        <div style={{
          width: '60px',
          height: '60px',
          borderRadius: '16px',
          background: 'var(--gradient-button)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem'
        }}>
          <FileText size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {file ? file.name : 'Select Word (.docx), Text (.txt), Markdown (.md), HTML or Data File'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {file ? `File size: ${formatBytes(file.size)}` : 'Convert Word documents, text files, Markdown, HTML, and code/logs into clean A4 PDFs.'}
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <File size={18} />
          <span>{file ? 'Change Document File' : 'Select Document File'}</span>
        </button>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div style={{
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          color: 'var(--accent-rose)',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Document Information & Convert CTA */}
      {file && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, marginBottom: '0.2rem' }}>
                Ready to Convert
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Format: <span className="badge badge-indigo" style={{ textTransform: 'uppercase' }}>{file.name.split('.').pop()}</span> — Size: {formatBytes(file.size)}
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={isConverting}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Download size={18} />
              <span>{isConverting ? 'Converting to PDF...' : 'Convert to PDF & Download'}</span>
            </button>
          </div>

          {isConverting && (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '1rem', textAlign: 'center' }}>
              <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '0.4rem' }} />
              {progressMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
