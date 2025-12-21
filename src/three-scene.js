/**
 * Three.js Scrollytelling Scene
 * A prebuilt 3D model with scroll-driven particle dissolve effect
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import config from './config.js'

// Scene state
let scene, camera, renderer, model, cameraRig, particleSystem
let currentProgress = 0
let targetProgress = 0
let animationMixer
let clock
let dissolveProgress = 0

// Convert hex string to Three.js color number
const hexToThreeColor = (hex) => parseInt(hex.replace('#', ''), 16)

// Derived config values
const SCENE_CONFIG = {
    accentPrimary: hexToThreeColor(config.colors.accents[0] || '#00ffff'),
    accentSecondary: hexToThreeColor(config.colors.accents[1] || '#ff00ff'),
    accentTertiary: hexToThreeColor(config.colors.accents[2] || '#ffff00'),
    ambient: hexToThreeColor(config.colors.background),
    lerpFactor: config.scroll.lerpFactor,
    modelUrl: config.model.url,
    modelScale: config.model.scale,
    modelPosition: config.model.position,
    rotationSpeed: config.model.rotationSpeed
}

// Dissolve shader - vertex shader
const dissolveVertexShader = `
    attribute vec3 randomDirection;
    attribute float randomSpeed;
    
    uniform float uProgress;
    uniform float uTime;
    
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
        // Calculate dissolve offset based on progress
        float noise = sin(position.x * 10.0 + uTime) * cos(position.y * 10.0 + uTime) * 0.5 + 0.5;
        float particleProgress = smoothstep(0.0, 1.0, uProgress * (1.0 + noise * 0.5));
        
        // Move particles outward based on their random direction
        vec3 dissolvedPosition = position + randomDirection * particleProgress * randomSpeed * 3.0;
        
        // Add some upward drift and swirl
        dissolvedPosition.y += particleProgress * randomSpeed * 2.0;
        dissolvedPosition.x += sin(uTime * 2.0 + position.y * 5.0) * particleProgress * 0.5;
        dissolvedPosition.z += cos(uTime * 2.0 + position.x * 5.0) * particleProgress * 0.3;
        
        // Fade out as particles disperse
        vAlpha = 1.0 - smoothstep(0.0, 0.8, particleProgress);
        
        // Color variation
        vColor = vec3(0.9, 0.85, 0.7); // Warm golden color matching the lamp
        
        vec4 mvPosition = modelViewMatrix * vec4(dissolvedPosition, 1.0);
        gl_Position = projectionMatrix * mvPosition;
        
        // Size attenuation and dissolve effect
        float baseSize = 3.0;
        gl_PointSize = baseSize * (300.0 / -mvPosition.z);
        gl_PointSize *= (1.0 + particleProgress * 2.0); // Particles grow as they dissolve
    }
`

// Dissolve shader - fragment shader
const dissolveFragmentShader = `
    varying float vAlpha;
    varying vec3 vColor;
    
    void main() {
        // Create circular particle shape
        vec2 center = gl_PointCoord - vec2(0.5);
        float dist = length(center);
        
        if (dist > 0.5) discard;
        
        // Soft edge falloff
        float alpha = vAlpha * (1.0 - smoothstep(0.3, 0.5, dist));
        
        // Add slight glow
        vec3 color = vColor + vec3(0.1) * (1.0 - dist);
        
        gl_FragColor = vec4(color, alpha);
    }
`

/**
 * Initialize the Three.js scene
 * @param {string} canvasSelector - CSS selector for the canvas element
 */
export function initScene(canvasSelector) {
    const canvas = document.querySelector(canvasSelector)
    if (!canvas) {
        console.error('Canvas element not found:', canvasSelector)
        return
    }

    // Clock for animations
    clock = new THREE.Clock()

    // Scene setup
    scene = new THREE.Scene()

    // Camera setup (inside a rig for scroll control)
    cameraRig = new THREE.Group()
    camera = new THREE.PerspectiveCamera(
        50,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    )
    camera.position.set(0, 0, 5)
    cameraRig.add(camera)
    scene.add(cameraRig)

    // Renderer with high exposure for bright look
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.8  // Brighter exposure

    // PHOTOREALISM: Use PMREMGenerator with RoomEnvironment for soft IBL
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

    // Set background color
    scene.background = new THREE.Color(SCENE_CONFIG.ambient)

    // Lighting - minimal since IBL does the heavy lifting
    setupLighting()

    // Load the 3D model
    loadModel()

    // Handle resize
    window.addEventListener('resize', onResize)

    // Start render loop
    animate()
}

/**
 * Setup minimal lighting - RoomEnvironment IBL does the heavy lifting
 */
function setupLighting() {
    // Only subtle ambient to slightly boost shadows
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)
}

/**
 * Create particle system from model geometry
 */
function createParticleSystem(modelScene) {
    // Collect all vertices from the model
    const positions = []
    const randomDirections = []
    const randomSpeeds = []

    modelScene.traverse((child) => {
        if (child.isMesh && child.geometry) {
            const positionAttribute = child.geometry.getAttribute('position')
            const worldMatrix = child.matrixWorld

            for (let i = 0; i < positionAttribute.count; i++) {
                // Get vertex position in world space
                const vertex = new THREE.Vector3()
                vertex.fromBufferAttribute(positionAttribute, i)
                vertex.applyMatrix4(worldMatrix)

                positions.push(vertex.x, vertex.y, vertex.z)

                // Random direction for dissolve (normalized)
                const dir = new THREE.Vector3(
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2 + 0.5, // Bias upward
                    (Math.random() - 0.5) * 2
                ).normalize()
                randomDirections.push(dir.x, dir.y, dir.z)

                // Random speed multiplier
                randomSpeeds.push(0.5 + Math.random() * 1.5)
            }
        }
    })

    if (positions.length === 0) {
        console.warn('No vertices found in model for particle system')
        return null
    }

    // Create geometry with attributes
    const geometry = new THREE.BufferGeometry()
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geometry.setAttribute('randomDirection', new THREE.Float32BufferAttribute(randomDirections, 3))
    geometry.setAttribute('randomSpeed', new THREE.Float32BufferAttribute(randomSpeeds, 1))

    // Create shader material
    const material = new THREE.ShaderMaterial({
        uniforms: {
            uProgress: { value: 0.0 },
            uTime: { value: 0.0 }
        },
        vertexShader: dissolveVertexShader,
        fragmentShader: dissolveFragmentShader,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    })

    const particles = new THREE.Points(geometry, material)
    particles.visible = false // Hidden until dissolve starts

    console.log(`✨ Particle system created with ${positions.length / 3} particles`)

    return particles
}

