import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'

gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis (The Smooth Scroll Manager)
const lenis = new Lenis({
  duration: 1.2, // Higher = "heavier" scroll feel
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // "Out-Expo" ease
});

// 2. The "Handshake" (Synchronize Lenis and GSAP)
// Tell GSAP's ScrollTrigger to use Lenis's scroll events
lenis.on('scroll', ScrollTrigger.update);

// Add Lenis's update method to GSAP's global ticker.
// This ensures they both update on the exact same animation frame (no jitter).
gsap.ticker.add((time) => {
  lenis.raf(time * 1000); // Lenis requires time in milliseconds
});

// Turn off GSAP's internal lag smoothing (since Lenis handles the smoothing)
gsap.ticker.lagSmoothing(0);

// 3. Your Normal GSAP Animation
// Parallax Effect for "The Deep Ocean"
const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".stage",
    start: "top top",
    end: "+=2000", // Pin for 2000px of scrolling
    pin: true,
    scrub: true,
  }
});

// Animate the Background: Moves SLOWLY up
tl.to(".layer-bg", {
  y: -100,
  ease: "none"
}, 0);

// Animate the Middle: Moves at MEDIUM speed
tl.to(".layer-mid", {
  y: -300,
  ease: "none"
}, 0);

// Animate the Foreground: Moves FAST up
// This huge difference in pixel movement creates the 3D illusion
tl.to(".layer-front", {
  y: -600,
  ease: "none"
}, 0);

// 4. Reveal Animations - Text Unmask Effect
gsap.utils.toArray(".reveal-text").forEach((element) => {
  gsap.to(element, {
    clipPath: "inset(0 0% 0 0)",
    duration: 1.5,
    ease: "power2.out",
    scrollTrigger: {
      trigger: element,
      start: "top 80%",
      end: "top 20%",
      scrub: true,
    }
  });
});
