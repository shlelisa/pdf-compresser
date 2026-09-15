import React, { useState, useRef } from 'react';
import { Image, RotateCw, Trash2, ArrowLeft, ArrowRight, Download, RefreshCw, FileText, Plus } from 'lucide-react';
import { loadImageElement, convertImagesToPdf } from '../utils/imageToPdf';

export default function ImageToPdf() {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const fileInputRef = useRef(null);

  const [options, setOptions] = useState({
    pageSize: 'a4', // 'a4', 'letter', 'fit'
    orientation: 'auto', // 'auto', 'portrait', 'landscape'
    margin: 15
  });

  const handleImagesSelected = async (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files).filter(
      (f) => f.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(f.name)
    );
    e.target.value = null;

    if (selectedFiles.length === 0) return;

    setIsLoading(true);
    try {
      const loadedItems = [];
      for (const file of selectedFiles) {
        const { img, dataUrl } = await loadImageElement(file);
        loadedItems.push({
          id: `img_${Math.random().toString(36).substring(2, 9)}`,
          file,
          name: file.name,
          imgElement: img,
          dataUrl,
          naturalWidth: img.naturalWidth,
          naturalHeight: img.naturalHeight,
          rotation: 0
        });
      }
      setImages((prev) => [...prev, ...loadedItems]);
    } catch (err) {
      console.error('Failed to load images:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRotateImage = (id) => {
    setImages((prev) =>
      prev.map((img) => (img.id === id ? { ...img, rotation: (img.rotation + 90) % 360 } : img))
    );
  };

  const handleDeleteImage = (id) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
  };

  const handleMoveImage = (index, direction) => {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    setImages((prev) => {
      const updated = [...prev];
      const temp = updated[index];
      updated[index] = updated[targetIndex];
      updated[targetIndex] = temp;
      return updated;
    });
  };

  const handleConvert = async () => {
    if (images.length === 0 || isConverting) return;

    setIsConverting(true);
    try {
      const pdfBlob = await convertImagesToPdf(images, options, (pct, msg) => setProgressMsg(msg));
      
      // Auto download PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `converted_images_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to convert images to PDF:', err);
    } finally {
      setIsConverting(false);
    }
  };

  const handleClear = () => {
    setImages([]);
  };

  return (
    <div>
      {/* Upload Zone */}
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
          onChange={handleImagesSelected}
          accept="image/*"
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
          <Image size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          Select Images (JPG, PNG, WebP)
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Convert photo scans, certificates, receipts, or images into a single PDF.
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <Plus size={18} />
          <span>Choose Image Files</span>
        </button>
      </div>

      {isLoading && (
        <div className="glass-panel" style={{ padding: '1.25rem', textAlign: 'center', marginBottom: '1.5rem' }}>
          <RefreshCw size={24} className="animate-spin" color="var(--accent-primary)" style={{ marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.9rem', color: 'var(--text-main)' }}>Loading images...</div>
        </div>
      )}

      {/* Page Configuration & Thumbnail Workspace */}
      {images.length > 0 && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          {/* Options Toolbar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            paddingBottom: '1.25rem',
            marginBottom: '1.25rem',
            borderBottom: '1px solid var(--border-color)'
          }}>
            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Page Size:
              </label>
              <select
                className="select-input"
                style={{ width: '100%', padding: '0.45rem 0.75rem' }}
                value={options.pageSize}
                onChange={(e) => setOptions({ ...options, pageSize: e.target.value })}
              >
                <option value="a4">Standard A4</option>
                <option value="letter">US Letter</option>
                <option value="fit">Fit to Image Size</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Orientation:
              </label>
              <select
                className="select-input"
                style={{ width: '100%', padding: '0.45rem 0.75rem' }}
                value={options.orientation}
                onChange={(e) => setOptions({ ...options, orientation: e.target.value })}
              >
                <option value="auto">Auto Detect</option>
                <option value="portrait">Portrait</option>
                <option value="landscape">Landscape</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                Page Margin:
              </label>
              <select
                className="select-input"
                style={{ width: '100%', padding: '0.45rem 0.75rem' }}
                value={options.margin}
                onChange={(e) => setOptions({ ...options, margin: parseInt(e.target.value) })}
              >
                <option value={0}>No Margin (Full Page)</option>
                <option value={15}>Small Margin (15px)</option>
                <option value={30}>Big Margin (30px)</option>
              </select>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', margin: 0 }}>
              Images ({images.length} {images.length === 1 ? 'image' : 'images'})
            </h3>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleConvert}
                disabled={isConverting}
              >
                <Download size={18} />
                <span>{isConverting ? 'Converting...' : 'Convert to PDF'}</span>
              </button>
              <button className="btn btn-secondary" onClick={handleClear} disabled={isConverting}>
                Clear
              </button>
            </div>
          </div>

          {isConverting && (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginBottom: '1rem', textAlign: 'center' }}>
              <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '0.4rem' }} />
              {progressMsg}
            </div>
          )}

          {/* Grid of Image Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '1rem'
          }}>
            {images.map((img, idx) => (
              <div
                key={img.id}
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.65rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div style={{
                  fontSize: '0.68rem',
                  color: 'var(--text-muted)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '100%',
                  marginBottom: '0.4rem'
                }}>
                  {img.name}
                </div>

                <div style={{
                  width: '100%',
                  height: '140px',
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
                    src={img.dataUrl}
                    alt={img.name}
                    style={{
                      maxHeight: '100%',
                      maxWidth: '100%',
                      transform: `rotate(${img.rotation}deg)`,
                      transition: 'transform 0.25s ease'
                    }}
                  />
                </div>

                <div style={{ fontSize: '0.78rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.5rem' }}>
                  Image {idx + 1}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleMoveImage(idx, -1)}
                    disabled={idx === 0}
                    title="Move Left"
                  >
                    <ArrowLeft size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleRotateImage(img.id)}
                    title="Rotate 90° Clockwise"
                  >
                    <RotateCw size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleMoveImage(idx, 1)}
                    disabled={idx === images.length - 1}
                    title="Move Right"
                  >
                    <ArrowRight size={13} />
                  </button>

                  <button
                    type="button"
                    className="btn btn-danger"
                    style={{ padding: '0.3rem', fontSize: '0.75rem' }}
                    onClick={() => handleDeleteImage(img.id)}
                    title="Delete Image"
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
