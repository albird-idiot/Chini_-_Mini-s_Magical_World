import React, { useEffect } from 'react';
import { Heart, X, Sparkles, Feather } from 'lucide-react';
import { specialMessageData } from '../data/specialMessage';
import { soundManager } from '../utils/audio';

export default function SpecialMessageModal({ isOpen, onClose }) {
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
      aria-labelledby="special-message-title"
    >
      <div className="message-modal-container">
        {/* Storybook Parchment Scroll */}
        <div className="parchment-scroll">
          {/* Decorative Corner Seals */}
          <div className="parchment-seal seal-tl" aria-hidden="true">🌸</div>
          <div className="parchment-seal seal-tr" aria-hidden="true">✨</div>
          <div className="parchment-seal seal-bl" aria-hidden="true">🧸</div>
          <div className="parchment-seal seal-br" aria-hidden="true">🌈</div>

          <button
            onClick={handleClose}
            className="message-close-floating"
            aria-label="Close Special Message"
          >
            <X size={22} />
          </button>

          {/* Letter Header */}
          <div className="parchment-header">
            <div className="header-heart-icon" aria-hidden="true">
              <Heart size={36} fill="#f43f5e" color="#e11d48" />
            </div>
            <h2 id="special-message-title" className="parchment-title">
              {specialMessageData.title}
            </h2>
            <p className="parchment-subtitle">{specialMessageData.subtitle}</p>
          </div>

          <div className="parchment-divider" aria-hidden="true">
            <span>✨</span>
            <span className="divider-line" />
            <span>💖</span>
            <span className="divider-line" />
            <span>✨</span>
          </div>

          {/* Letter Body */}
          <div className="parchment-content">
            <p className="parchment-salutation">{specialMessageData.salutation}</p>
            {specialMessageData.paragraphs.map((p, index) => (
              <p key={index} className="parchment-paragraph">
                {p}
              </p>
            ))}
          </div>

          {/* Letter Sign-off & Stamps */}
          <div className="parchment-footer">
            <div className="sign-off-block">
              <p className="sign-off-text">{specialMessageData.signOff}</p>
              <p className="author-signature">
                <Feather size={18} className="feather-icon" aria-hidden="true" />
                <span>{specialMessageData.author}</span>
              </p>
              <p className="date-stamp">{specialMessageData.dateStamp}</p>
            </div>

            <div className="stamps-row" aria-label="Decorative stickers">
              {specialMessageData.stamps.map((stamp, idx) => (
                <span key={idx} className="story-stamp" aria-hidden="true">
                  {stamp}
                </span>
              ))}
            </div>
          </div>

          <div className="message-modal-action-bar">
            <button
              type="button"
              onClick={handleClose}
              className="magical-button-primary close-message-btn"
            >
              <span>Keep Exploring! ✨</span>
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .message-modal-container {
          max-width: 680px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          animation: popIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .parchment-scroll {
          background: #fffdf5;
          background-image:
            radial-gradient(#fde68a 1px, transparent 1px),
            radial-gradient(#fed7aa 1px, #fffdf5 1px);
          background-size: 28px 28px;
          background-position: 0 0, 14px 14px;
          border: 4px solid #fcd34d;
          border-radius: var(--radius-lg);
          padding: 36px 32px 28px;
          box-shadow:
            0 0 0 4px #b45309,
            0 25px 50px -12px rgba(30, 27, 75, 0.4),
            inset 0 0 40px rgba(251, 191, 36, 0.2);
          position: relative;
        }

        .message-close-floating {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #fef3c7;
          border: 2px solid #f59e0b;
          color: #92400e;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
          box-shadow: 0 2px 6px rgba(0,0,0,0.1);
          z-index: 10;
        }

        .message-close-floating:hover {
          background: #fee2e2;
          border-color: #ef4444;
          color: #b91c1c;
          transform: rotate(90deg) scale(1.05);
        }

        .parchment-seal {
          position: absolute;
          font-size: 1.5rem;
          line-height: 1;
          user-select: none;
          pointer-events: none;
        }

        .seal-tl { top: 12px; left: 14px; }
        .seal-tr { top: 12px; right: 68px; }
        .seal-bl { bottom: 14px; left: 16px; }
        .seal-br { bottom: 14px; right: 16px; }

        .parchment-header {
          text-align: center;
          margin-bottom: 16px;
        }

        .header-heart-icon {
          display: inline-block;
          margin-bottom: 8px;
          animation: gentleFloat 2.5s ease-in-out infinite;
        }

        .parchment-title {
          font-size: clamp(1.3rem, 2.8vw, 1.85rem);
          color: #831843;
          margin-bottom: 4px;
        }

        .parchment-subtitle {
          font-size: 0.95rem;
          color: #9d174d;
          font-weight: 600;
        }

        .parchment-divider {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin: 16px 0 24px;
        }

        .divider-line {
          height: 2px;
          width: 80px;
          background: linear-gradient(90deg, transparent, #f59e0b, transparent);
        }

        .parchment-content {
          font-size: 1.08rem;
          line-height: 1.7;
          color: #3b2818;
          font-family: var(--font-body);
        }

        .parchment-salutation {
          font-weight: 700;
          font-size: 1.25rem;
          color: #78350f;
          margin-bottom: 12px;
          font-family: var(--font-display);
        }

        .parchment-paragraph {
          margin-bottom: 14px;
          text-indent: 1em;
        }

        .parchment-footer {
          margin-top: 28px;
          padding-top: 20px;
          border-top: 2px dashed #fcd34d;
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .sign-off-block {
          text-align: left;
        }

        .sign-off-text {
          font-size: 0.95rem;
          color: #78350f;
          font-style: italic;
        }

        .author-signature {
          font-family: var(--font-display);
          font-size: 1.45rem;
          font-weight: 700;
          color: #991b1b;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 4px;
        }

        .feather-icon {
          color: #b45309;
        }

        .date-stamp {
          font-size: 0.8rem;
          color: #92400e;
          font-weight: 600;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .stamps-row {
          display: flex;
          gap: 8px;
          background: #fef3c7;
          padding: 8px 12px;
          border-radius: var(--radius-full);
          border: 1.5px solid #fde68a;
        }

        .story-stamp {
          font-size: 1.3rem;
          transition: transform 0.2s ease;
        }

        .story-stamp:hover {
          transform: scale(1.3) rotate(10deg);
        }

        .message-modal-action-bar {
          margin-top: 24px;
          display: flex;
          justify-content: center;
        }

        .close-message-btn {
          font-size: 1.05rem;
          padding: 10px 32px;
        }

        @media (max-width: 540px) {
          .parchment-scroll {
            padding: 24px 18px 20px;
          }
          .parchment-paragraph {
            text-indent: 0;
            font-size: 0.98rem;
          }
          .parchment-seal {
            display: none;
          }
          .parchment-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
