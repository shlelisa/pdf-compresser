import React, { useState } from 'react';
import { Zap, Sparkles, Shield, Target, ChevronDown, ChevronUp, Sliders } from 'lucide-react';

export default function CompressionControls({ options, onChangeOptions }) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const presets = [
    {
      id: 'recommended',
      label: 'Recommended',
      sublabel: 'Balanced quality & size',
      icon: Sparkles,
      badge: 'Popular'
    },
    {
      id: 'target_size',
      label: 'Fit Under 1 MB',
      sublabel: 'Ideal for Job CVs / Resumes',
      icon: Target,
      badge: 'Job Apps'
    },
    {
      id: 'extreme',
      label: 'Extreme Shrink',
      sublabel: 'Smallest size (~70-90% off)',
      icon: Zap,
      badge: 'Max Small'
    },
    {
      id: 'high_quality',
      label: 'Less Compression',
      sublabel: 'High quality print ready',
      icon: Shield,
      badge: 'Best Quality'
    }
  ];

  const updateOption = (key, value) => {
    onChangeOptions({
      ...options,
      [key]: value
    });
  };

  const selectPreset = (modeId) => {
    if (modeId === 'target_size') {
      onChangeOptions({ ...options, mode: 'target_size', targetSizeMB: options.targetSizeMB || 1 });
    } else if (modeId === 'extreme') {
      onChangeOptions({ ...options, mode: 'extreme', targetDpi: 72, jpegQuality: 0.45 });
    } else if (modeId === 'recommended') {
      onChangeOptions({ ...options, mode: 'recommended', targetDpi: 120, jpegQuality: 0.65 });
    } else if (modeId === 'high_quality') {
      onChangeOptions({ ...options, mode: 'high_quality', targetDpi: 180, jpegQuality: 0.85 });
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem 1.5rem', marginBottom: '1.5rem' }}>
      <div style={{
        fontSize: '0.85rem',
        fontWeight: '600',
        color: 'var(--text-muted)',
        marginBottom: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <span>Select Compression Goal</span>
      </div>

      {/* Preset pills grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '0.85rem',
        marginBottom: '1rem'
      }}>
        {presets.map((p) => {
          const Icon = p.icon;
          const isSelected = options.mode === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => selectPreset(p.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 0.95rem',
                borderRadius: 'var(--radius-md)',
                background: isSelected ? 'var(--gradient-glow)' : 'var(--bg-input)',
                border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: isSelected ? 'var(--gradient-button)' : 'rgba(148, 163, 184, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Icon size={18} color={isSelected ? '#ffffff' : 'var(--accent-primary)'} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '600', color: isSelected ? 'var(--accent-primary)' : 'var(--text-main)', fontSize: '0.9rem' }}>
                  {p.label}
                </div>
                <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)', marginTop: '0.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {p.sublabel}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Target Size Quick Input if Target Size mode selected */}
      {options.mode === 'target_size' && (
        <div style={{
          background: 'var(--gradient-glow)',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.1rem',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: '600' }}>
            Target Maximum File Size Cap:
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <input
              type="number"
              className="number-input"
              style={{ width: '80px', padding: '0.4rem 0.6rem', textAlign: 'center', fontWeight: '700' }}
              min="0.1"
              max="50"
              step="0.1"
              value={options.targetSizeMB || 1}
              onChange={(e) => updateOption('targetSizeMB', parseFloat(e.target.value) || 1)}
            />
            <span style={{ fontSize: '0.9rem', color: 'var(--accent-primary)', fontWeight: '700' }}>MB</span>
          </div>
        </div>
      )}

      {/* Advanced Settings Toggle */}
      <div style={{ textAlign: 'center', marginTop: '0.4rem' }}>
        <button
          type="button"
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-primary)',
            fontSize: '0.84rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.3rem 0.6rem',
            borderRadius: 'var(--radius-sm)'
          }}
        >
          <Sliders size={14} />
          <span>{showAdvanced ? 'Hide Advanced Options' : 'Custom Fine-Tuning (DPI, Quality, Color Mode)'}</span>
          {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
      </div>

      {/* Advanced Options */}
      {showAdvanced && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1.25rem'
        }}>
          {/* Resolution slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Resolution (DPI):</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{options.targetDpi || 120} DPI</span>
            </div>
            <input
              type="range"
              min="50"
              max="300"
              step="5"
              value={options.targetDpi || 120}
              onChange={(e) => updateOption('targetDpi', parseInt(e.target.value))}
            />
          </div>

          {/* Quality slider */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '0.35rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Quality:</span>
              <span style={{ fontWeight: '600', color: 'var(--accent-primary)' }}>{Math.round((options.jpegQuality || 0.7) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.0"
              step="0.05"
              value={options.jpegQuality || 0.7}
              onChange={(e) => updateOption('jpegQuality', parseFloat(e.target.value))}
            />
          </div>

          {/* Color Mode */}
          <div>
            <label style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.35rem' }}>
              Color Palette:
            </label>
            <select
              className="select-input"
              style={{ width: '100%', padding: '0.4rem 0.7rem' }}
              value={options.colorMode || 'color'}
              onChange={(e) => updateOption('colorMode', e.target.value)}
            >
              <option value="color">Full Color (Original)</option>
              <option value="grayscale">Grayscale</option>
              <option value="monochrome">Monochrome Black & White</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
}
