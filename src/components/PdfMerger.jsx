import React, { useState, useRef } from 'react';
import { UploadCloud, RotateCw, Trash2, ArrowLeft, ArrowRight, Download, Layers, RefreshCw, FilePlus } from 'lucide-react';
import { extractAllPdfPages, mergePdfPages } from '../utils/pdfMerger';

export default function PdfMerger() {
  const [pages, setPages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [isMerging, setIsMerging] = useState(false);
  const [mergeProgressMsg, setMergeProgressMsg] = useState('');
  const [mergedBlob, setMergedBlob] = useState(null);
  const fileInputRef = useRef(null);

  const handleFilesSelected = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files).filter(
      (f) => f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    );
    e.target.value = null;

    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const extractedPages = await extractAllPdfPages(selectedFiles, (pct, msg) => setLoadingMsg(msg));
      setPages((prev) => [...prev, ...extractedPages]);
    } catch (err) {
      console.error('Failed to load PDF pages:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotatePage = (id) => {
    setPages((prev) =>
      prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p))
    );
  };

  const handleDeletePage = (id) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
  };

  const handleMovePage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= pages.length) return;

    setPages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleMergePdf = async () => {
    if (pages.length === 0 || isMerging) return;

    setIsMerging(true);
    setMergedBlob(null);

    try {
      const blob = await mergePdfPages(pages, {}, (pct, msg) => setMergeProgressMsg(msg));
      setMergedBlob(blob);

      // Auto-trigger download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `merged_document_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to merge PDFs:', err);
    } finally {
      setIsMerging(false);
    }
  };

  const handleClear = () => {
    setPages([]);
    setMergedBlob(null);
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
          onChange={handleFilesSelected}
          accept="application/pdf"
          multiple
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
          <FilePlus size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          Add PDFs to Merge & Organize
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Select multiple PDF files to combine, reorder, rotate, or remove pages.
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <Layers size={18} />
          <span>Select PDF Files</span>
        </button>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <RefreshCw size={24} className="animate-spin" color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>{loadingMsg}</div>
        </div>
      )}

      {/* Page Organizer Workspace */}
      {pages.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
                Organize Pages ({pages.length} {pages.length === 1 ? 'page' : 'pages'})
              </h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                Use arrows to reorder, rotate button to adjust orientation, or trash icon to delete pages.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleMergePdf}
                disabled={isMerging}
              >
                <Download size={18} />
                <span>{isMerging ? 'Merging...' : 'Merge & Download PDF'}</span>
              </button>
              <button className="btn btn-secondary" onClick={handleClear} disabled={isMerging}>
                Clear All
              </button>
            </div>
          </div>

          {/* Progress message during merge */}
          {isMerging && (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '1rem', textAlign: 'center' }}>
              <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '0.4rem' }} />
              {mergeProgressMsg}
            </div>
          )}

          {/* Grid of Page Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            {pages.map((p, idx) => (
              <div
                key={p.id}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  position: 'relative'
                }}
              >
                {/* File source badge */}
                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  marginBottom: '0.4rem'
                }}>
                  {p.fileName}
                </div>

                {/* Page thumbnail canvas preview with CSS rotation */}
                <div style={{
                  width: '100%',
                  height: '150px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  borderRadius: '4px',
                  background: '#ffffff',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                  marginBottom: '0.5rem'
                }}>
                  <img
                    src={p.dataUrl}
                    alt={`Page ${p.pageNum}`}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      transform: `rotate(${p.rotation}deg)`,
                      transition: 'transform 0.25s ease'
                    }}
                  />
                </div>

                {/* Page label */}
                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Page {idx + 1}
                </div>

                {/* Page Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleMovePage(idx, -1)}
                    disabled={idx === 0}
                    title="Move Left"
                  >
                    <ArrowLeft size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleRotatePage(p.id)}
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleMovePage(idx, 1)}
                    disabled={idx === pages.length - 1}
                    title="Move Right"
                  >
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleDeletePage(p.id)}
                    title="Delete Page"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
