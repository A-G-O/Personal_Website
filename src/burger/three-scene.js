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
        50,
        canvas.clientWidth / canvas.clientHeight,
        0.1,
        100
    )
    camera.position.set(0, 1.5, 5)
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
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 0.8 // Lower exposure for realism

    // REALISM: Use PMREMGenerator with RoomEnvironment for IBL
    const pmremGenerator = new THREE.PMREMGenerator(renderer)
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture

    // Use the config background color
    scene.background = new THREE.Color(SCENE_CONFIG.ambient)

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
 * Setup simple ambient light (Environment map handles the rest)
 */
function setupLighting() {
    // Only a minimal ambient light to fill deep shadows if needed
    // RoomEnvironment does 99% of the work
    const ambient = new THREE.AmbientLight(0xffffff, 0.1)
    scene.add(ambient)
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
            model.position.y = SCENE_CONFIG.modelPosition.y

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

        // Subtle floating motion
        model.position.y = -0.5 + Math.sin(currentProgress * Math.PI * 2) * 0.1

        // Scale pulse at scroll midpoint
        const scale = 1 + Math.sin(currentProgress * Math.PI) * 0.1
        model.scale.setScalar(scale * (2 / 2)) // normalized from load
    }

    // Camera rig - orbit around during scroll
    if (cameraRig) {
        // Camera moves closer as you scroll
        camera.position.z = 5 - currentProgress * 2

        // Subtle orbit
        cameraRig.rotation.y = currentProgress * Math.PI * 0.25

        // Look down slightly at the end
        camera.position.y = 1.5 - currentProgress * 0.5
    }

    // Update any model animations
    if (animationMixer) {
        animationMixer.update(delta)
    }

    renderer.render(scene, camera)
}
