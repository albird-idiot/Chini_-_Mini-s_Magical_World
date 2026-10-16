/**
 * Central Settings & Preferences Store
 * =====================================
 * Manages both immediately active site preferences (sound, reduced motion, fullscreen)
 * and future game preferences (music volume, difficulty, touch controls) stored in localStorage.
 */

import { soundManager } from './audio';

const STORAGE_KEY = 'chini_mini_settings_v1';

const DEFAULT_SETTINGS = {
  // Active Website Settings
  soundEffects: true,
  reducedMotion: false,

  // Future Game Preferences (saved for upcoming Pygame / browser builds)
  musicVolume: 70,
  gameDifficulty: 'gentle', // 'gentle' | 'normal'
  touchControls: 'auto' // 'auto' | 'always'
};

function getInitialSettings() {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const parsed = saved ? JSON.parse(saved) : {};

    // Auto-detect OS reduced motion preference if not explicitly overridden
    const systemPrefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    return {
      ...DEFAULT_SETTINGS,
      reducedMotion: parsed.reducedMotion ?? systemPrefersReducedMotion ?? false,
      ...parsed
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

class SettingsManager {
  constructor() {
    this.settings = getInitialSettings();
    this.listeners = new Set();

    // Sync sound manager with initial state
    soundManager.setEnabled(this.settings.soundEffects);

    // Apply reduced-motion attribute to html root
    this.applyDomSideEffects();
  }

  get() {
    return { ...this.settings };
  }

  set(partial) {
    this.settings = { ...this.settings, ...partial };

    if ('soundEffects' in partial) {
      soundManager.setEnabled(this.settings.soundEffects);
    }

    this.applyDomSideEffects();
    this.save();
    this.notify();
  }

  reset() {
    this.settings = { ...DEFAULT_SETTINGS };
    soundManager.setEnabled(true);
    this.applyDomSideEffects();
    this.save();
    this.notify();
  }

  applyDomSideEffects() {
    if (typeof document === 'undefined') return;
    if (this.settings.reducedMotion) {
      document.documentElement.setAttribute('data-reduced-motion', 'true');
    } else {
      document.documentElement.removeAttribute('data-reduced-motion');
    }
  }

  save() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
    } catch {
      // Ignore quota errors
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    const current = this.get();
    for (const listener of this.listeners) {
      listener(current);
    }
  }
}

export const settingsManager = new SettingsManager();