/**
 * Load the 3D model
 */
function loadModel() {
    const loader = new GLTFLoader()

    loader.load(
        SCENE_CONFIG.modelUrl,
        (gltf) => {
            model = gltf.scene

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())

            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = SCENE_CONFIG.modelScale / maxDim
            model.scale.setScalar(scale)

            model.position.sub(center.multiplyScalar(scale))
            model.position.y = 0 // Center vertically

            // Update world matrix before creating particles
            model.updateMatrixWorld(true)

            scene.add(model)

            // Create particle system for dissolve effect
            particleSystem = createParticleSystem(model)
            if (particleSystem) {
                // Position particle system same as model
                particleSystem.position.copy(model.position)
                particleSystem.scale.copy(model.scale)
                scene.add(particleSystem)
            }

            // Setup animation mixer if model has animations
            if (gltf.animations && gltf.animations.length > 0) {
                animationMixer = new THREE.AnimationMixer(model)

                // Play the first idle animation
                const idleClip = THREE.AnimationClip.findByName(gltf.animations, 'Idle')
                    || gltf.animations[0]
                const action = animationMixer.clipAction(idleClip)
                action.play()
            }

            console.log('🤖 Model loaded successfully!')
        },
        (progress) => {
            const percent = (progress.loaded / progress.total * 100).toFixed(0)
            console.log(`Loading model: ${percent}%`)
        },
        (error) => {
            console.error('Error loading model:', error)
            // Fallback to a geometric shape
            createFallbackGeometry()
        }
    )
}

/**
 * Fallback geometry if model fails to load
 */
function createFallbackGeometry() {
    const geometry = new THREE.IcosahedronGeometry(1.5, 1)
    const material = new THREE.MeshStandardMaterial({
        color: SCENE_CONFIG.accentPrimary,
        metalness: 0.9,
        roughness: 0.1,
        flatShading: true
    })
    model = new THREE.Mesh(geometry, material)
    scene.add(model)
}

/**
 * Update scene based on scroll progress (called by GSAP ScrollTrigger)
 * @param {number} progress - Scroll progress from 0 to 1
 */
export function updateScene(progress) {
    targetProgress = progress
}

/**
 * Handle window resize
 */
function onResize() {
    const canvas = renderer.domElement
    const width = canvas.clientWidth
    const height = canvas.clientHeight

    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
}

/**
 * Main animation loop
 */
function animate() {
    requestAnimationFrame(animate)

    const delta = clock.getDelta()
    const elapsedTime = clock.getElapsedTime()

    // Smooth lerp for scroll progress
    currentProgress += (targetProgress - currentProgress) * SCENE_CONFIG.lerpFactor

    // Dissolve settings - start at 33% (Experience section)
    const DISSOLVE_START = 0.33
    const DISSOLVE_END = 0.55

    // Calculate dissolve progress
    if (currentProgress > DISSOLVE_START) {
        dissolveProgress = Math.min(1, (currentProgress - DISSOLVE_START) / (DISSOLVE_END - DISSOLVE_START))
    } else {
        dissolveProgress = 0
    }

    // Update animations based on scroll progress
    if (model) {
        // Rotation - full 360° over scroll
        model.rotation.y = currentProgress * Math.PI * 2

        // Subtle floating motion around center
        model.position.y = Math.sin(currentProgress * Math.PI * 2) * 0.1

        // Scale with slight reduction during dissolve
        const baseScale = 1 + Math.sin(currentProgress * Math.PI) * 0.1
        model.scale.setScalar(baseScale * (1 - dissolveProgress * 0.2))

        // Fade out the solid model as particles take over
        if (dissolveProgress > 0) {
            model.traverse((child) => {
                if (child.isMesh && child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material]
                    materials.forEach(mat => {
                        mat.transparent = true
                        mat.opacity = Math.max(0, 1 - dissolveProgress * 1.5) // Fade faster than particles appear
                    })
                }
            })
        }
    }

    // Update particle system
    if (particleSystem && particleSystem.material.uniforms) {
        const uniforms = particleSystem.material.uniforms
        uniforms.uTime.value = elapsedTime
        uniforms.uProgress.value = dissolveProgress

        // Show particles when dissolve starts
        particleSystem.visible = dissolveProgress > 0

        // Match model rotation
        if (model) {
            particleSystem.rotation.y = model.rotation.y
            particleSystem.position.y = model.position.y
        }
    }

    // Camera rig - orbit around during scroll
    if (cameraRig) {
        // Camera moves closer as you scroll
        camera.position.z = 5 - currentProgress * 2

        // Subtle orbit
        cameraRig.rotation.y = currentProgress * Math.PI * 0.25

        // Keep camera centered
        camera.position.y = 0
    }

    // Update any model animations
    if (animationMixer) {
        animationMixer.update(delta)
    }

    renderer.render(scene, camera)
}
