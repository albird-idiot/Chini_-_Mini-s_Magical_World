/**
 * Central Game Catalogue
 * =======================
 * This file is the single source of truth for all games in Chini & Mini's Magical World.
 *
 * Ordered as:
 * 1. Pixel Runner
 * 2. Snake Adventure
 * 3. Rock Paper Scissors
 * 4. GUESS n WIN
 */

export const games = [
  {
    id: 'pixel-runner',
    title: 'Pixel Runner',
    category: 'Runner',
    tagline: 'Run, jump, and dodge obstacles in a retro pixel adventure!',
    description:
      'Dash through a retro pixel landscape! Jump over sneaky snails and duck under buzzing flies. How long can you survive to set a new highest score?',
    thumbnail: '/images/thumbnails/pixel-runner.png',
    fallbackEmoji: '🏃‍♂️',
    themeColor: '#3b82f6',
    status: 'playable',
    launchPath: '/games/pixel-runner/index.html',
    badgeText: 'Play Now',
    plannedControls: [
      { key: 'Spacebar / Up Arrow / W', action: 'Jump' },
      { key: 'Tap Screen / Jump Button', action: 'Mobile touch jump' }
    ],
    features: [
      'Authentic retro pixel art & music',
      'Smooth 60 FPS jump physics',
      'Snail and Fly obstacle dodging',
      'Persistent high score tracking'
    ],
    developerNote: 'Recreated from Pygame source into high-performance HTML5 Canvas with original assets.'
  },
  {
    id: 'snake-adventure',
    title: 'Snake Adventure',
    category: 'Adventure',
    tagline: 'Guide the friendly rainbow snake to sweet treats in the garden!',
    description:
      'Slither through sunny meadows and blooming flowerbeds! Guide a cheerful, smiling green snake to collect juicy magical apples, grow longer, and beat your highest score record.',
    thumbnail: '/images/thumbnails/snake-adventure.png',
    fallbackEmoji: '🐍',
    themeColor: '#10b981',
    status: 'playable',
    launchPath: '/games/snake-adventure/index.html',
    badgeText: 'Play Now',
    plannedControls: [
      { key: 'Arrow Keys / WASD', action: 'Move Up, Down, Left, Right' },
      { key: 'Spacebar / P', action: 'Pause / Resume Adventure' },
      { key: 'Mobile Touch D-Pad / Swipe', action: 'Steer on phone or tablet' }
    ],
    features: [
      'Classic grid movement with speed progression',
      'Juicy magical apples (+10 score per apple)',
      'Persistent highest score saved in localStorage',
      'Keyboard and touch-friendly controls'
    ],
    developerNote: 'Recreated from Python Turtle into responsive HTML5 Canvas with localStorage persistence.'
  },
  {
    id: 'rock-paper-scissors',
    title: 'Rock Paper Scissors',
    category: 'Classic Game',
    tagline: 'Choose your move and challenge the computer!',
    description:
      'Choose your move and challenge the computer! Test your luck and quick wits in this timeless classic game of Rock, Paper, Scissors with live score tracking.',
    thumbnail: '/images/thumbnails/rock-paper-scissors.png',
    fallbackEmoji: '✊',
    themeColor: '#4f46e5',
    status: 'playable',
    launchPath: '/games/rock-paper-scissors/index.html',
    badgeText: 'Play Now',
    plannedControls: [
      { key: 'Tap / Click', action: 'Choose Rock, Paper, or Scissors' },
      { key: 'Reset Button', action: 'Reset Wins, Losses, and Ties' }
    ],
    features: [
      'Instant classic gameplay',
      'Computer move randomization',
      'Persistent score tracking (Wins, Losses, Ties)',
      'Clear return link to Explore World'
    ],
    developerNote: 'Fully integrated HTML/CSS/JS game running directly in browser.'
  },
  {
    id: 'guess-n-win',
    title: 'GUESS n WIN',
    category: 'Puzzle Game',
    tagline: 'Find the hidden number from 1 to 100 using clues after every guess.',
    description:
      'Find the hidden number from 1 to 100 using clues after every guess! Test your quick deduction skills, follow the higher and lower clues, and see how few attempts you need to win.',
    thumbnail: '/images/thumbnails/guess-n-win.png',
    fallbackEmoji: '🎲',
    themeColor: '#7c3aed',
    status: 'playable',
    launchPath: '/games/guess-n-win/index.html',
    badgeText: 'Play Now',
    plannedControls: [
      { key: 'Number Input / Keypad', action: 'Type your guess (1–100)' },
      { key: 'Enter / Guess Button', action: 'Submit guess' }
    ],
    features: [
      'Random secret number between 1 and 100',
      'Helpful too-high and too-low clues',
      'Fewest-attempts record saved in localStorage',
      'Total games won tracking'
    ],
    developerNote: 'Recreated from C source by Albird-Idiot (SUST CSE) into an interactive browser game.'
  }
];

/**
 * Helper to fetch a game by ID
 */
export function getGameById(id) {
  return games.find((g) => g.id === id);
}

/**
 * Filter games by category
 */
export function getGamesByCategory(category = 'All') {
  if (category === 'All') return games;
  return games.filter((g) => g.category.toLowerCase() === category.toLowerCase());
}
