import React, { useState, useEffect } from 'react';
import HeaderNav from './components/HeaderNav';
import Home from './pages/Home';
import Explore from './pages/Explore';
import SettingsModal from './components/SettingsModal';
import SpecialMessageModal from './components/SpecialMessageModal';
import { settingsManager } from './utils/settings';

export default function App() {
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash === '#explore') {
      return 'explore';
    }
    return 'home';
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMessageOpen, setIsMessageOpen] = useState(false);
  const [settings, setSettings] = useState(settingsManager.get());

  // Listen to hash changes for standard browser navigation & back button
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash === 'explore') {
        setCurrentPage('explore');
      } else {
        setCurrentPage('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Listen to global settings updates
  useEffect(() => {
    return settingsManager.subscribe((newSettings) => {
      setSettings(newSettings);
    });
  }, []);

  const navigateTo = (page) => {
    setCurrentPage(page);
    window.location.hash = page === 'home' ? '' : page;
    window.scrollTo({ top: 0, behavior: settings.reducedMotion ? 'auto' : 'smooth' });
  };

  const handleToggleSound = () => {
    settingsManager.set({ soundEffects: !settings.soundEffects });
  };

  return (
    <div className="app-layout">
      {/* Top Header Navigation */}
      <HeaderNav
        currentPage={currentPage}
        onNavigate={navigateTo}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenMessage={() => setIsMessageOpen(true)}
        soundEnabled={settings.soundEffects}
        onToggleSound={handleToggleSound}
      />

      {/* Main Page Content */}
      {currentPage === 'home' ? (
        <Home
          onNavigate={navigateTo}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenMessage={() => setIsMessageOpen(true)}
        />
      ) : (
        <Explore onNavigate={navigateTo} />
      )}

      {/* Global Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <SpecialMessageModal
        isOpen={isMessageOpen}
        onClose={() => setIsMessageOpen(false)}
      />

      {/* Gentle Footer */}
      <footer className="global-site-footer" role="contentinfo">
        <p className="footer-tagline">
          Chini & Mini's Magical World 🌈 Dedicated with endless love to two curious explorers
        </p>
        <p className="footer-credit">
          Developed by Albird-Idiot | SUST CSE
        </p>
      </footer>

      <style>{`
        .app-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .global-site-footer {
          padding: 16px 14px;
          text-align: center;
          background: #ffffff;
          border-top: 1px solid #e2e8f0;
          font-size: 0.85rem;
          color: #64748b;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .footer-tagline {
          font-weight: 600;
          color: #475569;
        }

        .footer-credit {
          font-size: 0.82rem;
          font-weight: 700;
          color: #7c3aed;
          letter-spacing: 0.02em;
        }
      `}</style>
    </div>
  );
}
