import React, { useState, useRef, useEffect } from 'react';
import { PenTool, Upload, Download, RefreshCw, FileText, RotateCcw, Check, Move } from 'lucide-react';
import { signPdfDocument } from '../utils/pdfSign';
import { formatBytes } from '../utils/pdfCompressor';

export default function PdfSign() {
  const [file, setFile] = useState(null);
  const [signMode, setSignMode] = useState('draw'); // 'draw' | 'upload'
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Signature canvas state
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [inkColor, setInkColor] = useState('#000000'); // black, blue, red
  const [uploadedSignatureUrl, setUploadedSignatureUrl] = useState(null);

  // Position options
  const [targetPage, setTargetPage] = useState(1);
  const [position, setPosition] = useState('bottom_right');
  const [scale, setScale] = useState(0.35);

  const fileInputRef = useRef(null);
  const stampInputRef = useRef(null);

  // Initialize Canvas
  useEffect(() => {
    if (signMode === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = inkColor;
    }
  }, [signMode, inkColor]);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleStampUploaded = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const imgFile = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        setUploadedSignatureUrl(evt.target.result);
      };
      reader.readAsDataURL(imgFile);
      e.target.value = null;
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage('');
      e.target.value = null;
    }
  };

  const getSignatureDataUrl = () => {
    if (signMode === 'draw') {
      if (!hasDrawn || !canvasRef.current) return null;
      return canvasRef.current.toDataURL('image/png');
    } else {
      return uploadedSignatureUrl;
    }
  };

  const handleSignPdf = async () => {
    if (!file) {
      setErrorMessage('Please select a PDF file first.');
      return;
    }

    const signatureDataUrl = getSignatureDataUrl();
    if (!signatureDataUrl) {
      setErrorMessage('Please draw your signature or upload a stamp image.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const pdfBlob = await signPdfDocument(
        file,
        signatureDataUrl,
        {
          targetPage,
          position,
          scale
        },
        (pct, msg) => setProgressMsg(msg)
      );

      // Auto download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, '');
      link.download = `${originalName}_signed.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to sign PDF:', err);
      setErrorMessage(err.message || 'Failed to sign PDF document.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Upload PDF Box */}
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
          accept="application/pdf"
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
          <PenTool size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {file ? file.name : 'Select PDF File to Sign'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {file ? `File size: ${formatBytes(file.size)}` : 'Draw your digital signature or upload a stamp to place on any page.'}
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <FileText size={18} />
          <span>{file ? 'Change PDF File' : 'Select PDF File'}</span>
        </button>
      </div>

      {/* Signature & Position Settings */}
      {file && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Digital Signature & Placement Options
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Signature Creation Panel */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              {/* Mode switch */}
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setSignMode('draw')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    background: signMode === 'draw' ? 'var(--gradient-button)' : 'rgba(148, 163, 184, 0.1)',
                    color: signMode === 'draw' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  <PenTool size={14} />
                  <span>Draw Signature</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSignMode('upload')}
                  className="btn"
                  style={{
                    flex: 1,
                    padding: '0.45rem 0.65rem',
                    fontSize: '0.82rem',
                    background: signMode === 'upload' ? 'var(--gradient-button)' : 'rgba(148, 163, 184, 0.1)',
                    color: signMode === 'upload' ? '#ffffff' : 'var(--text-muted)'
                  }}
                >
                  <Upload size={14} />
                  <span>Upload Stamp</span>
                </button>
              </div>

              {signMode === 'draw' ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Ink Color:</span>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {['#000000', '#1d4ed8', '#b91c1c'].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setInkColor(c)}
                          style={{
                            width: '22px',
                            height: '22px',
                            borderRadius: '50%',
                            background: c,
                            border: inkColor === c ? '2px solid #ffffff' : '1px solid var(--border-color)',
                            boxShadow: inkColor === c ? '0 0 8px ' + c : 'none',
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Canvas Pad */}
                  <div style={{
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-sm)',
                    background: '#ffffff',
                    position: 'relative',
                    marginBottom: '0.5rem'
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={320}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{ cursor: 'crosshair', display: 'block', width: '100%', height: '140px' }}
                    />
                    {!hasDrawn && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: '0.85rem'
                      }}>
                        Draw your signature here...
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem', width: '100%' }}
                    onClick={clearCanvas}
                  >
                    <RotateCcw size={13} />
                    <span>Clear Pad</span>
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '1rem 0' }}>
                  <input
                    type="file"
                    ref={stampInputRef}
                    onChange={handleStampUploaded}
                    accept="image/*"
                    style={{ display: 'none' }}
                  />
                  {uploadedSignatureUrl ? (
                    <div>
                      <div style={{
                        background: '#ffffff',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-color)',
                        marginBottom: '0.75rem',
                        maxHeight: '120px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <img src={uploadedSignatureUrl} alt="Signature Stamp" style={{ maxHeight: '100px', maxWidth: '100%' }} />
                      </div>
                      <button
                        type="button"
                        className="btn btn-secondary"
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => stampInputRef.current?.click()}
                      >
                        Change Stamp Image
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => stampInputRef.current?.click()}
                      style={{ padding: '0.6rem 1.2rem', fontSize: '0.88rem' }}
                    >
                      <Upload size={16} />
                      <span>Choose Signature Stamp PNG/JPG</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Position & Scale Panel */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '1rem' }}>
                Position & Page Settings:
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Target Page */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Target Page:
                  </label>
                  <select
                    className="select-input"
                    style={{ width: '100%' }}
                    value={targetPage}
                    onChange={(e) => setTargetPage(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
                  >
                    <option value={1}>Page 1 (First Page)</option>
                    <option value="all">All Pages</option>
                  </select>
                </div>

                {/* Position */}
                <div>
                  <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                    Signature Position:
                  </label>
                  <select
                    className="select-input"
                    style={{ width: '100%' }}
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                  >
                    <option value="bottom_right">Bottom Right (Standard Signature Box)</option>
                    <option value="bottom_left">Bottom Left</option>
                    <option value="bottom_center">Bottom Center</option>
                    <option value="top_right">Top Right</option>
                    <option value="center">Center of Page</option>
                  </select>
                </div>

                {/* Scale Slider */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Signature Size:</span>
                    <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{Math.round(scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.15"
                    max="0.60"
                    step="0.05"
                    value={scale}
                    onChange={(e) => setScale(parseFloat(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSignPdf}
              disabled={isProcessing}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <PenTool size={18} />
              <span>{isProcessing ? 'Signing Document...' : 'Sign & Download PDF'}</span>
            </button>
          </div>

          {isProcessing && (
            <div style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', marginTop: '0.85rem', textAlign: 'center' }}>
              <RefreshCw size={14} className="animate-spin" style={{ display: 'inline', marginRight: '0.4rem' }} />
              {progressMsg}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
