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
        // URL to your .glb model (can be local path like '/models/avatar.glb')
        url: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb',

        // Scale multiplier for the model
        scale: 2,

        // Initial position offset
        position: { x: 0, y: -0.5, z: 0 },

        // Rotation speed during scroll (radians per 100% scroll)
        rotationSpeed: Math.PI * 2
    },

    // ═══════════════════════════════════════════════════════════════
    // COLORS
    // ═══════════════════════════════════════════════════════════════
    colors: {
        // Background color (also used for critical CSS)
        background: '#0a0a0a',

        // Accent colors - used for 3D lighting and logo color cycling
        // The logo will cycle through these as you scroll
        accents: ['#00ffff', '#ff00ff', '#ffff00'],

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
        runway: '100%',

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
