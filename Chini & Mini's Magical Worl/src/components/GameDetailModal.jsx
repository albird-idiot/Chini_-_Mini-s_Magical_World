import React, { useEffect } from 'react';
import { X, Play, Clock, Sparkles, Gamepad2, ArrowRight } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function GameDetailModal({ game, onClose, onLaunchGame }) {
  useEffect(() => {
    if (!game) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        soundManager.playClose();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [game, onClose]);

  if (!game) return null;

  const isPlayable = game.status === 'playable';

  const handleClose = () => {
    soundManager.playClose();
    onClose();
  };

  const handleLaunch = () => {
    if (isPlayable) {
      soundManager.playChime();
      if (onLaunchGame) onLaunchGame(game);
    } else {
      handleClose();
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-detail-title"
    >
      <div className="modal-dialog game-detail-modal">
        {/* Banner */}
        <div
          className="game-modal-banner"
          style={{ backgroundColor: game.themeColor || '#7c3aed' }}
        >
          <button
            onClick={handleClose}
            className="game-modal-close"
            aria-label="Close details"
          >
            <X size={20} />
          </button>
          <div className="banner-content">
            <span className="banner-emoji" aria-hidden="true">
              {game.fallbackEmoji || '🎮'}
            </span>
            <div className="banner-text">
              <span className="banner-category">{game.category} Adventure</span>
              <h2 id="game-detail-title" className="banner-title">
                {game.title}
              </h2>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="modal-body">
          {/* Status Alert */}
          <div
            className={`status-callout ${
              isPlayable ? 'callout-ready' : 'callout-soon'
            }`}
          >
            {isPlayable ? (
              <>
                <Sparkles size={20} className="callout-icon" />
                <div>
                  <strong>Ready to Play!</strong>
                  <p>This adventure is loaded and verified for browser play.</p>
                </div>
              </>
            ) : (
              <>
                <Clock size={20} className="callout-icon" />
                <div>
                  <strong>Adventure Under Construction! 🛠️✨</strong>
                  <p>
                    {game.developerNote ||
                      'Kakai is crafting new surprise games. It will appear here very soon!'}
                  </p>
                </div>
              </>
            )}
          </div>

          {/* Description */}
          <div className="detail-section">
            <h3 className="section-heading">About This Adventure</h3>
            <p className="detail-description">{game.description}</p>
          </div>

          {/* Planned Controls */}
          {game.plannedControls && game.plannedControls.length > 0 && (
            <div className="detail-section">
              <h3 className="section-heading">
                <Gamepad2 size={18} /> Controls & How to Play
              </h3>
              <div className="controls-table">
                {game.plannedControls.map((ctrl, idx) => (
                  <div key={idx} className="control-item">
                    <span className="control-key">{ctrl.key}</span>
                    <span className="control-action">{ctrl.action}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Features */}
          {game.features && game.features.length > 0 && (
            <div className="detail-section">
              <h3 className="section-heading">Magical Highlights</h3>
              <ul className="features-list">
                {game.features.map((feat, idx) => (
                  <li key={idx} className="feature-item">
                    <span className="bullet">✨</span>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="modal-footer">
          <button
            type="button"
            onClick={handleClose}
            className="btn-secondary-reset"
          >
            Back to Catalogue
          </button>
          <button
            type="button"
            onClick={handleLaunch}
            className={`card-btn modal-action-btn ${
              isPlayable ? 'btn-play' : 'btn-preview'
            }`}
          >
            {isPlayable ? (
              <>
                <Play size={18} fill="currentColor" />
                <span>Launch Adventure</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Got It! Check Back Soon</span>
              </>
            )}
          </button>
        </footer>
      </div>

      <style>{`
        .game-detail-modal {
          max-width: 620px;
        }

        .game-modal-banner {
          padding: 30px 24px;
          position: relative;
          color: #ffffff;
          border-radius: var(--radius-lg) var(--radius-lg) 0 0;
          overflow: hidden;
        }

        .game-modal-close {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.25);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          backdrop-filter: blur(4px);
          transition: all 0.15s ease;
        }

        .game-modal-close:hover {
          background: rgba(0, 0, 0, 0.45);
          transform: rotate(90deg);
        }

        .banner-content {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .banner-emoji {
          font-size: 3.8rem;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3));
          animation: gentleFloat 3s ease-in-out infinite;
        }

        .banner-category {
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-size: 0.75rem;
          font-weight: 700;
          background: rgba(255, 255, 255, 0.25);
          padding: 3px 10px;
          border-radius: var(--radius-full);
          display: inline-block;
          margin-bottom: 6px;
        }

        .banner-title {
          font-size: clamp(1.4rem, 2.5vw, 1.8rem);
          line-height: 1.2;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .status-callout {
          display: flex;
          gap: 12px;
          padding: 14px 16px;
          border-radius: var(--radius-md);
          margin-bottom: 20px;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .callout-soon {
          background: #fefce8;
          border: 2px solid #fef08a;
          color: #854d0e;
        }

        .callout-soon .callout-icon {
          color: #ca8a04;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .callout-ready {
          background: #f0fdf4;
          border: 2px solid #bbf7d0;
          color: #166534;
        }

        .callout-ready .callout-icon {
          color: #16a34a;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .detail-section {
          margin-bottom: 20px;
        }

        .section-heading {
          font-size: 1.05rem;
          color: var(--color-purple-dark);
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .detail-description {
          font-size: 0.95rem;
          line-height: 1.6;
          color: #374151;
        }

        .controls-table {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .control-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: #f8fafc;
          border-radius: var(--radius-sm);
          border: 1px solid #e2e8f0;
          gap: 12px;
        }

        .control-key {
          font-family: monospace;
          background: #ffffff;
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          box-shadow: 0 1px 2px rgba(0,0,0,0.06);
          font-size: 0.85rem;
          font-weight: 700;
          color: #1e293b;
        }

        .control-action {
          font-size: 0.9rem;
          color: #475569;
          font-weight: 600;
        }

        .features-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .feature-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.92rem;
          color: #374151;
        }

        .bullet {
          font-size: 0.85rem;
        }

        .modal-action-btn {
          width: auto;
          min-width: 180px;
        }
      `}</style>
    </div>
  );
}
