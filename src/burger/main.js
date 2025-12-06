import './style.css'
import gsap from 'gsap'
import ScrollTrigger from 'gsap/ScrollTrigger'
import Lenis from '@studio-freight/lenis'
import { initScene, updateScene } from './three-scene.js'
import config from './config.js'

gsap.registerPlugin(ScrollTrigger)

// 1. Initialize Lenis (The Smooth Scroll Manager)
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smooth: true,
});

// 2. The "Handshake" (Synchronize Lenis and GSAP)
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});

gsap.ticker.lagSmoothing(0);

// AG Logo color animation based on page scroll
const agLogo = document.getElementById('ag-logo')
// Build color array from config (add first color at end for smooth loop)
const accentColors = [...config.colors.accents, config.colors.accents[0]]

// Update logo color on scroll
lenis.on('scroll', ({ progress }) => {
  if (agLogo && config.logo.enabled) {
    // Map scroll progress to color index
    const colorIndex = progress * (accentColors.length - 1)
    const lowerIndex = Math.floor(colorIndex)
    const upperIndex = Math.min(lowerIndex + 1, accentColors.length - 1)
    const blend = colorIndex - lowerIndex

    // Interpolate between colors
    const lowerColor = accentColors[lowerIndex]
    const upperColor = accentColors[upperIndex]

    // Simple hex color interpolation
    const lerp = (a, b, t) => a + (b - a) * t
    const hexToRgb = (hex) => ({
      r: parseInt(hex.slice(1, 3), 16),
      g: parseInt(hex.slice(3, 5), 16),
      b: parseInt(hex.slice(5, 7), 16)
    })
    const rgbToHex = (r, g, b) =>
      '#' + [r, g, b].map(x => Math.round(x).toString(16).padStart(2, '0')).join('')

    const c1 = hexToRgb(lowerColor)
    const c2 = hexToRgb(upperColor)
    const blendedColor = rgbToHex(
      lerp(c1.r, c2.r, blend),
      lerp(c1.g, c2.g, blend),
      lerp(c1.b, c2.b, blend)
    )

    agLogo.style.color = blendedColor
    agLogo.style.textShadow = `0 0 20px ${blendedColor}`
  }
})

// 3. Initialize Three.js Scene
initScene('#hero-canvas')

// 4. Scrollytelling: Pin hero and scrub 3D animation
const heroVisual = document.querySelector('.hero-visual')
const heroContent = document.querySelector('.hero-content')

// DEV: Progress indicator for tuning transitions (controlled by config)
let devIndicator = null
if (config.dev.showProgressIndicator) {
  devIndicator = document.createElement('div')
  devIndicator.id = 'dev-progress'
  devIndicator.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.8);
    color: #0ff;
    font-family: monospace;
    font-size: 14px;
    padding: 10px 15px;
    border-radius: 8px;
    z-index: 9999;
    border: 1px solid #0ff;
  `
  document.body.appendChild(devIndicator)
}

ScrollTrigger.create({
  trigger: '.hero-section',
  start: 'top top',
  end: `+=${config.scroll.runway}`,
  pin: true,
  scrub: config.scroll.scrubSmoothness,
  onUpdate: (self) => {
    updateScene(self.progress)

    // DEV: Update progress indicator if enabled
    if (devIndicator) {
      devIndicator.innerHTML = `
        <div>Scroll: <strong>${(self.progress * 100).toFixed(1)}%</strong></div>
        <div>Hero opacity: <strong>${heroVisual.style.opacity || 1}</strong></div>
      `
    }

    // Crossfade: start fading based on config
    const fadeStart = config.scroll.fadeStart
    if (self.progress > fadeStart) {
      const fadeProgress = (self.progress - fadeStart) / (1 - fadeStart)
      const heroOpacity = Math.max(0.1, 1 - (fadeProgress * 0.9))
      heroVisual.style.opacity = heroOpacity
      heroContent.style.opacity = heroOpacity
    } else {
      heroVisual.style.opacity = 1
      heroContent.style.opacity = 1
    }
  }
})

// 3. Hero Animations
const heroTl = gsap.timeline();

heroTl
  .from(".hero-title .line", {
    y: 100,
    opacity: 0,
    duration: 1.5,
    stagger: 0.2,
    ease: "power4.out",
    delay: 0.5
  })
  .from(".hero-subtitle", {
    y: 20,
    opacity: 0,
    duration: 1,
    ease: "power3.out"
  }, "-=1")
  .from(".scroll-indicator", {
    opacity: 0,
    duration: 1,
    delay: 0.5
  }, "-=0.5");

// Parallax for Hero Grid
gsap.to(".grid-overlay", {
  yPercent: 50,
  ease: "none",
  scrollTrigger: {
    trigger: ".hero-section",
    start: "top top",
    end: "bottom top",
    scrub: true
  }
});

// 4. About Section Animations
gsap.from(".stack-card", {
  y: 50,
  opacity: 0,
  duration: 1,
  stagger: 0.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".stack-visuals",
    start: "top 80%",
    toggleActions: "play none none reverse"
  }
});

// 5. Work Section Animations
const projects = gsap.utils.toArray('.project-item');

projects.forEach((project, i) => {
  const content = project.querySelector('.project-content');
  const visual = project.querySelector('.project-visual');

  // Content Slide In
  gsap.from(content, {
    x: i % 2 === 0 ? -50 : 50,
    opacity: 0,
    duration: 1.2,
    ease: "power3.out",
    scrollTrigger: {
      trigger: project,
      start: "top 80%",
      toggleActions: "play none none reverse"
    }
  });

  // Visual Parallax
  gsap.from(visual, {
    y: 100,
    opacity: 0,
    duration: 1.5,
    ease: "power3.out",
    scrollTrigger: {
      trigger: project,
      start: "top 85%",
      toggleActions: "play none none reverse"
    }
  });
});

// 6. Contact Animation
gsap.from(".contact-title", {
  y: 50,
  opacity: 0,
  duration: 1.2,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".contact-section",
    start: "top 70%",
    toggleActions: "play none none reverse"
  }
});

gsap.from(".contact-link", {
  y: 20,
  opacity: 0,
  duration: 1,
  stagger: 0.1,
  ease: "power3.out",
  scrollTrigger: {
    trigger: ".contact-links",
    start: "top 85%",
    toggleActions: "play none none reverse"
  }
});
