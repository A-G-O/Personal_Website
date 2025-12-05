# Winning Stack: GSAP + Lenis Scrollytelling

This project demonstrates the "Handshake" between GSAP ScrollTrigger and Lenis for smooth scrollytelling.

## Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Run the development server:**
    ```bash
    npm run dev
    ```

3.  **Build for production:**
    ```bash
    npm run build
    ```

4.  **Preview the production build:**
    ```bash
    npm run preview
    ```

## The Concept: "The Handshake"

Lenis hijacks the scroll wheel to create smooth values. GSAP needs to know about these smooth values to update its animations.

The code in `src/main.js` synchronizes them:

```javascript
// Tell GSAP's ScrollTrigger to use Lenis's scroll events
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's update method to GSAP's global ticker.
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

// Turn off GSAP's internal lag smoothing
gsap.ticker.lagSmoothing(0);
```