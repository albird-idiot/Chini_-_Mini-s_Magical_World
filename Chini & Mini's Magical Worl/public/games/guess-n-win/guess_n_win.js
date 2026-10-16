/**
 * GUESS n WIN - Chini & Mini's Magical World
 * ===========================================
 * Browser recreation of the C-based number-guessing game.
 * Generates random number 1..100, provides low/high clues,
 * tracks attempts, persists best-attempt record in localStorage,
 * and features child-friendly audio and visual hints.
 */

(function () {
  'use strict';

  const STORAGE_BEST_ATTEMPTS = 'chiniMinisGuessNWinBestAttempts';
  const STORAGE_GAMES_WON = 'chiniMinisGuessNWinGamesWon';

  // --- Sound Effects (Web Audio API) ---
  class SoundManager {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }

    toggle() {
      this.enabled = !this.enabled;
      return this.enabled;
    }

    playTap() {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, now);
        osc.frequency.exponentialRampToValueAtTime(700, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } catch {}
    }

    playClue(isHigher) {
      if (!this.enabled) return;
      try {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        const startFreq = isHigher ? 350 : 650;
        const endFreq = isHigher ? 550 : 380;

        osc.frequency.setValueAtTime(startFreq, now);
        osc.frequency.exponentialRampToValueAtTime(endFreq, now + 0.15);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch {}
    }

    playWin() {
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
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.35);
        });
      } catch {}
    }
  }

  // --- Persistence Manager ---
  class PersistenceManager {
    static getBestAttempts() {
      try {
        const val = localStorage.getItem(STORAGE_BEST_ATTEMPTS);
        if (val !== null) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num > 0) return num;
        }
      } catch (err) {
        console.warn('localStorage read error:', err);
      }
      return 0; // 0 indicates no best record yet
    }

    static saveBestAttempts(attempts) {
      if (typeof attempts !== 'number' || attempts <= 0) return;
      try {
        localStorage.setItem(STORAGE_BEST_ATTEMPTS, String(attempts));
      } catch (err) {
        console.warn('localStorage write error:', err);
      }
    }

    static getGamesWon() {
      try {
        const val = localStorage.getItem(STORAGE_GAMES_WON);
        if (val !== null) {
          const num = parseInt(val, 10);
          if (!isNaN(num) && num >= 0) return num;
        }
      } catch (err) {}
      return 0;
    }

    static saveGamesWon(count) {
      try {
        localStorage.setItem(STORAGE_GAMES_WON, String(count));
      } catch (err) {}
    }
  }

  // --- Main Guess N Win Game Class ---
  class GuessNWinGame {
    constructor() {
      this.sound = new SoundManager();

      // UI Elements
      this.secretBox = document.getElementById('secret-box');
      this.secretChar = document.getElementById('secret-char');
      this.rangeHint = document.getElementById('range-hint');
      this.feedbackBanner = document.getElementById('feedback-banner');
      this.guessForm = document.getElementById('guess-form');
      this.guessInput = document.getElementById('guess-input');
      this.guessBtn = document.getElementById('guess-btn');
      this.playAgainBtn = document.getElementById('play-again-btn');
      this.attemptsCountEl = document.getElementById('attempts-count');
      this.bestRecordEl = document.getElementById('best-record');
      this.gamesWonEl = document.getElementById('games-won');
      this.historyChipsEl = document.getElementById('history-chips');
      this.historySection = document.getElementById('history-section');
      this.soundToggleBtn = document.getElementById('sound-toggle-btn');

      // State
      this.secretNumber = 0;
      this.attempts = 0;
      this.minPossible = 1;
      this.maxPossible = 100;
      this.isWon = false;
      this.guessesHistory = [];

      this.bestAttempts = PersistenceManager.getBestAttempts();
      this.gamesWon = PersistenceManager.getGamesWon();

      this.updateStatsDisplay();
      this.initEvents();
      this.startNewGame();
    }

    updateStatsDisplay() {
      if (this.attemptsCountEl) this.attemptsCountEl.textContent = this.attempts;
      if (this.bestRecordEl) {
        this.bestRecordEl.textContent = this.bestAttempts > 0 ? `${this.bestAttempts} tries` : '—';
      }
      if (this.gamesWonEl) this.gamesWonEl.textContent = this.gamesWon;
    }

    startNewGame() {
      // 1. Generate random number 1 to 100
      this.secretNumber = Math.floor(Math.random() * 100) + 1;
      this.attempts = 0;
      this.minPossible = 1;
      this.maxPossible = 100;
      this.isWon = false;
      this.guessesHistory = [];

      // 2. Reset UI
      this.secretBox.classList.remove('revealed');
      this.secretChar.textContent = '?';
      this.rangeHint.textContent = `Possible Range: 1 – 100`;

      this.feedbackBanner.className = 'feedback-banner neutral';
      this.feedbackBanner.textContent = 'Pick any number between 1 and 100!';

      this.guessInput.value = '';
      this.guessInput.disabled = false;
      this.guessBtn.disabled = false;
      this.playAgainBtn.style.display = 'none';

      this.historyChipsEl.innerHTML = '';
      this.historySection.style.display = 'none';

      this.updateStatsDisplay();
      this.guessInput.focus();
    }

    handleGuess(valStr) {
      if (this.isWon) return;

      const trimmed = valStr.trim();
      if (trimmed === '') {
        this.showFeedback('Please enter a number between 1 and 100!', 'error');
        return;
      }

      const num = Number(trimmed);

      // Validate integer and range
      if (isNaN(num) || !Number.isInteger(num)) {
        this.showFeedback('Please enter a valid whole number!', 'error');
        return;
      }

      if (num < 1 || num > 100) {
        this.showFeedback('Oops! Your guess must be between 1 and 100.', 'error');
        return;
      }

      // Valid guess -> increment attempt counter
      this.attempts++;
      this.updateStatsDisplay();
      this.sound.playTap();

      // Compare guess with secret number
      if (num < this.secretNumber) {
        // Too low
        this.sound.playClue(true);
        if (num >= this.minPossible) {
          this.minPossible = num + 1;
        }
        this.rangeHint.textContent = `Possible Range: ${this.minPossible} – ${this.maxPossible}`;
        this.showFeedback(`Opps! ${num} is a bit too LOW ⬆️ Try a larger number!`, 'low');
        this.addHistoryChip(num, 'low', '⬆️');
      } else if (num > this.secretNumber) {
        // Too high
        this.sound.playClue(false);
        if (num <= this.maxPossible) {
          this.maxPossible = num - 1;
        }
        this.rangeHint.textContent = `Possible Range: ${this.minPossible} – ${this.maxPossible}`;
        this.showFeedback(`Opps! ${num} is a bit too HIGH ⬇️ Try a smaller number!`, 'high');
        this.addHistoryChip(num, 'high', '⬇️');
      } else {
        // WIN!
        this.handleWin();
        this.addHistoryChip(num, 'win', '🎯');
      }

      this.guessInput.value = '';
      if (!this.isWon) {
        this.guessInput.focus();
      }
    }

    handleWin() {
      this.isWon = true;
      this.sound.playWin();

      // Reveal Secret Number in box
      this.secretBox.classList.add('revealed');
      this.secretChar.textContent = this.secretNumber;

      // Update games won
      this.gamesWon++;
      PersistenceManager.saveGamesWon(this.gamesWon);

      // Check and update best-attempt record
      let isNewBest = false;
      if (this.bestAttempts === 0 || this.attempts < this.bestAttempts) {
        this.bestAttempts = this.attempts;
        PersistenceManager.saveBestAttempts(this.bestAttempts);
        isNewBest = true;
      }

      this.updateStatsDisplay();

      // Feedback message
      const recordText = isNewBest
        ? ' 🎉 NEW BEST RECORD! 🎉'
        : '';
      this.showFeedback(
        `CONGRATULATIONS! You found the secret number ${this.secretNumber} in ${this.attempts} attempts!${recordText}`,
        'win'
      );

      // Disable input and show Play Again button
      this.guessInput.disabled = true;
      this.guessBtn.disabled = true;
      this.playAgainBtn.style.display = 'flex';
      this.playAgainBtn.focus();
    }

    showFeedback(message, type = 'neutral') {
      this.feedbackBanner.className = `feedback-banner ${type}`;
      this.feedbackBanner.textContent = message;
    }

    addHistoryChip(num, type, icon) {
      this.historySection.style.display = 'block';
      const chip = document.createElement('span');
      chip.className = `guess-chip chip-${type}`;
      chip.innerHTML = `${num} <span aria-hidden="true">${icon}</span>`;
      this.historyChipsEl.appendChild(chip);
      this.historyChipsEl.scrollTop = this.historyChipsEl.scrollHeight;
    }

    initEvents() {
      // 1. Submit on Button Click
      this.guessBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.handleGuess(this.guessInput.value);
      });

      // 2. Submit on Enter Key
      this.guessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleGuess(this.guessInput.value);
        }
      });

      // 3. Play Again Button
      this.playAgainBtn.addEventListener('click', () => {
        this.startNewGame();
      });

      // 4. Sound Toggle Button
      if (this.soundToggleBtn) {
        this.soundToggleBtn.addEventListener('click', () => {
          const isEnabled = this.sound.toggle();
          this.soundToggleBtn.textContent = isEnabled ? '🔊 Sound On' : '🔇 Muted';
        });
      }
    }
  }

  window.addEventListener('DOMContentLoaded', () => {
    window.guessNWinInstance = new GuessNWinGame();
  });
})();
