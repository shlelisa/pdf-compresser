import React, { useState, useRef } from 'react';
import { FileText, Download, RefreshCw, FileCode, AlertCircle, CheckCircle2 } from 'lucide-react';
import { convertPdfToDocx } from '../utils/pdfToDoc';
import { formatBytes } from '../utils/pdfCompressor';

export default function PdfToDoc() {
  const [file, setFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.name.toLowerCase().endsWith('.pdf')) {
        setFile(selected);
        setErrorMessage('');
        setSuccess(false);
      } else {
        setErrorMessage('Please select a valid PDF file (.pdf).');
      }
      e.target.value = null;
    }
  };

  const handleConvert = async () => {
    if (!file || isConverting) return;

    setIsConverting(true);
    setErrorMessage('');
    setSuccess(false);

    try {
      const docBlob = await convertPdfToDocx(file, (pct, msg) => setProgressMsg(msg));

      // Trigger download
      const url = URL.createObjectURL(docBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, '');
      link.download = `${originalName}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);

      setSuccess(true);
    } catch (err) {
      console.error('Failed to convert PDF to Word:', err);
      setErrorMessage(err.message || 'Failed to extract text and convert PDF to Word document.');
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
          accept=".pdf"
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
          <FileCode size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {file ? file.name : 'Select PDF File to Convert to Word (.docx)'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {file ? `File size: ${formatBytes(file.size)}` : 'Extract text, paragraphs, and structure from PDF into an editable Word (.docx) document.'}
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <FileText size={18} />
          <span>{file ? 'Change PDF File' : 'Select PDF File'}</span>
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

      {/* Success Notification */}
      {success && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: 'var(--accent-emerald)',
          padding: '0.85rem 1.1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={18} />
          <span>Word document (.docx) successfully generated and downloaded!</span>
        </div>
      )}

      {/* File Info & Action CTA */}
      {file && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0, marginBottom: '0.2rem' }}>
                PDF to Word (.docx) Conversion
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                Input: <span className="badge badge-indigo">PDF</span> — Size: {formatBytes(file.size)}
              </p>
            </div>

            <button
              className="btn btn-primary"
              onClick={handleConvert}
              disabled={isConverting}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Download size={18} />
              <span>{isConverting ? 'Converting to Word...' : 'Convert PDF to Word (.docx)'}</span>
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
