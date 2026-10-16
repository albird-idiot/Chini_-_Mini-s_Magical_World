import React from 'react';
import InteractiveStartOverlay from '../components/InteractiveStartOverlay';
import { Compass, Heart, Settings, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function Home({ onNavigate, onOpenSettings, onOpenMessage }) {
  const handleExplore = () => {
    soundManager.playChime();
    onNavigate('explore');
  };

  const handleMessage = () => {
    soundManager.playHarp();
    onOpenMessage();
  };

  const handleSettings = () => {
    soundManager.playPop();
    onOpenSettings();
  };

  return (
    <main className="home-page-container">
      {/* Background Ambient Aura */}
      <div className="home-ambient-glow" aria-hidden="true" />

      <section className="home-stage-wrapper">
        {/* Storybook Hero Frame */}
        <div className="splash-frame-card">
          {/* Main Splash Image with Precise Overlay */}
          <div className="splash-art-container">
            <img
              src="/images/splash.png"
              alt="Chini and Mini's Magical Adventure - Chini and Mini running joyfully in a magical kingdom with castle, rainbow, and friendly animal companions"
              className="splash-hero-image"
              loading="eager"
            />

            {/* Interactive Overlay calibrated over the baked-in button */}
            <InteractiveStartOverlay onExplore={handleExplore} />
          </div>

          {/* Mobile Direct Action Bar (Only shows on mobile for optimal thumb reach) */}
          <div className="mobile-action-tray">
            <button
              onClick={handleExplore}
              className="magical-button-primary mobile-explore-btn"
              aria-label="Explore World - View all games"
            >
              <Compass size={22} className="mobile-compass-icon" aria-hidden="true" />
              <span>EXPLORE WORLD</span>
              <Sparkles size={18} aria-hidden="true" />
            </button>

            <div className="mobile-secondary-actions">
              <button
                onClick={handleMessage}
                className="nav-pill-btn accent-rose mobile-quick-btn"
                aria-label="Read Special Message for Chini & Mini"
              >
                <Heart size={18} color="#e11d48" aria-hidden="true" />
                <span>Special Note</span>
              </button>
              <button
                onClick={handleSettings}
                className="nav-pill-btn mobile-quick-btn"
                aria-label="Open Settings"
              >
                <Settings size={18} aria-hidden="true" />
                <span>Settings</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .home-page-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 16px 20px 24px;
          position: relative;
          background: linear-gradient(
            180deg,
            #dbeafe 0%,
            #e0f2fe 30%,
            #fef3c7 75%,
            #fed7aa 100%
          );
          min-height: calc(100vh - 65px);
          overflow: hidden;
        }

        .home-ambient-glow {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 50% 10%, rgba(254, 240, 138, 0.45) 0%, transparent 60%),
            radial-gradient(circle at 10% 40%, rgba(244, 114, 182, 0.25) 0%, transparent 50%),
            radial-gradient(circle at 90% 40%, rgba(56, 189, 248, 0.25) 0%, transparent 50%);
          pointer-events: none;
        }

        .home-stage-wrapper {
          width: 100%;
          max-width: 1200px;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10;
        }

        .splash-frame-card {
          width: 100%;
          max-width: 1140px;
          background: #ffffff;
          border-radius: var(--radius-lg);
          padding: 12px;
          box-shadow:
            0 20px 40px -15px rgba(30, 27, 75, 0.22),
            0 0 0 3px #fef08a,
            0 0 0 6px #7c3aed;
          position: relative;
          transition: box-shadow 0.3s ease;
        }

        .splash-art-container {
          position: relative;
          width: 100%;
          border-radius: calc(var(--radius-lg) - 4px);
          overflow: hidden;
          /* Matches the 1672 x 941 native aspect ratio (1.7768) */
          aspect-ratio: 1672 / 941;
          background-color: #38bdf8;
          box-shadow: inset 0 0 12px rgba(0, 0, 0, 0.15);
        }

        .splash-hero-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          user-select: none;
          -webkit-user-drag: none;
        }

        /* Mobile Action Tray: Hidden on desktop, visible on mobile */
        .mobile-action-tray {
          display: none;
          flex-direction: column;
          gap: 12px;
          padding: 16px 8px 4px;
        }

        .mobile-explore-btn {
          width: 100%;
          min-height: 52px;
          font-size: 1.15rem;
        }

        .mobile-compass-icon {
          animation: sparkleSpin 6s linear infinite;
        }

        .mobile-secondary-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
        }

        .mobile-quick-btn {
          flex: 1;
          font-size: 0.9rem;
        }

        /* Responsive Breakpoints */
        @media (max-width: 768px) {
          .home-page-container {
            padding: 12px 14px 20px;
          }
          .splash-frame-card {
            padding: 8px;
            border-radius: var(--radius-md);
            box-shadow:
              0 14px 30px -10px rgba(30, 27, 75, 0.2),
              0 0 0 2px #fef08a,
              0 0 0 4px #7c3aed;
          }
          .splash-art-container {
            border-radius: calc(var(--radius-md) - 2px);
          }
          .mobile-action-tray {
            display: flex;
          }
        }

        @media (max-width: 480px) {
          .home-page-container {
            padding: 8px 10px 16px;
          }
          .splash-frame-card {
            padding: 6px;
          }
          .mobile-explore-btn {
            font-size: 1.05rem;
          }
        }
      `}</style>
    </main>
  );
}
