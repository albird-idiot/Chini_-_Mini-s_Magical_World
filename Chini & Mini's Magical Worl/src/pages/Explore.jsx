import React, { useState } from 'react';
import { games } from '../data/games';
import GameCard from '../components/GameCard';
import GameDetailModal from '../components/GameDetailModal';
import { Compass, Sparkles, ArrowLeft } from 'lucide-react';
import { soundManager } from '../utils/audio';

export default function Explore({ onNavigate }) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeGame, setActiveGame] = useState(null);

  const categories = ['All', 'Runner', 'Adventure', 'Classic Game', 'Puzzle Game'];

  const filteredGames =
    selectedCategory === 'All'
      ? games
      : games.filter(
          (g) => g.category.toLowerCase() === selectedCategory.toLowerCase()
        );

  const handleCategoryChange = (cat) => {
    soundManager.playPop();
    setSelectedCategory(cat);
  };

  const handleBackHome = () => {
    soundManager.playPop();
    onNavigate('home');
  };

  const handleSelectGame = (game) => {
    setActiveGame(game);
  };

  const handleCloseDetail = () => {
    setActiveGame(null);
  };

  const handleLaunchGame = (game) => {
    if (game.launchPath) {
      window.location.href = game.launchPath;
    }
  };

  return (
    <main className="explore-page-container">
      <div className="explore-content-wrapper">
        {/* Navigation & Header */}
        <header className="explore-header-section">
          <button
            onClick={handleBackHome}
            className="nav-pill-btn explore-back-btn"
            aria-label="Back to Home Splash"
          >
            <ArrowLeft size={18} />
            <span>Back to Home</span>
          </button>

          <div className="explore-title-group">
            <h1 className="explore-main-title">
              <span>Choose Your Adventure!</span>
              <span className="title-star" aria-hidden="true">
                ✨
              </span>
            </h1>
            <p className="explore-subtitle">
              Playful storybook worlds created with love especially for Chini and Mini
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="filter-chips-row" role="tablist" aria-label="Game Categories">
            {categories.map((cat) => (
              <button
                key={cat}
                role="tab"
                aria-selected={selectedCategory === cat}
                onClick={() => handleCategoryChange(cat)}
                className={`filter-chip ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat === 'All' && '🌟 '}
                {cat === 'Runner' && '🏃‍♂️ '}
                {cat === 'Adventure' && '🐍 '}
                {cat === 'Classic Game' && '✊ '}
                {cat === 'Puzzle Game' && '🎲 '}
                {cat} {cat !== 'All' && !cat.includes('Game') ? 'Games' : ''}
              </button>
            ))}
          </div>
        </header>

        {/* Game Catalogue Grid */}
        <section className="games-grid-section" aria-label="Game Catalogue">
          <div className="games-grid">
            {filteredGames.map((game) => (
              <GameCard key={game.id} game={game} onSelect={handleSelectGame} />
            ))}

            {/* Upcoming Adventure Teaser Card */}
            <div className="game-card teaser-card" aria-label="Coming Soon - More magical games by Kakai">
              <div className="teaser-content">
                <div className="teaser-icon-wrapper" aria-hidden="true">
                  <Sparkles size={40} className="teaser-icon" />
                </div>
                <h3 className="teaser-title">More Adventures Ahead! ✨</h3>
                <p className="teaser-desc">
                  Kakai is crafting new surprise games. Have an idea? New magical browser games will be added anytime!
                </p>
                <div className="teaser-badge">
                  <Sparkles size={14} /> Coming Soon ✨
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Game Detail Modal */}
      <GameDetailModal
        game={activeGame}
        onClose={handleCloseDetail}
        onLaunchGame={handleLaunchGame}
      />

      <style>{`
        .explore-page-container {
          flex: 1;
          background: linear-gradient(180deg, #f0fdf4 0%, #fdf2f8 50%, #eff6ff 100%);
          padding: 24px 20px 48px;
          min-height: calc(100vh - 65px);
        }

        .explore-content-wrapper {
          max-width: 1140px;
          margin: 0 auto;
        }

        .explore-header-section {
          text-align: center;
          margin-bottom: 32px;
          position: relative;
        }

        .explore-back-btn {
          margin-bottom: 16px;
        }

        .explore-title-group {
          margin-bottom: 20px;
        }

        .explore-main-title {
          font-size: clamp(1.8rem, 4vw, 2.6rem);
          color: var(--color-purple-dark);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin-bottom: 8px;
        }

        .title-star {
          animation: gentleFloat 2.5s ease-in-out infinite;
        }

        .explore-subtitle {
          font-size: 1.08rem;
          color: #4b5563;
          max-width: 600px;
          margin: 0 auto;
        }

        .filter-chips-row {
          display: flex;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .filter-chip {
          padding: 8px 18px;
          border-radius: var(--radius-full);
          background: #ffffff;
          border: 2px solid #e2e8f0;
          color: #475569;
          font-weight: 700;
          font-size: 0.95rem;
          box-shadow: 0 2px 6px rgba(0,0,0,0.05);
          transition: all 0.18s ease;
        }

        .filter-chip:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          transform: translateY(-2px);
        }

        .filter-chip.active {
          background: #7c3aed;
          border-color: #6d28d9;
          color: #ffffff;
          box-shadow: 0 4px 14px rgba(124, 58, 237, 0.3);
        }

        /* Games Grid */
        .games-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 24px;
        }

        /* Teaser Card */
        .teaser-card {
          border: 3px dashed #cbd5e1;
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 32px 24px;
          box-shadow: none;
        }

        .teaser-card:hover {
          border-color: #818cf8;
          background: #ffffff;
        }

        .teaser-content {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .teaser-icon-wrapper {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: #ede9fe;
          color: #7c3aed;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }

        .teaser-icon {
          animation: sparkleSpin 8s linear infinite;
        }

        .teaser-title {
          font-size: 1.25rem;
          color: var(--color-purple-dark);
          margin-bottom: 8px;
        }

        .teaser-desc {
          font-size: 0.9rem;
          color: #64748b;
          line-height: 1.5;
          margin-bottom: 16px;
          max-width: 280px;
        }

        .teaser-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          border-radius: var(--radius-full);
          background: #fef3c7;
          border: 1.5px solid #fde68a;
          color: #92400e;
          font-size: 0.82rem;
          font-weight: 700;
        }

        @media (max-width: 640px) {
          .explore-page-container {
            padding: 16px 14px 36px;
          }
          .games-grid {
            grid-template-columns: 1fr;
            gap: 18px;
          }
        }
      `}</style>
    </main>
  );
}
