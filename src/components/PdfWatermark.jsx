import React, { useState, useRef } from 'react';
import { Type, Download, RefreshCw, FileText, Check, Layers } from 'lucide-react';
import { applyWatermarkAndPageNumbers } from '../utils/pdfWatermark';
import { formatBytes } from '../utils/pdfCompressor';

export default function PdfWatermark() {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const fileInputRef = useRef(null);

  const [options, setOptions] = useState({
    enableWatermark: true,
    watermarkText: 'CONFIDENTIAL',
    watermarkFontSize: 48,
    watermarkOpacity: 0.3,
    watermarkAngle: 45,
    watermarkColor: 'gray',

    enablePageNumbers: true,
    pageNumberPosition: 'bottom_center',
    pageNumberFormat: 'page_n_of_total',
    pageNumberFontSize: 10
  });

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      e.target.value = null;
    }
  };

  const updateOption = (key, value) => {
    setOptions((prev) => ({ ...prev, [key]: value }));
  };

  const handleApply = async () => {
    if (!file || isProcessing) return;

    setIsProcessing(true);
    try {
      const pdfBlob = await applyWatermarkAndPageNumbers(file, options, (pct, msg) => setProgressMsg(msg));
      
      // Auto download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, '');
      link.download = `${originalName}_watermarked.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to apply watermark:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const presetTexts = ['CONFIDENTIAL', 'DRAFT', 'DO NOT COPY', 'SAMPLE', 'FOR REVIEW ONLY'];

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
          <Type size={28} color="#ffffff" />
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {file ? file.name : 'Select PDF File for Watermark & Page Numbers'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {file ? `File size: ${formatBytes(file.size)}` : 'Add text watermarks or page numbers to your document.'}
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <FileText size={18} />
          <span>{file ? 'Change PDF File' : 'Select PDF File'}</span>
        </button>
      </div>

      {file && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
            Watermark & Page Numbering Settings
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Section 1: Watermark Settings */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <label className="custom-checkbox" style={{ marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={options.enableWatermark}
                  onChange={(e) => updateOption('enableWatermark', e.target.checked)}
                />
                <span className="checkbox-box">✓</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Enable Text Watermark</span>
              </label>

              {options.enableWatermark && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Watermark text */}
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Watermark Text:
                    </label>
                    <input
                      type="text"
                      className="select-input"
                      style={{ width: '100%' }}
                      value={options.watermarkText}
                      onChange={(e) => updateOption('watermarkText', e.target.value)}
                    />
                    {/* Presets */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.45rem' }}>
                      {presetTexts.map((txt) => (
                        <button
                          key={txt}
                          type="button"
                          onClick={() => updateOption('watermarkText', txt)}
                          style={{
                            fontSize: '0.72rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            border: '1px solid var(--border-color)',
                            background: options.watermarkText === txt ? 'var(--accent-primary)' : 'rgba(148, 163, 184, 0.1)',
                            color: options.watermarkText === txt ? '#ffffff' : 'var(--text-muted)',
                            cursor: 'pointer'
                          }}
                        >
                          {txt}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Font size */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Font Size:</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{options.watermarkFontSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="90"
                      step="2"
                      value={options.watermarkFontSize}
                      onChange={(e) => updateOption('watermarkFontSize', parseInt(e.target.value))}
                    />
                  </div>

                  {/* Opacity */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Opacity:</span>
                      <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{Math.round(options.watermarkOpacity * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="1.0"
                      step="0.05"
                      value={options.watermarkOpacity}
                      onChange={(e) => updateOption('watermarkOpacity', parseFloat(e.target.value))}
                    />
                  </div>

                  {/* Rotation angle & Color */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Angle:
                      </label>
                      <select
                        className="select-input"
                        style={{ width: '100%', padding: '0.4rem' }}
                        value={options.watermarkAngle}
                        onChange={(e) => updateOption('watermarkAngle', parseInt(e.target.value))}
                      >
                        <option value={45}>Diagonal (45°)</option>
                        <option value={0}>Horizontal (0°)</option>
                        <option value={90}>Vertical (90°)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                        Color:
                      </label>
                      <select
                        className="select-input"
                        style={{ width: '100%', padding: '0.4rem' }}
                        value={options.watermarkColor}
                        onChange={(e) => updateOption('watermarkColor', e.target.value)}
                      >
                        <option value="gray">Slate Gray</option>
                        <option value="red">Red</option>
                        <option value="blue">Blue</option>
                        <option value="black">Black</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Page Numbering Settings */}
            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem'
            }}>
              <label className="custom-checkbox" style={{ marginBottom: '1rem' }}>
                <input
                  type="checkbox"
                  checked={options.enablePageNumbers}
                  onChange={(e) => updateOption('enablePageNumbers', e.target.checked)}
                />
                <span className="checkbox-box">✓</span>
                <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>Enable Page Numbers</span>
              </label>

              {options.enablePageNumbers && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {/* Position */}
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Position:
                    </label>
                    <select
                      className="select-input"
                      style={{ width: '100%' }}
                      value={options.pageNumberPosition}
                      onChange={(e) => updateOption('pageNumberPosition', e.target.value)}
                    >
                      <option value="bottom_center">Bottom Center</option>
                      <option value="bottom_right">Bottom Right</option>
                      <option value="bottom_left">Bottom Left</option>
                      <option value="top_right">Top Right</option>
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
                      Format:
                    </label>
                    <select
                      className="select-input"
                      style={{ width: '100%' }}
                      value={options.pageNumberFormat}
                      onChange={(e) => updateOption('pageNumberFormat', e.target.value)}
                    >
                      <option value="page_n_of_total">Page 1 of X</option>
                      <option value="n_of_total">1 of X</option>
                      <option value="just_n">1 (Number only)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              className="btn btn-primary"
              onClick={handleApply}
              disabled={isProcessing}
              style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
            >
              <Download size={18} />
              <span>{isProcessing ? 'Applying Watermark...' : 'Apply Watermark & Download PDF'}</span>
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
