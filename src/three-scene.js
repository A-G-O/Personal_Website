/**
 * Three.js Scrollytelling Scene
 * A prebuilt 3D model with scroll-driven animations
 */

import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

// Scene state
let scene, camera, renderer, model, cameraRig
let currentProgress = 0
let targetProgress = 0
let animationMixer
let clock

// Configuration
const CONFIG = {
    // Colors with accent - vibrant gradient
    accentPrimary: 0x00ffff,    // Cyan
    accentSecondary: 0xff00ff,  // Magenta
    accentTertiary: 0xffff00,   // Yellow
    ambient: 0x0a0a0a,

    // Animation
    lerpFactor: 0.08,  // Smoothing factor for scroll

    // Model URL - Using a cool robot model from Three.js examples
    modelUrl: 'https://threejs.org/examples/models/gltf/RobotExpressive/RobotExpressive.glb'
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
    scene.background = new THREE.Color(CONFIG.ambient)

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
    renderer.toneMappingExposure = 1.2

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
 * Setup dramatic lighting with accent colors
 */
function setupLighting() {
    // Ambient for base visibility
    const ambient = new THREE.AmbientLight(0xffffff, 0.3)
    scene.add(ambient)

    // Key light - main accent (cyan)
    const keyLight = new THREE.DirectionalLight(CONFIG.accentPrimary, 2)
    keyLight.position.set(5, 5, 5)
    scene.add(keyLight)

    // Fill light - secondary accent (magenta)
    const fillLight = new THREE.DirectionalLight(CONFIG.accentSecondary, 1.5)
    fillLight.position.set(-5, 3, -5)
    scene.add(fillLight)

    // Rim light - tertiary accent (yellow)
    const rimLight = new THREE.DirectionalLight(CONFIG.accentTertiary, 1)
    rimLight.position.set(0, -3, -5)
    scene.add(rimLight)

    // Subtle point light for highlights
    const pointLight = new THREE.PointLight(0xffffff, 0.5)
    pointLight.position.set(0, 3, 3)
    scene.add(pointLight)
}

/**
 * Load the 3D model
 */
function loadModel() {
    const loader = new GLTFLoader()

    loader.load(
        CONFIG.modelUrl,
        (gltf) => {
            model = gltf.scene

            // Center and scale the model
            const box = new THREE.Box3().setFromObject(model)
            const center = box.getCenter(new THREE.Vector3())
            const size = box.getSize(new THREE.Vector3())

            const maxDim = Math.max(size.x, size.y, size.z)
            const scale = 2 / maxDim
            model.scale.setScalar(scale)

            model.position.sub(center.multiplyScalar(scale))
            model.position.y = -0.5

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
        color: CONFIG.accentPrimary,
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
    currentProgress += (targetProgress - currentProgress) * CONFIG.lerpFactor

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
