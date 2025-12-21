/**
 * Scrollytelling Template Configuration
 * 
 * Edit this file to customize your page.
 * All customizable options are centralized here.
 */

export default {
    // ═══════════════════════════════════════════════════════════════
    // 3D MODEL
    // ═══════════════════════════════════════════════════════════════
    model: {
        // New local PBR model (cache bust)
        url: `/models/new_model.glb?t=${Date.now()}`,

        // Scale multiplier
        scale: 4.5,

        // Centered position
        position: { x: 0, y: 0, z: 0 },

        // Rotation speed during scroll
        rotationSpeed: Math.PI * 2
    },

    // ═══════════════════════════════════════════════════════════════
    // COLORS
    // ═══════════════════════════════════════════════════════════════
    colors: {
        // Background color
        background: '#1a1a1a', // Slightly lighter to see shadows

        // Accent colors (used for logo only now, as lighting is IBL)
        accents: ['#9dc35e', '#598428', '#c0da98'], // Avocado colors

        // Text colors
        text: '#e1e1e1',
        textMuted: '#888'
    },

    // ═══════════════════════════════════════════════════════════════
    // HERO SECTION
    // ═══════════════════════════════════════════════════════════════
    hero: {
        // Title lines (each string is a separate line)
        title: ['ANDRES', 'GUARNIZO'],

        // Subtitle text
        subtitle: 'Architecting Intelligence.',

        // Scroll indicator text
        scrollPrompt: 'Scroll to Compile'
    },

    // ═══════════════════════════════════════════════════════════════
    // LOGO
    // ═══════════════════════════════════════════════════════════════
    logo: {
        // Text displayed in the fixed logo
        text: 'AG',

        // Show the logo
        enabled: true
    },

    // ═══════════════════════════════════════════════════════════════
    // SCROLL BEHAVIOR
    // ═══════════════════════════════════════════════════════════════
    scroll: {
        // How much scroll "runway" the hero section occupies
        // '100%' = 1 viewport height, '200%' = 2 viewport heights
        runway: '300%',

        // When the hero starts fading out (0.0 to 1.0)
        fadeStart: 0.3,

        // Smoothing factor for scroll animations (lower = smoother but laggier)
        lerpFactor: 0.08,

        // Scrub smoothness for GSAP (higher = smoother)
        scrubSmoothness: 0.5
    },

    // ═══════════════════════════════════════════════════════════════
    // DEV MODE
    // ═══════════════════════════════════════════════════════════════
    dev: {
        // Show the scroll progress indicator (for tuning)
        showProgressIndicator: false
    }
}
