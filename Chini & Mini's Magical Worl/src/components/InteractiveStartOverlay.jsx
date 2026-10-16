import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function InteractiveStartOverlay({ onExplore }) {
  const handleClick = (e) => {
    e.preventDefault();
    soundManager.playChime();
    onExplore();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <div className="start-overlay-anchor" aria-label="Explore World Action">
      <button
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className="start-overlay-button"
        aria-label="Explore World - Press to open the game catalogue"
        title="Click to enter Chini & Mini's Magical Game World!"
      >
        <span className="star-icon star-left" aria-hidden="true">★</span>
        <span className="start-btn-label">EXPLORE WORLD</span>
        <span className="star-icon star-right" aria-hidden="true">★</span>
      </button>

      <style>{`
        /* Positioned precisely over the baked-in 'PRESS START' capsule */
        .start-overlay-anchor {
          position: absolute;
          left: 50%;
          top: 85.5%;
          transform: translate(-50%, -50%);
          width: 25.8%;
          aspect-ratio: 4.2 / 1;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 20;
        }

        .start-overlay-button {
          width: 100%;
          height: 100%;
          border-radius: 9999px;
          border: 3.5px solid #fbbf24;
          background: radial-gradient(
            ellipse at 50% 30%,
            #4f46e5 0%,
            #3730a3 40%,
            #1e1b4b 85%,
            #0f172a 100%
          );
          box-shadow:
            0 0 0 2px #d97706,
            0 0 20px rgba(251, 191, 36, 0.45),
            0 10px 25px rgba(15, 23, 42, 0.7),
            inset 0 3px 6px rgba(255, 255, 255, 0.45),
            inset 0 -3px 6px rgba(0, 0, 0, 0.6);
          color: #fef08a;
          font-family: var(--font-display);
          font-size: clamp(0.75rem, 1.7vw, 1.45rem);
          font-weight: 800;
          letter-spacing: 0.08em;
          text-shadow:
            0 2px 4px rgba(0, 0, 0, 0.9),
            0 0 10px rgba(250, 204, 21, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5em;
          cursor: pointer;
          transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1),
                      box-shadow 0.2s ease,
                      filter 0.2s ease;
          animation: buttonGlowPulse 2.8s ease-in-out infinite;
        }

        .start-overlay-button:hover,
        .start-overlay-button:focus-visible {
          transform: scale(1.05);
          filter: brightness(1.15);
          box-shadow:
            0 0 0 3px #fef08a,
            0 0 30px rgba(251, 191, 36, 0.75),
            0 14px 32px rgba(15, 23, 42, 0.8),
            inset 0 3px 8px rgba(255, 255, 255, 0.7);
        }

        .start-overlay-button:active {
          transform: scale(0.97);
        }

        .star-icon {
          color: #fbbf24;
          font-size: 1.1em;
          line-height: 1;
          filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.8));
        }

        .star-left {
          animation: sparkleSpin 4s linear infinite;
        }

        .star-right {
          animation: sparkleSpin 4s linear infinite reverse;
        }

        @keyframes buttonGlowPulse {
          0%, 100% {
            box-shadow:
              0 0 0 2px #d97706,
              0 0 16px rgba(251, 191, 36, 0.35),
              0 10px 25px rgba(15, 23, 42, 0.7),
              inset 0 3px 6px rgba(255, 255, 255, 0.45);
          }
          50% {
            box-shadow:
              0 0 0 3px #fbbf24,
              0 0 26px rgba(251, 191, 36, 0.65),
              0 12px 30px rgba(15, 23, 42, 0.75),
              inset 0 3px 8px rgba(255, 255, 255, 0.6);
          }
        }

        /* Responsive Mobile Behavior: Ensure touch target is at least 48px */
        @media (max-width: 640px) {
          .start-overlay-anchor {
            width: 32%;
            min-height: 44px;
          }
          .start-overlay-button {
            font-size: 0.75rem;
            letter-spacing: 0.04em;
            border-width: 2.5px;
          }
        }

        @media (max-width: 440px) {
          .start-overlay-anchor {
            width: 36%;
          }
          .start-overlay-button {
            font-size: 0.65rem;
            gap: 0.3em;
          }
        }
      `}</style>
    </div>
  );
}
