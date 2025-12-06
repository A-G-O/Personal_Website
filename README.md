# 3D Scrollytelling Template

A premium scrollytelling website template with Three.js, GSAP ScrollTrigger, and Lenis smooth scrolling.

![Hero section with 3D robot model](/Users/andresguarnizo/.gemini/antigravity/brain/060ac416-7ca9-48d8-aaaf-b2eb88a0afc0/hero_section_model_1764995183736.png)

## ✨ Features

- **3D Scrollytelling** — Scroll controls 3D model rotation and camera movement
- **Smooth Scrolling** — Lenis + GSAP handshake for buttery animations
- **Accent Lighting** — Dramatic 3-point lighting with customizable colors
- **Color-Cycling Logo** — Fixed logo that changes color as you scroll
- **Gradient Transitions** — Smooth section crossfades with no harsh lines

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 🎨 Customization

**Edit `src/config.js`** to customize everything:

| Setting | Description |
|---------|-------------|
| `model.url` | URL to your `.glb` model |
| `colors.accents` | Array of hex colors for lighting & logo |
| `hero.title` | Hero section title lines |
| `scroll.runway` | How much scroll controls the 3D scene |
| `dev.showProgressIndicator` | Toggle dev mode overlay |

### Example: Change the Model

```javascript
// src/config.js
export default {
  model: {
    url: '/models/my-avatar.glb',  // Your model
    scale: 2,
    // ...
  }
}
```

### Example: Enable Dev Mode

```javascript
// src/config.js
export default {
  dev: {
    showProgressIndicator: true  // Shows scroll % overlay
  }
}
```

## 📁 Project Structure

```
src/
├── config.js       # ← All customization here
├── main.js         # GSAP + Lenis + scroll logic
├── three-scene.js  # Three.js 3D scene
└── style.css       # Styling
```

## 🔧 Tech Stack

- **Vite** — Fast dev server & build
- **Three.js** — 3D rendering
- **GSAP** — Animation library
- **Lenis** — Smooth scroll
- **Vanilla JS** — No framework overhead