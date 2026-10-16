# Snake Adventure - Browser Integration Target

Place the tested browser-ready build files for **Snake Adventure** directly in this folder.

## Expected Structure:
```text
public/games/snake-adventure/
├── index.html       (Main browser entry point)
├── main.wasm / .js  (Runtime files)
└── assets/          (Sounds, textures, levels)
```

## How to Activate:
1. Verify `index.html` loads and runs in a browser.
2. In `src/data/games.js`, update the `snake-adventure` entry:
   - Change `status: 'coming-soon'` to `status: 'playable'`.
   - Confirm `launchPath: '/games/snake-adventure/index.html'`.
3. Test keyboard and swipe controls.
