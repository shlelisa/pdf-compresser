import React, { useState, useEffect } from 'react';
import JSZip from 'jszip';
import Header from './components/Header';
import FileUploader from './components/FileUploader';
import CompressionControls from './components/CompressionControls';
import FileQueue from './components/FileQueue';
import StatsSummary from './components/StatsSummary';
import PreviewModal from './components/PreviewModal';
import { compressPdfFile } from './utils/pdfCompressor';
import { Play, RotateCcw } from 'lucide-react';

export default function App() {
  const [files, setFiles] = useState([]);
  const [isCompressingAll, setIsCompressingAll] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);

  // Theme State (Dark / Light)
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pdf_theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pdf_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const [options, setOptions] = useState({
    mode: 'target_size', // Default to 'Fit Under 1 MB' cap mode
    targetDpi: 180,
    jpegQuality: 0.78,
    colorMode: 'color',
    stripMetadata: true,
    targetSizeMB: 1
  });

  const handleFilesAdded = (newFiles) => {
    const queueItems = newFiles.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file: file,
      status: 'pending',
      progress: 0,
      progressMsg: '',
      result: null
    }));

    setFiles((prev) => [...prev, ...queueItems]);
  };

  const handleRemoveFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleClearAll = () => {
    setFiles([]);
  };

  const handleCompressAll = async () => {
    if (files.length === 0 || isCompressingAll) return;

    setIsCompressingAll(true);
    const pendingFiles = files.filter((f) => f.status === 'pending' || f.status === 'error' || f.status === 'completed');

    for (const item of pendingFiles) {
      setFiles((prev) =>
        prev.map((f) =>
          f.id === item.id ? { ...f, status: 'compressing', progress: 0, progressMsg: 'Reading document...' } : f
        )
      );

      try {
        const result = await compressPdfFile(
          item.file,
          options,
          (percent, msg) => {
            setFiles((prev) =>
              prev.map((f) =>
                f.id === item.id ? { ...f, progress: percent, progressMsg: msg } : f
              )
            );
          }
        );

        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'completed', progress: 100, result } : f
          )
        );
      } catch (err) {
        console.error(`Failed to compress ${item.file.name}:`, err);
        setFiles((prev) =>
          prev.map((f) =>
            f.id === item.id ? { ...f, status: 'error', progressMsg: err.message || 'Compression failed' } : f
          )
        );
      }
    }

    setIsCompressingAll(false);
  };

  const handleDownloadFile = (item) => {
    if (!item.result || !item.result.blob) return;
    const url = URL.createObjectURL(item.result.blob);
    const link = document.createElement('a');
    link.href = url;
    const originalName = item.file.name.replace(/\.pdf$/i, '');
    link.download = `${originalName}_compressed.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAllZip = async () => {
    const completedFiles = files.filter((f) => f.status === 'completed');
    if (completedFiles.length === 0) return;

    const zip = new JSZip();
    completedFiles.forEach((item) => {
      const originalName = item.file.name.replace(/\.pdf$/i, '');
      zip.file(`${originalName}_compressed.pdf`, item.result.blob);
    });

    const zipBlob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `pdf_compressed_${Date.now()}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-layout" style={{ maxWidth: '860px' }}>
      {/* Header with Theme Toggle */}
      <Header theme={theme} onToggleTheme={toggleTheme} />

      {/* Upload Zone */}
      <FileUploader onFilesAdded={handleFilesAdded} />

      {/* Preset Compression Levels */}
      <CompressionControls options={options} onChangeOptions={setOptions} />

      {/* Primary Action Button */}
      {files.length > 0 && (
        <div style={{ display: 'flex', gap: '0.85rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-primary"
            onClick={handleCompressAll}
            disabled={isCompressingAll}
            style={{ flex: '1 1 220px', padding: '0.9rem 1.5rem', fontSize: '1.05rem' }}
          >
            <Play size={20} fill="#ffffff" />
            <span>{isCompressingAll ? 'Compressing...' : `Compress PDF ${files.length > 1 ? `(${files.length})` : ''}`}</span>
          </button>

          <button
            className="btn btn-secondary"
            onClick={handleClearAll}
            disabled={isCompressingAll}
          >
            <RotateCcw size={16} />
            <span>Clear</span>
          </button>
        </div>
      )}

      {/* File Queue & Results */}
      <FileQueue
        files={files}
        onRemoveFile={handleRemoveFile}
        onDownloadFile={handleDownloadFile}
        onOpenPreview={(item) => setPreviewItem(item)}
        isCompressingAll={isCompressingAll}
      />

      {/* Batch Summary */}
      <StatsSummary files={files} onDownloadAllZip={handleDownloadAllZip} />

      {/* Preview Modal */}
      {previewItem && (
        <PreviewModal
          item={previewItem}
          options={options}
          onClose={() => setPreviewItem(null)}
        />
      )}
    </div>
  );
}
