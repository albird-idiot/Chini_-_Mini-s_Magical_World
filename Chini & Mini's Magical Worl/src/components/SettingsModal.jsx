import React, { useState, useEffect } from 'react';
import {
  Volume2,
  VolumeX,
  Sparkles,
  Maximize2,
  Minimize2,
  Sliders,
  RotateCcw,
  Check,
  X,
  Gamepad2,
  Info
} from 'lucide-react';
import { settingsManager } from '../utils/settings';
import { soundManager } from '../utils/audio';

export default function SettingsModal({ isOpen, onClose }) {
  const [settings, setSettings] = useState(settingsManager.get());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [fullscreenError, setFullscreenError] = useState(null);

  useEffect(() => {
    const unsub = settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      unsub();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Handle Escape key to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        soundManager.playClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleToggleSound = () => {
    const nextVal = !settings.soundEffects;
    settingsManager.set({ soundEffects: nextVal });
    if (nextVal) {
      setTimeout(() => soundManager.playPop(), 50);
    }
  };

  const handleToggleReducedMotion = () => {
    soundManager.playPop();
    settingsManager.set({ reducedMotion: !settings.reducedMotion });
  };

  const handleToggleFullscreen = async () => {
    soundManager.playPop();
    setFullscreenError(null);
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else {
          setFullscreenError('Fullscreen is not supported on this device/browser.');
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      setFullscreenError('Fullscreen request was declined by the browser.');
    }
  };

  const handleVolumeChange = (e) => {
    const val = Number(e.target.value);
    settingsManager.set({ musicVolume: val });
  };

  const handleDifficultyChange = (diff) => {
    soundManager.playPop();
    settingsManager.set({ gameDifficulty: diff });
  };

  const handleTouchControlsChange = (mode) => {
    soundManager.playPop();
    settingsManager.set({ touchControls: mode });
  };

  const handleReset = () => {
    soundManager.playClose();
    settingsManager.reset();
  };

  const handleClose = () => {
    soundManager.playClose();
    onClose();
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div className="modal-dialog">
        <header className="modal-header">
          <h2 id="settings-dialog-title" className="modal-title">
            <span>⚙️</span>
            <span>Settings & Preferences</span>
          </h2>
          <button
            onClick={handleClose}
            className="modal-close-btn"
            aria-label="Close Settings"
          >
            <X size={20} />
          </button>
        </header>

        <div className="modal-body">
          {/* Active Website Settings Section */}
          <section className="settings-section" aria-labelledby="section-website-title">
            <h3 id="section-website-title" className="settings-section-title">
              Website & Experience
            </h3>

            {/* Sound Toggle */}
            <div className="setting-row">
              <div className="setting-meta">
                <div className="setting-label-row">
                  {settings.soundEffects ? (
                    <Volume2 size={20} className="setting-icon text-purple" />
                  ) : (
                    <VolumeX size={20} className="setting-icon text-muted" />
                  )}
                  <span className="setting-label">Sound Effects</span>
                </div>
                <p className="setting-desc">Play gentle magical chimes and tap sounds</p>
              </div>
              <button
                type="button"
                onClick={handleToggleSound}
                className={`toggle-switch ${settings.soundEffects ? 'active' : ''}`}
                aria-pressed={settings.soundEffects}
                aria-label="Toggle sound effects"
              >
                <span className="toggle-handle" />
              </button>
            </div>

            {/* Reduced Motion Toggle */}
            <div className="setting-row">
              <div className="setting-meta">
                <div className="setting-label-row">
                  <Sparkles size={20} className="setting-icon text-amber" />
                  <span className="setting-label">Calm Mode (Reduced Motion)</span>
                </div>
                <p className="setting-desc">
                  Pauses gentle floating sparkles and pulses for sensitive eyes
                </p>
              </div>
              <button
                type="button"
                onClick={handleToggleReducedMotion}
                className={`toggle-switch ${settings.reducedMotion ? 'active' : ''}`}
                aria-pressed={settings.reducedMotion}
                aria-label="Toggle reduced motion calm mode"
              >
                <span className="toggle-handle" />
              </button>
            </div>

            {/* Fullscreen Toggle */}
            <div className="setting-row">
              <div className="setting-meta">
                <div className="setting-label-row">
                  {isFullscreen ? (
                    <Minimize2 size={20} className="setting-icon text-blue" />
                  ) : (
                    <Maximize2 size={20} className="setting-icon text-blue" />
                  )}
                  <span className="setting-label">Full Screen View</span>
                </div>
                <p className="setting-desc">
                  {isFullscreen
                    ? 'Currently in full screen mode'
                    : 'Expand magical kingdom to fill entire display'}
                </p>
                {fullscreenError && (
                  <p className="setting-error" role="alert">{fullscreenError}</p>
                )}
              </div>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                className="btn-action-small"
                aria-label={isFullscreen ? 'Exit Full Screen' : 'Enter Full Screen'}
              >
                {isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
              </button>
            </div>
          </section>

          {/* Future Games Preferences Section */}
          <section className="settings-section future-games-section" aria-labelledby="section-future-title">
            <div className="future-badge-header">
              <h3 id="section-future-title" className="settings-section-title">
                Future Game Preferences
              </h3>
              <span className="future-tag">
                <Gamepad2 size={14} /> Upcoming Games
              </span>
            </div>
            <div className="future-info-box">
              <Info size={16} className="future-info-icon" />
              <p>
                These settings are saved in your browser and automatically configure
                your experience across the magical game adventures!
              </p>
            </div>

            {/* Music Volume Slider */}
            <div className="setting-row column-layout">
              <div className="slider-header">
                <span className="setting-label">Game Music Volume</span>
                <span className="slider-value">{settings.musicVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.musicVolume}
                onChange={handleVolumeChange}
                className="custom-range-slider"
                aria-label="Game Music Volume"
              />
            </div>

            {/* Game Difficulty */}
            <div className="setting-row column-layout">
              <span className="setting-label">Gameplay Pace</span>
              <div className="segmented-control" role="group" aria-label="Gameplay Pace">
                <button
                  type="button"
                  className={`segment-btn ${settings.gameDifficulty === 'gentle' ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange('gentle')}
                  aria-pressed={settings.gameDifficulty === 'gentle'}
                >
                  🌸 Gentle & Forgiving
                </button>
                <button
                  type="button"
                  className={`segment-btn ${settings.gameDifficulty === 'normal' ? 'active' : ''}`}
                  onClick={() => handleDifficultyChange('normal')}
                  aria-pressed={settings.gameDifficulty === 'normal'}
                >
                  🚀 Adventurous
                </button>
              </div>
            </div>

            {/* Touch Controls Mode */}
            <div className="setting-row column-layout">
              <span className="setting-label">On-Screen Controls</span>
              <div className="segmented-control" role="group" aria-label="On-Screen Controls">
                <button
                  type="button"
                  className={`segment-btn ${settings.touchControls === 'auto' ? 'active' : ''}`}
                  onClick={() => handleTouchControlsChange('auto')}
                  aria-pressed={settings.touchControls === 'auto'}
                >
                  Auto-Detect (Recommended)
                </button>
                <button
                  type="button"
                  className={`segment-btn ${settings.touchControls === 'always' ? 'active' : ''}`}
                  onClick={() => handleTouchControlsChange('always')}
                  aria-pressed={settings.touchControls === 'always'}
                >
                  Always Show Touch Pad
                </button>
              </div>
            </div>
          </section>
        </div>

        <footer className="modal-footer">
          <button
            type="button"
            onClick={handleReset}
            className="btn-secondary-reset"
            title="Reset all settings to default"
          >
            <RotateCcw size={16} />
            <span>Reset Defaults</span>
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="btn-primary-done"
          >
            <Check size={18} />
            <span>Done</span>
          </button>
        </footer>
      </div>

      <style>{`
        .settings-section {
          margin-bottom: 24px;
        }

        .settings-section-title {
          font-size: 1.1rem;
          color: var(--color-purple-dark);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .future-games-section {
          background: #f8fafc;
          border: 2px dashed #cbd5e1;
          border-radius: var(--radius-md);
          padding: 16px;
        }

        .future-badge-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 10px;
          flex-wrap: wrap;
          gap: 8px;
        }

        .future-tag {
          font-size: 0.8rem;
          font-weight: 700;
          color: #7c3aed;
          background: #ede9fe;
          padding: 4px 10px;
          border-radius: var(--radius-full);
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .future-info-box {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #eff6ff;
          border-left: 3px solid #3b82f6;
          padding: 10px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          color: #1e3a8a;
          margin-bottom: 16px;
        }

        .future-info-icon {
          flex-shrink: 0;
          margin-top: 2px;
          color: #2563eb;
        }

        .setting-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px 0;
          border-bottom: 1px solid #f1f5f9;
          gap: 16px;
        }

        .setting-row.column-layout {
          flex-direction: column;
          align-items: stretch;
          gap: 8px;
        }

        .setting-meta {
          flex: 1;
        }

        .setting-label-row {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 4px;
        }

        .setting-label {
          font-weight: 700;
          color: var(--color-text-dark);
          font-size: 0.95rem;
        }

        .setting-desc {
          font-size: 0.85rem;
          color: var(--color-text-muted);
        }

        .setting-error {
          font-size: 0.8rem;
          color: #dc2626;
          margin-top: 4px;
        }

        .text-purple { color: #7c3aed; }
        .text-amber { color: #d97706; }
        .text-blue { color: #2563eb; }
        .text-muted { color: #94a3b8; }

        /* Toggle Switch */
        .toggle-switch {
          width: 52px;
          height: 30px;
          border-radius: var(--radius-full);
          background: #cbd5e1;
          position: relative;
          transition: background-color 0.2s ease;
          flex-shrink: 0;
        }

        .toggle-switch.active {
          background: #10b981;
        }

        .toggle-handle {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .toggle-switch.active .toggle-handle {
          transform: translateX(22px);
        }

        /* Buttons */
        .btn-action-small {
          padding: 8px 16px;
          background: #f1f5f9;
          border: 1.5px solid #cbd5e1;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 0.88rem;
          color: #334155;
          transition: all 0.15s;
        }

        .btn-action-small:hover {
          background: #e2e8f0;
          color: #0f172a;
        }

        .slider-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .slider-value {
          font-weight: 700;
          color: #7c3aed;
        }

        .custom-range-slider {
          width: 100%;
          accent-color: #7c3aed;
          height: 8px;
          border-radius: 4px;
          background: #e2e8f0;
          cursor: pointer;
        }

        .segmented-control {
          display: flex;
          background: #e2e8f0;
          padding: 3px;
          border-radius: var(--radius-md);
          gap: 4px;
        }

        .segment-btn {
          flex: 1;
          padding: 8px 12px;
          border-radius: calc(var(--radius-md) - 3px);
          font-size: 0.85rem;
          font-weight: 600;
          color: #64748b;
          text-align: center;
          transition: all 0.15s ease;
        }

        .segment-btn.active {
          background: #ffffff;
          color: #1e1b4b;
          box-shadow: 0 2px 6px rgba(0,0,0,0.08);
        }

        .btn-secondary-reset {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: var(--radius-full);
          color: #64748b;
          font-weight: 600;
          font-size: 0.9rem;
          transition: all 0.15s;
        }

        .btn-secondary-reset:hover {
          background: #e2e8f0;
          color: #334155;
        }

        .btn-primary-done {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 22px;
          border-radius: var(--radius-full);
          background: #7c3aed;
          color: #ffffff;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
          transition: all 0.15s;
        }

        .btn-primary-done:hover {
          background: #6d28d9;
          transform: translateY(-1px);
        }
      `}</style>
    </div>
  );
}
