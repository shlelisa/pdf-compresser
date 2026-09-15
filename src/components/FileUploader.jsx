import React, { useRef, useState } from 'react';
import { Upload, FileText, Plus } from 'lucide-react';

export default function FileUploader({ onFilesAdded }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFilesAdded(Array.from(e.target.files));
      e.target.value = null;
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const pdfFiles = Array.from(e.dataTransfer.files).filter(
        (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
      );
      if (pdfFiles.length > 0) {
        onFilesAdded(pdfFiles);
      }
    }
  };

  return (
    <div
      className="glass-panel"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        border: isDragOver ? '2px dashed var(--accent-primary)' : '2px dashed rgba(255, 255, 255, 0.14)',
        backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.08)' : 'rgba(18, 26, 44, 0.65)',
        borderRadius: 'var(--radius-xl)',
        cursor: 'pointer',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        marginBottom: '1.5rem',
        boxShadow: isDragOver ? '0 0 30px rgba(99, 102, 241, 0.25)' : 'none'
      }}
      onClick={() => fileInputRef.current?.click()}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="application/pdf"
        multiple
        style={{ display: 'none' }}
      />
      
      <div style={{
        width: '68px',
        height: '68px',
        borderRadius: '20px',
        background: 'var(--gradient-button)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.25rem',
        boxShadow: '0 8px 25px rgba(99, 102, 241, 0.35)'
      }}>
        <Upload size={30} color="#ffffff" />
      </div>

      <h2 style={{ fontSize: '1.35rem', color: '#ffffff', marginBottom: '0.5rem', fontWeight: '700' }}>
        Select PDF files
      </h2>
      <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', margin: '0 auto 1.25rem auto' }}>
        or drag and drop PDFs here
      </p>

      <button
        type="button"
        className="btn btn-primary"
        style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}
        onClick={(e) => {
          e.stopPropagation();
          fileInputRef.current?.click();
        }}
      >
        <Plus size={18} />
        <span>Choose Files</span>
      </button>
    </div>
  );
}
