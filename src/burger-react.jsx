import React, { useRef } from 'react'
import ReactDOM from 'react-dom/client'
import { Canvas, useFrame } from '@react-three/fiber'
import { PerspectiveCamera, Environment, ScrollControls, Scroll, useScroll, ContactShadows } from '@react-three/drei'
import { Burger } from './components/Burger.jsx'
import './burger/style.css'

function CameraController() {
  const cameraRef = useRef()
  
  useFrame(() => {
    if (cameraRef.current) {
      cameraRef.current.lookAt(0, 0, 0)
    }
  })
  
  return (
    <PerspectiveCamera
      ref={cameraRef}
      makeDefault
      position={[0, 2, 6]}
      fov={35}
    />
  )
}

function Scene() {
  return (
    <>
      <CameraController />
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <Environment preset="city" />
      <ContactShadows position={[0, -0.5, 0]} opacity={0.4} scale={10} blur={2.5} />
      <Burger />
    </>
  )
}

function HTMLOverlays() {
  const scroll = useScroll()

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', pointerEvents: 'none' }}>
      {/* Title */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '10%',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
        fontSize: 'clamp(2rem, 5vw, 4rem)',
        fontWeight: 800,
        opacity: Math.max(0, 1 - scroll.offset * 2),
        transition: 'opacity 0.3s',
        textShadow: '0 2px 20px rgba(0,0,0,0.8)'
      }}>
        <h1 style={{ margin: 0 }}>Exploding Burger</h1>
      </div>

      {/* Ingredient labels that fade in as they separate */}
      {['Top Bun', 'Lettuce', 'Tomato', 'Cheese', 'Patty', 'Bottom Bun'].map((ingredient, index) => {
        const delay = (index + 1) * 0.1
        const opacity = Math.max(0, Math.min(1, (scroll.offset - delay) * 2))
        
        return (
          <div
            key={ingredient}
            style={{
              position: 'absolute',
              top: `${50 + scroll.offset * 20}%`,
              left: '10%',
              color: 'white',
              fontFamily: 'Inter, sans-serif',
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              fontWeight: 600,
              opacity: opacity,
              transition: 'opacity 0.3s ease-out',
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              transform: `translateY(${index * 30}px)`
            }}
          >
            {ingredient}
          </div>
        )
      })}
    </div>
  )
}

function App() {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <Canvas
        style={{ background: '#0a0a0a' }}
      >
        <ScrollControls pages={4} damping={0.25}>
          <Scene />
          
          {/* HTML overlays */}
          <Scroll html>
            <HTMLOverlays />
          </Scroll>
        </ScrollControls>
      </Canvas>
    </div>
  )
}

const root = ReactDOM.createRoot(document.getElementById('app'))
root.render(<App />)

