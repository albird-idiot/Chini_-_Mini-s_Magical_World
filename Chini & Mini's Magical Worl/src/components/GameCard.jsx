import React, { useState } from 'react';
import { Sparkles, Clock, Play, Info } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function GameCard({ game, onSelect }) {
  const [imgError, setImgError] = useState(false);
  const isPlayable = game.status === 'playable';

  const handleCardClick = () => {
    if (isPlayable && game.launchPath) {
      soundManager.playChime();
      window.location.href = game.launchPath;
    } else {
      soundManager.playPop();
      onSelect(game);
    }
  };

  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (isPlayable && game.launchPath) {
      soundManager.playChime();
      window.location.href = game.launchPath;
    } else {
      soundManager.playPop();
      onSelect(game);
    }
  };

  return (
    <div
      className={`game-card ${isPlayable ? 'is-playable' : 'is-coming-soon'}`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`${game.title} - ${isPlayable ? 'Ready to play. Click to play now' : 'Coming soon. Click to view details'}`}
    >
      {/* Thumbnail Banner with designed Fallback */}
      <div className="card-thumbnail-wrapper" style={{ backgroundColor: game.themeColor || '#7c3aed' }}>
        {!imgError && game.thumbnail ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            className="card-thumbnail-img"
            onError={() => setImgError(true)}
            loading="lazy"
          />
        ) : null}

        {/* Fallback Artwork when image is absent or error */}
        {(imgError || !game.thumbnail) && (
          <div className="card-thumbnail-fallback">
            <span className="fallback-emoji" aria-hidden="true">
              {game.fallbackEmoji || '🎮'}
            </span>
            <div className="fallback-pattern" aria-hidden="true">
              <span className="floating-star s1">✨</span>
              <span className="floating-star s2">⭐</span>
              <span className="floating-star s3">🌟</span>
            </div>
          </div>
        )}

        {/* Category & Status Badges */}
        <div className="card-badges-row">
          <span className="badge category-badge">{game.category}</span>
          <span className={`badge status-badge ${isPlayable ? 'status-ready' : 'status-soon'}`}>
            {isPlayable ? (
              <>
                <Play size={12} fill="currentColor" /> Play Now
              </>
            ) : (
              <>
                <Clock size={12} /> Coming Soon
              </>
            )}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="card-content">
        <h3 className="card-title">{game.title}</h3>
        <p className="card-tagline">{game.tagline || game.description}</p>

        {/* Key Features Preview */}
        {game.features && game.features.length > 0 && (
          <div className="card-features-chips">
            {game.features.slice(0, 2).map((feat, idx) => (
              <span key={idx} className="feature-chip">
                ★ {feat}
              </span>
            ))}
          </div>
        )}

        {/* Action Button */}
        <div className="card-action-row">
          <button
            type="button"
            className={`card-btn ${isPlayable ? 'btn-play' : 'btn-preview'}`}
            onClick={handleButtonClick}
            aria-label={isPlayable ? `PLAY NOW - ${game.title}` : `View details for ${game.title}`}
          >
            {isPlayable ? (
              <>
                <Play size={16} fill="currentColor" />
                <span>PLAY NOW</span>
              </>
            ) : (
              <>
                <Info size={16} />
                <span>View Details & Controls</span>
              </>
            )}
          </button>
        </div>
      </div>

      <style>{`
        .game-card {
          background: #ffffff;
          border-radius: var(--radius-lg);
          border: 3px solid #e0e7ff;
          box-shadow: 0 10px 25px -5px rgba(30, 27, 75, 0.08);
          overflow: hidden;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          transition: transform 0.22s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.22s ease,
                      border-color 0.22s ease;
          position: relative;
        }

        .game-card:hover,
        .game-card:focus-visible {
          transform: translateY(-6px) scale(1.02);
          box-shadow: 0 20px 35px -8px rgba(124, 58, 237, 0.22);
          border-color: #a5b4fc;
        }

        .game-card.is-playable:hover {
          border-color: #10b981;
          box-shadow: 0 20px 35px -8px rgba(16, 185, 129, 0.25);
        }

        .card-thumbnail-wrapper {
          height: 180px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-thumbnail-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.3s ease;
        }

        .game-card:hover .card-thumbnail-img {
          transform: scale(1.05);
        }

        .card-thumbnail-fallback {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: radial-gradient(circle at 50% 40%, rgba(255,255,255,0.3) 0%, transparent 70%);
        }

        .fallback-emoji {
          font-size: 5rem;
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));
          animation: gentleFloat 3s ease-in-out infinite;
        }

        .fallback-pattern .floating-star {
          position: absolute;
          font-size: 1.3rem;
          user-select: none;
        }

        .s1 { top: 20px; left: 24px; animation: sparkleSpin 4s linear infinite; }
        .s2 { top: 30px; right: 28px; animation: gentleFloat 2.5s ease-in-out infinite; }
        .s3 { bottom: 20px; right: 40px; animation: sparkleSpin 3s linear infinite reverse; }

        .card-badges-row {
          position: absolute;
          top: 12px;
          left: 12px;
          right: 12px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          pointer-events: none;
        }

        .badge {
          font-family: var(--font-display);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: var(--radius-full);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          display: inline-flex;
          align-items: center;
          gap: 5px;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .category-badge {
          background: rgba(15, 23, 42, 0.75);
          color: #ffffff;
        }

        .status-badge.status-soon {
          background: rgba(254, 240, 138, 0.95);
          color: #854d0e;
          border: 1.5px solid #facc15;
        }

        .status-badge.status-ready {
          background: rgba(220, 252, 231, 0.95);
          color: #166534;
          border: 1.5px solid #86efac;
        }

        .card-content {
          padding: 20px;
          display: flex;
          flex-direction: column;
          flex: 1;
        }

        .card-title {
          font-size: 1.25rem;
          color: var(--color-purple-dark);
          margin-bottom: 6px;
        }

        .card-tagline {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.45;
          margin-bottom: 14px;
          flex: 1;
        }

        .card-features-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 16px;
        }

        .feature-chip {
          background: #f1f5f9;
          color: #475569;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }

        .card-action-row {
          margin-top: auto;
        }

        .card-btn {
          width: 100%;
          min-height: 44px;
          padding: 10px 16px;
          border-radius: var(--radius-full);
          font-weight: 700;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.15s ease;
        }

        .btn-preview {
          background: #f8fafc;
          border: 2px solid #cbd5e1;
          color: #475569;
        }

        .game-card:hover .btn-preview {
          background: #ede9fe;
          border-color: #c4b5fd;
          color: #6d28d9;
        }

        .btn-play {
          background: #10b981;
          color: #ffffff;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
          letter-spacing: 0.04em;
        }

        .game-card:hover .btn-play {
          background: #059669;
          transform: scale(1.02);
        }

        @media (max-width: 640px) {
          .card-thumbnail-wrapper {
            height: 180px;
          }
          .card-content {
            padding: 18px 16px 20px;
          }
          .card-title {
            font-size: 1.25rem;
            line-height: 1.35;
            margin-top: 0;
            margin-bottom: 6px;
            overflow: visible;
          }
        }
      `}</style>
    </div>
  );
}
