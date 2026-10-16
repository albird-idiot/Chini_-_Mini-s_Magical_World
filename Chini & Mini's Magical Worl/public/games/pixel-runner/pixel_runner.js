/**
 * Pixel Runner - Chini & Mini's Magical World
 * ===========================================
 * Browser recreation of the Pygame 'Pixel Run' runner game.
 * Faithfully preserves 800x400 coordinate space, gravity (-21 impulse, +1/tick),
 * snail/fly obstacles, Pixeltype font, original sprites, and jump audio.
 */

(function () {
  'use strict';

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 400;
  const GROUND_Y = 300;

  const STORAGE_KEY = 'chiniMinisPixelRunnerBestScore';

  // --- Asset Loader ---
  const assets = {
    images: {},
    audio: {},
    loaded: false
  };

  const imageSources = {
    sky: 'graphics/Sky.png',
    ground: 'graphics/ground.png',
    playerStand: 'graphics/Player/player_stand.png',
    playerWalk1: 'graphics/Player/player_walk_1.png',
    playerWalk2: 'graphics/Player/player_walk_2.png',
    playerJump: 'graphics/Player/jump.png',
    snail1: 'graphics/snail/snail1.png',
    snail2: 'graphics/snail/snail2.png',
    fly1: 'graphics/Fly/Fly1.png',
    fly2: 'graphics/Fly/Fly2.png'
  };

  // --- Persistence Manager ---
  class PersistenceManager {
    static getBestScore() {
      try {
        const val = localStorage.getItem(STORAGE_KEY);
        if (val !== null) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 0) return num;
        }
      } catch (err) {
        console.warn('localStorage read error:', err);
      }
      return 0;
    }

    static saveBestScore(score) {
      if (typeof score !== 'number' || score < 0) return;
      try {
        localStorage.setItem(STORAGE_KEY, String(score));
      } catch (err) {
        console.warn('localStorage write error:', err);
      }
    }
  }

  // --- Audio Controller ---
  class AudioController {
    constructor() {
      this.soundEnabled = true;
      this.jumpAudio = new Audio('audio/jump.mp3');
      this.jumpAudio.volume = 0.5;

      this.bgMusic = new Audio('audio/music.wav');
      this.bgMusic.loop = true;
      this.bgMusic.volume = 0.35;
      this.musicStarted = false;
    }

    init() {
      if (!this.soundEnabled) return;
      if (!this.musicStarted) {
        this.bgMusic.play().then(() => {
          this.musicStarted = true;
        }).catch(() => {
          // Will unlock on subsequent user gesture
        });
      }
    }

    playJump() {
      if (!this.soundEnabled) return;
      try {
        this.jumpAudio.currentTime = 0;
        this.jumpAudio.play().catch(() => {});
      } catch {}
    }

    toggle() {
      this.soundEnabled = !this.soundEnabled;
      if (!this.soundEnabled) {
        this.bgMusic.pause();
      } else {
        if (this.musicStarted) {
          this.bgMusic.play().catch(() => {});
        } else {
          this.init();
        }
      }
      return this.soundEnabled;
    }
  }

  // --- Main Pixel Runner Game Class ---
  class PixelRunnerGame {
    constructor() {
      this.canvas = document.getElementById('pixel-canvas');
      this.ctx = this.canvas.getContext('2d');
      this.canvas.width = CANVAS_WIDTH;
      this.canvas.height = CANVAS_HEIGHT;

      // Subsystems
      this.audio = new AudioController();
      this.currentScoreEl = document.getElementById('current-score');
      this.bestScoreEl = document.getElementById('best-score');
      this.soundToggleBtn = document.getElementById('sound-toggle-btn');
      this.mobileJumpBtn = document.getElementById('mobile-jump-btn');

      // State
      this.gameActive = false;
      this.score = 0;
      this.bestScore = PersistenceManager.getBestScore();
      this.hasPlayed = false;

      // Player
      this.playerX = 80 - 32; // midbottom at 80
      this.playerY = GROUND_Y - 84;
      this.playerWidth = 64;
      this.playerHeight = 84;
      this.playerGravity = 0;
      this.playerIndex = 0;
      this.jumpBufferUntil = 0;

      // Obstacles
      this.obstacles = [];
      this.lastSpawnTime = 0;
      this.spawnInterval = 1500; // ms

      // Animation timers
      this.snailIndex = 0;
      this.lastSnailAnim = 0;
      this.flyIndex = 0;
      this.lastFlyAnim = 0;

      // Time tracking for score
      this.startTime = 0;

      // Fixed timestep loop
      this.lastFrameTime = performance.now();
      this.accumulator = 0;
      this.timestep = 1000 / 60; // 60 FPS (~16.66ms)

      this.updateScoreboard();
      this.loadAssets().then(() => {
        this.initEvents();
        this.loop = this.loop.bind(this);
        requestAnimationFrame(this.loop);
      });
    }

    updateScoreboard() {
      if (this.currentScoreEl) this.currentScoreEl.textContent = this.score;
      if (this.bestScoreEl) this.bestScoreEl.textContent = this.bestScore;
    }

    loadAssets() {
      const promises = Object.entries(imageSources).map(([key, src]) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = () => {
            assets.images[key] = img;
            resolve();
          };
          img.onerror = () => {
            console.warn(`Failed to load ${src}`);
            resolve();
          };
        });
      });

      return Promise.all(promises).then(() => {
        assets.loaded = true;
      });
    }

    jump() {
      this.audio.init();

      if (!this.gameActive) {
        // Start or restart game
        this.startGame();
        return;
      }

      // In game: jump immediately if on ground or within landing margin
      const isOnGround = (this.playerY + this.playerHeight) >= (GROUND_Y - 8);
      if (isOnGround) {
        this.executeJump();
      } else {
        // Jump buffer: if tapped up to 160ms before landing, buffer the jump
        this.jumpBufferUntil = performance.now() + 160;
      }
    }

    executeJump() {
      this.playerGravity = -21;
      this.audio.playJump();
      this.jumpBufferUntil = 0;
    }

    startGame() {
      this.gameActive = true;
      this.hasPlayed = true;
      this.score = 0;
      this.startTime = performance.now();
      this.playerY = GROUND_Y - this.playerHeight;
      this.playerGravity = 0;
      this.jumpBufferUntil = 0;
      this.obstacles = [];
      this.lastSpawnTime = performance.now();
      this.updateScoreboard();
    }

    gameOver() {
      this.gameActive = false;
      this.obstacles = [];
      this.playerY = GROUND_Y - this.playerHeight;
      this.playerGravity = 0;
      this.jumpBufferUntil = 0;

      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        PersistenceManager.saveBestScore(this.bestScore);
      }
      this.updateScoreboard();
    }

    // --- Fixed Step Physics & Update ---
    update(dt) {
      const now = performance.now();

      // Update Snail & Fly sprite animation frames
      if (now - this.lastSnailAnim > 500) {
        this.snailIndex = this.snailIndex === 0 ? 1 : 0;
        this.lastSnailAnim = now;
      }
      if (now - this.lastFlyAnim > 200) {
        this.flyIndex = this.flyIndex === 0 ? 1 : 0;
        this.lastFlyAnim = now;
      }

      if (!this.gameActive) return;

      // 1. Update Score (Seconds survived)
      this.score = Math.floor((now - this.startTime) / 1000);
      if (this.score > this.bestScore) {
        this.bestScore = this.score;
        PersistenceManager.saveBestScore(this.bestScore);
      }
      this.updateScoreboard();

      // 2. Obstacle Spawning
      if (now - this.lastSpawnTime >= this.spawnInterval) {
        this.lastSpawnTime = now;
        const spawnX = 850 + Math.random() * 200; // between 850 and 1050
        const isSnail = Math.random() < 0.67; // 2/3 Snail, 1/3 Fly

        if (isSnail) {
          this.obstacles.push({
            type: 'snail',
            x: spawnX,
            y: GROUND_Y - 36, // bottom at 300
            w: 72,
            h: 36
          });
        } else {
          this.obstacles.push({
            type: 'fly',
            x: spawnX,
            y: 210 - 40, // bottom at 210
            w: 84,
            h: 40
          });
        }
      }

      // 3. Move Obstacles
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];
        obs.x -= 5; // 5 px per tick at 60 FPS
        if (obs.x < -100) {
          this.obstacles.splice(i, 1);
        }
      }

      // 4. Player Physics
      this.playerGravity += 1;
      this.playerY += this.playerGravity;

      if (this.playerY + this.playerHeight >= GROUND_Y) {
        this.playerY = GROUND_Y - this.playerHeight;
        this.playerGravity = 0;

        // If player tapped jump slightly before landing, trigger jump now
        if (this.jumpBufferUntil && performance.now() <= this.jumpBufferUntil) {
          this.executeJump();
        }
      }

      // Player Animation
      if (this.playerY + this.playerHeight < GROUND_Y) {
        // Jumping
      } else {
        this.playerIndex += 0.1;
        if (this.playerIndex >= 2) this.playerIndex = 0;
      }

      // 5. Collision Detection
      // Hitbox padding for forgiving kid-friendly play
      const playerHitbox = {
        x: this.playerX + 10,
        y: this.playerY + 8,
        w: this.playerWidth - 20,
        h: this.playerHeight - 12
      };

      for (const obs of this.obstacles) {
        const obsHitbox = {
          x: obs.x + 8,
          y: obs.y + 6,
          w: obs.w - 16,
          h: obs.h - 10
        };

        if (
          playerHitbox.x < obsHitbox.x + obsHitbox.w &&
          playerHitbox.x + playerHitbox.w > obsHitbox.x &&
          playerHitbox.y < obsHitbox.y + obsHitbox.h &&
          playerHitbox.y + playerHitbox.h > obsHitbox.y
        ) {
          this.gameOver();
          break;
        }
      }
    }

    // --- Render Loop ---
    render() {
      const ctx = this.ctx;
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      if (this.gameActive) {
        // 1. Draw Sky & Ground
        if (assets.images.sky) {
          ctx.drawImage(assets.images.sky, 0, 0, CANVAS_WIDTH, 300);
        } else {
          ctx.fillStyle = '#c0e8ec';
          ctx.fillRect(0, 0, CANVAS_WIDTH, 300);
        }

        if (assets.images.ground) {
          ctx.drawImage(assets.images.ground, 0, 300, CANVAS_WIDTH, 100);
        } else {
          ctx.fillStyle = '#a56c39';
          ctx.fillRect(0, 300, CANVAS_WIDTH, 100);
        }

        // 2. Draw In-Game Score (Top Right like Pygame)
        ctx.fillStyle = '#404040';
        ctx.font = '36px Pixeltype, monospace';
        ctx.textAlign = 'right';
        ctx.fillText(`Score: ${this.score}`, 770, 45);

        // 3. Draw Obstacles
        for (const obs of this.obstacles) {
          if (obs.type === 'snail') {
            const snailImg = this.snailIndex === 0 ? assets.images.snail1 : assets.images.snail2;
            if (snailImg) ctx.drawImage(snailImg, obs.x, obs.y, obs.w, obs.h);
          } else {
            const flyImg = this.flyIndex === 0 ? assets.images.fly1 : assets.images.fly2;
            if (flyImg) ctx.drawImage(flyImg, obs.x, obs.y, obs.w, obs.h);
          }
        }

        // 4. Draw Player
        let currentSprite;
        if (this.playerY + this.playerHeight < GROUND_Y) {
          currentSprite = assets.images.playerJump;
        } else {
          currentSprite = Math.floor(this.playerIndex) === 0
            ? assets.images.playerWalk1
            : assets.images.playerWalk2;
        }

        if (currentSprite) {
          ctx.drawImage(currentSprite, this.playerX, this.playerY, this.playerWidth, this.playerHeight);
        }
      } else {
        // Menu or Game Over Screen
        ctx.fillStyle = 'rgb(94, 129, 162)';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        // Title: Pixel Run
        ctx.fillStyle = 'rgb(111, 196, 169)';
        ctx.font = '54px Pixeltype, monospace';
        ctx.textAlign = 'center';
        ctx.fillText('Pixel Run', 400, 80);

        // Scaled Player Stand Icon at (400, 200)
        if (assets.images.playerStand) {
          const pw = assets.images.playerStand.width * 2;
          const ph = assets.images.playerStand.height * 2;
          ctx.drawImage(assets.images.playerStand, 400 - pw / 2, 200 - ph / 2, pw, ph);
        }

        if (!this.hasPlayed || this.score === 0) {
          // Ready State
          ctx.fillStyle = 'rgb(111, 196, 169)';
          ctx.font = '40px Pixeltype, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('press space or tap to run', 400, 310);

          ctx.fillStyle = '#ffffff';
          ctx.font = '34px Pixeltype, monospace';
          ctx.textAlign = 'right';
          ctx.fillText(`Best Score: ${this.bestScore}`, 770, 370);
        } else {
          // Game Over Screen
          ctx.fillStyle = '#ef4444';
          ctx.font = '80px Pixeltype, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('Game Over!!!', 400, 60);

          ctx.fillStyle = 'rgb(111, 196, 169)';
          ctx.font = '40px Pixeltype, monospace';
          ctx.textAlign = 'center';
          ctx.fillText('press space or tap to restart', 400, 310);

          // Score and Best Score
          ctx.fillStyle = '#ffffff';
          ctx.font = '38px Pixeltype, monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`Score: ${this.score}`, 30, 370);

          ctx.textAlign = 'right';
          ctx.fillText(`Best Score: ${this.bestScore}`, 770, 370);
        }
      }
    }

    loop(timestamp) {
      const dt = timestamp - this.lastFrameTime;
      this.lastFrameTime = timestamp;

      // Fixed timestep update accumulator
      this.accumulator += Math.min(dt, 100);
      while (this.accumulator >= this.timestep) {
        this.update(this.timestep);
        this.accumulator -= this.timestep;
      }

      this.render();
      requestAnimationFrame(this.loop);
    }

    initEvents() {
      let lastTriggerTime = 0;
      const handleJump = (e) => {
        const now = performance.now();
        // Prevent duplicate trigger within 50ms from overlapping touch/pointer/click events
        if (now - lastTriggerTime < 50) {
          if (e && e.cancelable) e.preventDefault();
          return;
        }
        lastTriggerTime = now;
        if (e) {
          if (e.cancelable) e.preventDefault();
          e.stopPropagation();
        }
        this.jump();
      };

      // 1. Keyboard
      window.addEventListener('keydown', (e) => {
        if ([' ', 'ArrowUp', 'w', 'W'].includes(e.key)) {
          e.preventDefault();
          handleJump(e);
        }
      });

      // 2. Canvas Click/Tap (instant on pointerdown or touchstart)
      this.canvas.addEventListener('pointerdown', handleJump, { passive: false });
      this.canvas.addEventListener('touchstart', handleJump, { passive: false });
      this.canvas.addEventListener('click', handleJump);

      // 3. Mobile Jump Button (instant on touch contact)
      if (this.mobileJumpBtn) {
        this.mobileJumpBtn.addEventListener('pointerdown', handleJump, { passive: false });
        this.mobileJumpBtn.addEventListener('touchstart', handleJump, { passive: false });
        this.mobileJumpBtn.addEventListener('click', handleJump);
      }

      // 4. Sound Toggle Button
      if (this.soundToggleBtn) {
        this.soundToggleBtn.addEventListener('click', () => {
          const isEnabled = this.audio.toggle();
          this.soundToggleBtn.textContent = isEnabled ? '🔊 Sound On' : '🔇 Muted';
        });
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.pixelRunnerInstance = new PixelRunnerGame();
  });
})();
