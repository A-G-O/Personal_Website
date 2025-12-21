/**
 * Three.js Scrollytelling Scene
 * A prebuilt 3D model with scroll-driven animations
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import config from './config.js'

// Scene state
let scene, camera, renderer, model, cameraRig
let currentProgress = 0
let targetProgress = 0
let animationMixer
let clock
let initialModelScale = 1 // Store the calculated scale from model loading

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
    // scene.background = new THREE.Color(SCENE_CONFIG.ambient) // Moved below IBL setup

    // Camera setup (inside a rig for scroll control)
    cameraRig = new THREE.Group()
    camera = new THREE.PerspectiveCamera(
        45, // Balanced FOV
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    )
    camera.position.set(0, 0, 5) // Back to standard distance
    cameraRig.add(camera)
    scene.add(cameraRig)

    // Renderer
    renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: true,
        alpha: true
    })
    renderer.setSize(canvas.clientWidth, canvas.clientHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.NoToneMapping // No tone mapping for pure color accuracy
    renderer.toneMappingExposure = 1.0

    // STRIPPED DOWN: No environment map for clean white background test
    // scene.environment = null
    scene.environmentIntensity = 0

    // White background for color diagnosis
    scene.background = new THREE.Color(0xffffff)

    // Lighting - dramatic 3-point setup with accent colors
    setupLighting()

    // Load the 3D model
    loadModel()

    // Handle resize
    window.addEventListener('resize', onResize)

    // Start render loop
    animate()
}

/**
 * Setup minimal lighting for white background test
 */
function setupLighting() {
    // Simple hemisphere light for even, neutral lighting
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.8)
    scene.add(hemisphereLight)

    // Simple directional light from above for definition
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5)
    directionalLight.position.set(0, 5, 5)
    scene.add(directionalLight)
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
            const center = new THREE.Vector3()
            box.getCenter(center)
            const size = new THREE.Vector3()
            box.getSize(size)

            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = SCENE_CONFIG.modelScale / maxDim
            initialModelScale = scale // Store for animation loop
            model.scale.setScalar(scale)

            // Calculate world-space offset to center the model at (0,0,0) 
            // then apply config offsets
            model.position.x = -center.x * scale + SCENE_CONFIG.modelPosition.x
            model.position.y = -center.y * scale + SCENE_CONFIG.modelPosition.y
            model.position.z = -center.z * scale + SCENE_CONFIG.modelPosition.z

            // Inspection: Log all mesh names to find ingredients
            console.log('🍔 Burger Ingredients by Name:')
            model.traverse((child) => {
                if (child.isMesh) {
                    console.log(`- ${child.name}`)
                }
            })

            scene.add(model)

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

    // Smooth lerp for scroll progress
    currentProgress += (targetProgress - currentProgress) * SCENE_CONFIG.lerpFactor

    // Update animations based on scroll progress
    if (model) {
        // Rotation - full 360° over scroll
        model.rotation.y = currentProgress * Math.PI * 2
        
        // Scale pulse at scroll midpoint (uses stored initial scale)
        const pulseScale = 1 + Math.sin(currentProgress * Math.PI) * 0.05
        model.scale.setScalar(pulseScale * initialModelScale) 
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
