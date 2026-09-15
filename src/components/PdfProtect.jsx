import React, { useState, useRef } from 'react';
import { Lock, Unlock, ShieldCheck, Download, RefreshCw, FileText, Eye, EyeOff, Check, AlertCircle } from 'lucide-react';
import { encryptPdfFile, decryptPdfFile } from '../utils/pdfProtect';
import { formatBytes } from '../utils/pdfCompressor';

export default function PdfProtect() {
  const [activeSubTab, setActiveSubTab] = useState('encrypt'); // 'encrypt' | 'decrypt'
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressMsg, setProgressMsg] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const fileInputRef = useRef(null);

  // Encrypt Form State
  const [userPassword, setUserPassword] = useState('');
  const [allowPrinting, setAllowPrinting] = useState(true);
  const [allowCopying, setAllowCopying] = useState(false);
  const [allowModifying, setAllowModifying] = useState(false);

  // Decrypt Form State
  const [unlockPassword, setUnlockPassword] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setErrorMessage('');
      e.target.value = null;
    }
  };

  const handleEncrypt = async () => {
    if (!file) {
      setErrorMessage('Please select a PDF file first.');
      return;
    }
    if (!userPassword) {
      setErrorMessage('Please enter a password for the document.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const pdfBlob = await encryptPdfFile(
        file,
        {
          userPassword,
          allowPrinting,
          allowCopying,
          allowModifying
        },
        (pct, msg) => setProgressMsg(msg)
      );

      // Trigger automatic browser download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, '');
      link.download = `${originalName}_protected.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to encrypt PDF:', err);
      setErrorMessage(err.message || 'Failed to encrypt PDF file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDecrypt = async () => {
    if (!file) {
      setErrorMessage('Please select a PDF file first.');
      return;
    }
    if (!unlockPassword) {
      setErrorMessage('Please enter the password to unlock this document.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage('');
    try {
      const pdfBlob = await decryptPdfFile(file, unlockPassword, (pct, msg) => setProgressMsg(msg));

      // Trigger automatic browser download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      const originalName = file.name.replace(/\.pdf$/i, '');
      link.download = `${originalName}_unlocked.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error('Failed to decrypt PDF:', err);
      setErrorMessage('Failed to unlock PDF. Please check that the password is correct.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Sub-tab Switcher: Encrypt vs Decrypt */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <button
          type="button"
          onClick={() => { setActiveSubTab('encrypt'); setFile(null); setErrorMessage(''); }}
          className="btn"
          style={{
            background: activeSubTab === 'encrypt' ? 'var(--gradient-button)' : 'var(--bg-card)',
            color: activeSubTab === 'encrypt' ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem'
          }}
        >
          <Lock size={16} />
          <span>Encrypt PDF (Add Password)</span>
        </button>

        <button
          type="button"
          onClick={() => { setActiveSubTab('decrypt'); setFile(null); setErrorMessage(''); }}
          className="btn"
          style={{
            background: activeSubTab === 'decrypt' ? 'var(--gradient-button)' : 'var(--bg-card)',
            color: activeSubTab === 'decrypt' ? '#ffffff' : 'var(--text-muted)',
            border: '1px solid var(--border-color)',
            padding: '0.6rem 1.2rem',
            fontSize: '0.9rem'
          }}
        >
          <Unlock size={16} />
          <span>Unlock PDF (Remove Password)</span>
        </button>
      </div>

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
          {activeSubTab === 'encrypt' ? (
            <Lock size={28} color="#ffffff" />
          ) : (
            <Unlock size={28} color="#ffffff" />
          )}
        </div>
        <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', marginBottom: '0.4rem' }}>
          {file ? file.name : activeSubTab === 'encrypt' ? 'Select PDF File to Password Protect' : 'Select Protected PDF File to Unlock'}
        </h2>
        <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          {file ? `File size: ${formatBytes(file.size)}` : activeSubTab === 'encrypt' ? 'Encrypt your PDF with 128-bit security.' : 'Remove password restrictions from your PDF file.'}
        </p>
        <button type="button" className="btn btn-primary" style={{ padding: '0.65rem 1.4rem' }}>
          <FileText size={18} />
          <span>{file ? 'Change PDF File' : 'Select PDF File'}</span>
        </button>
      </div>

      {/* Error Alert if any */}
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

      {/* Password Configuration Panel */}
      {file && (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
          {activeSubTab === 'encrypt' ? (
            <>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Encryption & Security Settings
              </h3>

              <div style={{ marginBottom: '1.25rem', position: 'relative', maxWidth: '400px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Set Document Password (Required to Open PDF):
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="select-input"
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                    placeholder="Enter password..."
                    value={userPassword}
                    onChange={(e) => { setUserPassword(e.target.value); setErrorMessage(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Permissions checkboxes */}
              <div style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-md)',
                padding: '1.25rem',
                marginBottom: '1.5rem'
              }}>
                <div style={{ fontSize: '0.88rem', fontWeight: '600', color: 'var(--text-main)', marginBottom: '0.85rem' }}>
                  Permissions & Restrictions:
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={allowPrinting}
                      onChange={(e) => setAllowPrinting(e.target.checked)}
                    />
                    <span className="checkbox-box">✓</span>
                    <span>Allow Printing Document</span>
                  </label>

                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={allowCopying}
                      onChange={(e) => setAllowCopying(e.target.checked)}
                    />
                    <span className="checkbox-box">✓</span>
                    <span>Allow Copying Text & Images</span>
                  </label>

                  <label className="custom-checkbox">
                    <input
                      type="checkbox"
                      checked={allowModifying}
                      onChange={(e) => setAllowModifying(e.target.checked)}
                    />
                    <span className="checkbox-box">✓</span>
                    <span>Allow Editing / Modifying Document</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleEncrypt}
                  disabled={!userPassword || isProcessing}
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                >
                  <Lock size={18} />
                  <span>{isProcessing ? 'Encrypting PDF...' : 'Encrypt & Download PDF'}</span>
                </button>
              </div>
            </>
          ) : (
            <>
              <h3 style={{ fontSize: '1.15rem', color: 'var(--text-main)', marginBottom: '1.25rem' }}>
                Unlock PDF Document
              </h3>

              <div style={{ marginBottom: '1.5rem', maxWidth: '400px' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.4rem' }}>
                  Enter Password to Remove Encryption:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="select-input"
                    style={{ width: '100%', paddingRight: '2.5rem' }}
                    placeholder="Enter PDF password..."
                    value={unlockPassword}
                    onChange={(e) => { setUnlockPassword(e.target.value); setErrorMessage(''); }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '0.6rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleDecrypt}
                  disabled={!unlockPassword || isProcessing}
                  style={{ padding: '0.85rem 1.75rem', fontSize: '1rem' }}
                >
                  <Unlock size={18} />
                  <span>{isProcessing ? 'Unlocking PDF...' : 'Unlock & Download PDF'}</span>
                </button>
              </div>
            </>
          )}

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
