import React from 'react';
import { Volume2, VolumeX, Settings, Heart, Home, Compass } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function HeaderNav({
  currentPage,
  onNavigate,
  onOpenSettings,
  onOpenMessage,
  soundEnabled,
  onToggleSound
}) {
  const handleNav = (targetPage) => {
    soundManager.playPop();
    onNavigate(targetPage);
  };

  const handleSettingsClick = () => {
    soundManager.playPop();
    onOpenSettings();
  };

  const handleMessageClick = () => {
    soundManager.playHarp();
    onOpenMessage();
  };

  const handleSoundClick = () => {
    onToggleSound();
    if (!soundEnabled) {
      // It's about to be turned ON
      setTimeout(() => soundManager.playPop(), 50);
    }
  };

  return (
    <header className="header-nav-container" role="banner">
      <nav className="header-nav-inner" aria-label="Main Navigation">
        {/* Brand / Home link */}
        <div className="nav-brand-group">
          {currentPage === 'home' ? (
            <div className="brand-logo" aria-label="Chini & Mini's Magical World">
              <span className="brand-star">✨</span>
              <span className="brand-text">Chini & Mini</span>
            </div>
          ) : (
            <button
              onClick={() => handleNav('home')}
              className="nav-pill-btn brand-back-btn"
              aria-label="Return to Home"
            >
              <Home size={18} aria-hidden="true" />
              <span className="nav-btn-label">Home</span>
            </button>
          )}

          {currentPage === 'home' ? (
            <button
              onClick={() => handleNav('explore')}
              className="nav-pill-btn nav-explore-shortcut"
              aria-label="Go to Game Catalogue"
            >
              <Compass size={18} aria-hidden="true" />
              <span className="nav-btn-label">Explore World</span>
            </button>
          ) : (
            <div className="brand-badge-active" aria-current="page">
              <Compass size={18} aria-hidden="true" />
              <span>Explore World</span>
            </div>
          )}
        </div>

        {/* Global Action Buttons */}
        <div className="nav-actions-group">
          <button
            onClick={handleMessageClick}
            className="nav-pill-btn accent-rose special-message-nav-btn"
            aria-label="Open Special Message for Chini & Mini"
            title="Read Special Message"
          >
            <Heart size={18} className="heart-icon-pulse" aria-hidden="true" />
            <span className="nav-btn-label">Special Message</span>
          </button>

          <button
            onClick={handleSettingsClick}
            className="nav-pill-btn"
            aria-label="Open Settings"
            title="Adjust Settings"
          >
            <Settings size={18} aria-hidden="true" />
            <span className="nav-btn-label">Settings</span>
          </button>

          <button
            onClick={handleSoundClick}
            className="nav-pill-btn sound-toggle-btn"
            aria-label={soundEnabled ? 'Mute Sound Effects' : 'Enable Sound Effects'}
            title={soundEnabled ? 'Sound is ON' : 'Sound is OFF'}
          >
            {soundEnabled ? (
              <Volume2 size={18} aria-hidden="true" />
            ) : (
              <VolumeX size={18} color="#94a3b8" aria-hidden="true" />
            )}
            <span className="nav-btn-label sound-label">
              {soundEnabled ? 'Sound On' : 'Muted'}
            </span>
          </button>
        </div>
      </nav>

      <style>{`
        .header-nav-container {
          position: sticky;
          top: 0;
          z-index: 100;
          width: 100%;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border-bottom: 2px solid rgba(226, 232, 240, 0.8);
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.04);
        }

        .header-nav-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 10px 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .nav-brand-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1.15rem;
          color: var(--color-purple-dark);
          padding: 6px 12px;
          background: linear-gradient(135deg, #fdf2f8, #f5f3ff);
          border: 2px solid #e9d5ff;
          border-radius: var(--radius-full);
        }

        .brand-star {
          font-size: 1rem;
          animation: gentleFloat 3s ease-in-out infinite;
        }

        .brand-badge-active {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-display);
          font-weight: 700;
          font-size: 1rem;
          color: var(--color-purple-main);
          padding: 6px 12px;
          background: #f5f3ff;
          border-radius: var(--radius-full);
          border: 1.5px solid #ddd6fe;
        }

        .nav-actions-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .heart-icon-pulse {
          color: #f43f5e;
          animation: gentleFloat 2s ease-in-out infinite;
        }

        @media (max-width: 680px) {
          .header-nav-inner {
            padding: 8px 12px;
            gap: 8px;
          }
          .nav-btn-label {
            display: none;
          }
          .nav-pill-btn {
            padding: 8px 10px;
            min-width: 44px;
            min-height: 44px;
          }
          .brand-logo .brand-text {
            font-size: 0.95rem;
          }
        }

        @media (max-width: 380px) {
          .nav-explore-shortcut {
            display: none;
          }
        }
      `}</style>
    </header>
  );
}
