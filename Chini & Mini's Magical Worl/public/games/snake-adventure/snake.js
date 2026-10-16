/**
 * Snake Adventure - Chini & Mini's Magical World
 * ===============================================
 * Browser Canvas implementation of the classic Snake game.
 * Features grid movement, speed progression, localStorage persistence,
 * touch D-Pad & swipe support, and storybook visuals.
 */

(function () {
  'use strict';

  // --- Configuration ---
  const GRID_SIZE = 20; // 20x20 grid
  const CANVAS_SIZE = 600; // 600x600 logical internal resolution
  const CELL_SIZE = CANVAS_SIZE / GRID_SIZE; // 30px per cell

  const INITIAL_DELAY = 270; // ms per tick (~3.7 cells/sec - calm, friendly start for young players)
  const SPEED_STEP = 3; // ms decrease per food
  const MIN_DELAY = 120; // safe child-friendly speed limit (approx 8.3 cells/sec maximum)

  const STORAGE_KEY = 'chiniMinisSnakeBestScore';
  const FALLBACK_KEY = 'chini_mini_snake_high_score';

  // --- Directions ---
  const DIRS = {
    UP: { x: 0, y: -1, name: 'up' },
    DOWN: { x: 0, y: 1, name: 'down' },
    LEFT: { x: -1, y: 0, name: 'left' },
    RIGHT: { x: 1, y: 0, name: 'right' }
  };

  // --- Game State Enum ---
  const STATE = {
    READY: 'ready',
    RUNNING: 'running',
    PAUSED: 'paused',
    GAME_OVER: 'game_over'
  };

  // --- Sound Synthesizer (Web Audio API) ---
  class SoundEffects {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playEat() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(880, now + 0.1);

        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } catch {}
    }

    playRecord() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
        notes.forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const t = now + idx * 0.08;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, t);
          gain.gain.setValueAtTime(0.15, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.25);
        });
      } catch {}
    }

    playGameOver() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.3);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.3);
      } catch {}
    }
  }

  // --- Persistence Manager ---
  class PersistenceManager {
    static getHighestScore() {
      try {
        const val = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(FALLBACK_KEY);
        if (val !== null) {
          const parsed = parseInt(val, 10);
          if (!isNaN(parsed) && parsed >= 0) {
            return parsed;
          }
        }
      } catch (err) {
        console.warn('localStorage read error:', err);
      }
      return 0;
    }

    static saveHighestScore(score) {
      if (typeof score !== 'number' || score < 0) return;
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
        localStorage.setItem(FALLBACK_KEY, String(score));
      } catch (err) {
        console.warn('localStorage write error:', err);
      }
    }
  }

  // --- Particle Sparkles System ---
  class ParticleSystem {
    constructor() {
      this.particles = [];
    }

    spawn(x, y, color = '#facc15') {
      for (let i = 0; i < 8; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 2.5;
        this.particles.push({
          x: x * CELL_SIZE + CELL_SIZE / 2,
          y: y * CELL_SIZE + CELL_SIZE / 2,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          life: 1.0,
          color
        });
      }
    }

    update() {
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.05;
        if (p.life <= 0) {
          this.particles.splice(i, 1);
        }
      }
    }

    draw(ctx) {
      ctx.save();
      for (const p of this.particles) {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3.5 * p.life, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  }

  // --- Snake Game Main Class ---
  class SnakeAdventure {
    constructor() {
      this.canvas = document.getElementById('game-canvas');
      this.ctx = this.canvas.getContext('2d');

      // Set internal rendering buffer
      this.canvas.width = CANVAS_SIZE;
      this.canvas.height = CANVAS_SIZE;

      // Subsystems
      this.sound = new SoundEffects();
      this.particles = new ParticleSystem();

      // UI Elements
      this.currentScoreEl = document.getElementById('current-score');
      this.bestScoreEl = document.getElementById('best-score');
      this.readyOverlay = document.getElementById('ready-overlay');
      this.pauseOverlay = document.getElementById('pause-overlay');
      this.gameOverOverlay = document.getElementById('gameover-overlay');
      this.finalScoreEl = document.getElementById('final-score');
      this.recordBadgeEl = document.getElementById('new-record-badge');
      this.soundToggleBtn = document.getElementById('sound-toggle-btn');
      this.pauseBtn = document.getElementById('pause-btn');

      // State
      this.state = STATE.READY;
      this.currentScore = 0;
      this.highestScore = PersistenceManager.getHighestScore();
      this.initialHighestScoreOnGameStart = this.highestScore;
      this.hasAchievedNewRecord = false;

      this.currentDelay = INITIAL_DELAY;
      this.lastTickTime = 0;
      this.animationFrameId = null;

      // Snake components
      this.snake = [];
      this.currentDir = DIRS.RIGHT;
      this.nextDir = DIRS.RIGHT;
      this.inputQueue = [];
      this.food = { x: 10, y: 5 };

      // Initialize UI and listeners
      this.updateScoreboard();
      this.initEventListeners();
      this.resetGame();

      // Start render loop
      this.loop = this.loop.bind(this);
      this.animationFrameId = requestAnimationFrame(this.loop);
    }

    updateScoreboard() {
      if (this.currentScoreEl) this.currentScoreEl.textContent = this.currentScore;
      if (this.bestScoreEl) this.bestScoreEl.textContent = this.highestScore;
    }

    resetGame() {
      // Start in the center of the 20x20 grid
      const startX = Math.floor(GRID_SIZE / 2);
      const startY = Math.floor(GRID_SIZE / 2);

      // Snake starts with head and 2 trailing body segments
      this.snake = [
        { x: startX, y: startY },
        { x: startX - 1, y: startY },
        { x: startX - 2, y: startY }
      ];

      this.currentDir = DIRS.RIGHT;
      this.nextDir = DIRS.RIGHT;
      this.inputQueue = [];
      this.currentScore = 0;
      this.currentDelay = INITIAL_DELAY;
      this.initialHighestScoreOnGameStart = this.highestScore;
      this.hasAchievedNewRecord = false;

      this.updateScoreboard();
      this.spawnFood();
    }

    spawnFood() {
      // Find empty grid cells
      const emptyCells = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          const isOccupied = this.snake.some((seg) => seg.x === x && seg.y === y);
          if (!isOccupied) {
            emptyCells.push({ x, y });
          }
        }
      }

      if (emptyCells.length === 0) {
        // Player filled the entire board!
        this.triggerGameOver(true);
        return;
      }

      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      this.food = emptyCells[randomIndex];
    }

    setDirection(newDir) {
      if (!newDir) return;

      // If in READY state, start immediately
      if (this.state === STATE.READY) {
        this.startGame();
      }

      // Check against the last planned direction (queued move or current direction)
      const lastPlannedDir = this.inputQueue.length > 0
        ? this.inputQueue[this.inputQueue.length - 1]
        : this.currentDir;

      // Prevent 180-degree immediate reversal or duplicate direction
      if (
        (lastPlannedDir === DIRS.UP && newDir === DIRS.DOWN) ||
        (lastPlannedDir === DIRS.DOWN && newDir === DIRS.UP) ||
        (lastPlannedDir === DIRS.LEFT && newDir === DIRS.RIGHT) ||
        (lastPlannedDir === DIRS.RIGHT && newDir === DIRS.LEFT) ||
        lastPlannedDir === newDir
      ) {
        return;
      }

      // Keep at most 2 moves queued so inputs stay responsive without excessive lag
      if (this.inputQueue.length < 2) {
        this.inputQueue.push(newDir);
      }
    }

    startGame() {
      this.state = STATE.RUNNING;
      this.readyOverlay.classList.add('hidden');
      this.pauseOverlay.classList.add('hidden');
      this.gameOverOverlay.classList.add('hidden');
      this.lastTickTime = performance.now();
      if (this.pauseBtn) this.pauseBtn.textContent = '⏸️ Pause';
    }

    togglePause() {
      if (this.state === STATE.RUNNING) {
        this.state = STATE.PAUSED;
        this.pauseOverlay.classList.remove('hidden');
        if (this.pauseBtn) this.pauseBtn.textContent = '▶️ Resume';
      } else if (this.state === STATE.PAUSED) {
        this.state = STATE.RUNNING;
        this.pauseOverlay.classList.add('hidden');
        this.lastTickTime = performance.now();
        if (this.pauseBtn) this.pauseBtn.textContent = '⏸️ Pause';
      }
    }

    triggerGameOver(isWin = false) {
      this.state = STATE.GAME_OVER;
      this.inputQueue = [];
      this.sound.playGameOver();

      if (this.finalScoreEl) this.finalScoreEl.textContent = this.currentScore;
      if (this.recordBadgeEl) {
        if (this.hasAchievedNewRecord) {
          this.recordBadgeEl.style.display = 'inline-flex';
        } else {
          this.recordBadgeEl.style.display = 'none';
        }
      }

      this.gameOverOverlay.classList.remove('hidden');
      if (this.pauseBtn) this.pauseBtn.textContent = '⏸️ Pause';
    }

    restart() {
      this.resetGame();
      this.startGame();
    }

    // --- Core Movement Tick ---
    tick() {
      if (this.inputQueue.length > 0) {
        this.currentDir = this.inputQueue.shift();
      }
      this.nextDir = this.currentDir;

      const head = this.snake[0];
      const newHead = {
        x: head.x + this.currentDir.x,
        y: head.y + this.currentDir.y
      };

      // 1. Boundary Collision Check
      if (
        newHead.x < 0 ||
        newHead.x >= GRID_SIZE ||
        newHead.y < 0 ||
        newHead.y >= GRID_SIZE
      ) {
        this.triggerGameOver();
        return;
      }

      // 2. Self Collision Check
      // Check collision with all segments except tail (since tail moves forward unless eating)
      const isEating = newHead.x === this.food.x && newHead.y === this.food.y;
      const collisionSegments = isEating ? this.snake : this.snake.slice(0, -1);
      const isSelfCollision = collisionSegments.some(
        (seg) => seg.x === newHead.x && seg.y === newHead.y
      );

      if (isSelfCollision) {
        this.triggerGameOver();
        return;
      }

      // 3. Move snake forward
      this.snake.unshift(newHead);

      // 4. Food Collection
      if (isEating) {
        this.currentScore += 10;
        this.sound.playEat();
        this.particles.spawn(this.food.x, this.food.y);

        // Bump animation on score
        if (this.currentScoreEl) {
          this.currentScoreEl.classList.remove('score-bump');
          void this.currentScoreEl.offsetWidth; // trigger reflow
          this.currentScoreEl.classList.add('score-bump');
        }

        // Check & update highest score
        if (this.currentScore > this.highestScore) {
          this.highestScore = this.currentScore;
          PersistenceManager.saveHighestScore(this.highestScore);

          if (!this.hasAchievedNewRecord && this.initialHighestScoreOnGameStart > 0) {
            this.hasAchievedNewRecord = true;
            this.sound.playRecord();
          } else if (!this.hasAchievedNewRecord && this.initialHighestScoreOnGameStart === 0) {
            this.hasAchievedNewRecord = true;
          }
        }

        this.updateScoreboard();

        // Speed progression: speed up by SPEED_STEP ms, capped at MIN_DELAY
        this.currentDelay = Math.max(
          MIN_DELAY,
          INITIAL_DELAY - Math.floor(this.currentScore / 10) * SPEED_STEP
        );

        this.spawnFood();
      } else {
        this.snake.pop(); // Remove tail segment
      }
    }

    // --- Main Rendering & Animation Loop ---
    loop(timestamp) {
      if (this.state === STATE.RUNNING) {
        const elapsed = timestamp - this.lastTickTime;
        if (elapsed >= this.currentDelay) {
          this.tick();
          this.lastTickTime = timestamp;
        }
      }

      this.particles.update();
      this.render();

      this.animationFrameId = requestAnimationFrame(this.loop);
    }

    // --- Canvas Rendering ---
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // 1. Draw Checkered Soft Meadow Background
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          ctx.fillStyle = (x + y) % 2 === 0 ? '#ecfdf5' : '#d1fae5';
          ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }
      }

      // 2. Draw Food (Juicy Red Apple with Leaf)
      this.drawFood(ctx, this.food.x, this.food.y);

      // 3. Draw Snake Body & Head
      this.drawSnake(ctx);

      // 4. Draw Particles
      this.particles.draw(ctx);
    }

    drawFood(ctx, gx, gy) {
      const cx = gx * CELL_SIZE + CELL_SIZE / 2;
      const cy = gy * CELL_SIZE + CELL_SIZE / 2;
      const r = CELL_SIZE * 0.4;

      ctx.save();
      // Apple body
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(cx, cy + 1, r, 0, Math.PI * 2);
      ctx.fill();

      // Apple border
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();

      // Apple highlight shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.beginPath();
      ctx.arc(cx - r * 0.35, cy - r * 0.3, r * 0.3, 0, Math.PI * 2);
      ctx.fill();

      // Green Leaf
      ctx.fillStyle = '#22c55e';
      ctx.beginPath();
      ctx.ellipse(cx + r * 0.45, cy - r * 0.8, r * 0.38, r * 0.22, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    drawSnake(ctx) {
      // Draw body segments (from tail to neck)
      for (let i = this.snake.length - 1; i >= 1; i--) {
        const seg = this.snake[i];
        const cx = seg.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = seg.y * CELL_SIZE + CELL_SIZE / 2;
        const r = CELL_SIZE * 0.42;

        ctx.save();
        ctx.fillStyle = '#34d399'; // Emerald lime
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#fef08a'; // Golden rim
        ctx.stroke();
        ctx.restore();
      }

      // Draw Head
      if (this.snake.length > 0) {
        const head = this.snake[0];
        const cx = head.x * CELL_SIZE + CELL_SIZE / 2;
        const cy = head.y * CELL_SIZE + CELL_SIZE / 2;
        const r = CELL_SIZE * 0.46;

        ctx.save();

        // Head Base Circle
        ctx.fillStyle = '#10b981';
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();

        ctx.lineWidth = 3;
        ctx.strokeStyle = '#fbbf24';
        ctx.stroke();

        // Direction offset for eye pupils
        let eyeDx = 0;
        let eyeDy = 0;
        if (this.currentDir === DIRS.UP) eyeDy = -3;
        if (this.currentDir === DIRS.DOWN) eyeDy = 3;
        if (this.currentDir === DIRS.LEFT) eyeDx = -3;
        if (this.currentDir === DIRS.RIGHT) eyeDx = 3;

        // Eye positions relative to center
        let leftEyeX = cx - 5 + eyeDx * 0.5;
        let leftEyeY = cy - 4 + eyeDy * 0.5;
        let rightEyeX = cx + 5 + eyeDx * 0.5;
        let rightEyeY = cy - 4 + eyeDy * 0.5;

        if (this.currentDir === DIRS.LEFT || this.currentDir === DIRS.RIGHT) {
          leftEyeY = cy - 5;
          rightEyeY = cy + 5;
          leftEyeX = cx + eyeDx;
          rightEyeX = cx + eyeDx;
        }

        // Draw Eye Whites
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(leftEyeX, leftEyeY, 3.8, 0, Math.PI * 2);
        ctx.arc(rightEyeX, rightEyeY, 3.8, 0, Math.PI * 2);
        ctx.fill();

        // Draw Pupils
        ctx.fillStyle = '#0f172a';
        ctx.beginPath();
        ctx.arc(leftEyeX + eyeDx * 0.4, leftEyeY + eyeDy * 0.4, 2, 0, Math.PI * 2);
        ctx.arc(rightEyeX + eyeDx * 0.4, rightEyeY + eyeDy * 0.4, 2, 0, Math.PI * 2);
        ctx.fill();

        // Blushing Rosy Cheeks
        ctx.fillStyle = 'rgba(244, 114, 182, 0.6)';
        ctx.beginPath();
        ctx.arc(cx - 8, cy + 3, 2.5, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy + 3, 2.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }
    }

    // --- Input and Event Listeners ---
    initEventListeners() {
      // 1. Keyboard Controls
      window.addEventListener('keydown', (e) => {
        // Prevent default scrolling for Arrow keys and Space
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
          e.preventDefault();
        }

        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            this.setDirection(DIRS.UP);
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            this.setDirection(DIRS.DOWN);
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            this.setDirection(DIRS.LEFT);
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            this.setDirection(DIRS.RIGHT);
            break;
          case ' ':
          case 'p':
          case 'P':
            this.togglePause();
            break;
          case 'Enter':
            if (this.state === STATE.READY) this.startGame();
            if (this.state === STATE.GAME_OVER) this.restart();
            break;
        }
      });

      // 2. Buttons in Overlays
      const startBtn = document.getElementById('start-btn');
      if (startBtn) startBtn.addEventListener('click', () => this.startGame());

      const restartBtn = document.getElementById('restart-btn');
      if (restartBtn) restartBtn.addEventListener('click', () => this.restart());

      const resumeBtn = document.getElementById('resume-btn');
      if (resumeBtn) resumeBtn.addEventListener('click', () => this.togglePause());

      if (this.pauseBtn) {
        this.pauseBtn.addEventListener('click', () => this.togglePause());
      }

      // 3. Sound Toggle Button
      if (this.soundToggleBtn) {
        this.soundToggleBtn.addEventListener('click', () => {
          const isEnabled = this.sound.toggle();
          this.soundToggleBtn.textContent = isEnabled ? '🔊 Sound On' : '🔇 Muted';
        });
      }

      // 4. Mobile On-Screen D-Pad (instant pointerdown response)
      const btnUp = document.getElementById('dpad-up');
      const btnDown = document.getElementById('dpad-down');
      const btnLeft = document.getElementById('dpad-left');
      const btnRight = document.getElementById('dpad-right');

      const bindDpadBtn = (btn, dir) => {
        if (!btn) return;
        const handler = (e) => {
          if (e && e.cancelable) e.preventDefault();
          this.setDirection(dir);
        };
        btn.addEventListener('pointerdown', handler, { passive: false });
        btn.addEventListener('touchstart', handler, { passive: false });
        btn.addEventListener('click', handler);
      };

      bindDpadBtn(btnUp, DIRS.UP);
      bindDpadBtn(btnDown, DIRS.DOWN);
      bindDpadBtn(btnLeft, DIRS.LEFT);
      bindDpadBtn(btnRight, DIRS.RIGHT);

      // 5. Canvas Touch Swipe Gestures
      let touchStartX = 0;
      let touchStartY = 0;

      this.canvas.addEventListener(
        'touchstart',
        (e) => {
          if (e.touches.length > 0) {
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
          }
        },
        { passive: true }
      );

      this.canvas.addEventListener(
        'touchend',
        (e) => {
          if (e.changedTouches.length === 0) return;
          const touchEndX = e.changedTouches[0].clientX;
          const touchEndY = e.changedTouches[0].clientY;
          const dx = touchEndX - touchStartX;
          const dy = touchEndY - touchStartY;
          const minSwipeDistance = 24;

          if (Math.abs(dx) > Math.abs(dy)) {
            // Horizontal swipe
            if (Math.abs(dx) >= minSwipeDistance) {
              if (dx > 0) this.setDirection(DIRS.RIGHT);
              else this.setDirection(DIRS.LEFT);
            }
          } else {
            // Vertical swipe
            if (Math.abs(dy) >= minSwipeDistance) {
              if (dy > 0) this.setDirection(DIRS.DOWN);
              else this.setDirection(DIRS.UP);
            }
          }
        },
        { passive: true }
      );
    }
  }

  // --- Boot Game on DOMContentLoaded ---
  window.addEventListener('DOMContentLoaded', () => {
    window.snakeGameInstance = new SnakeAdventure();
  });
})();
