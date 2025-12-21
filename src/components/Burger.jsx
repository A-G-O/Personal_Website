import { useMemo, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useScroll } from '@react-three/drei'
import * as THREE from 'three'

// Hard-coded assembled state positions
const START_Y = {
  topBun: 1.8,
  lettuce: 1.5,
  tomato: 1.3,
  veggies: 1.15, // Pickles/Onions
  sauce: 1.05,   // Ketchup/Mustard
  cheese: 0.95,
  patty: 0.7,
  bottomBun: 0
}

// Scroll delay points (when each ingredient starts moving)
const DELAYS = {
  topBun: 0.0,    // starts immediately
  lettuce: 0.15, // starts at 15% scroll
  tomato: 0.30,   // starts at 30% scroll
  veggies: 0.45, // starts at 45% scroll
  sauce: 0.55,   // starts at 55% scroll
  cheese: 0.65,  // starts at 65% scroll
  patty: 0.75,   // starts at 75% scroll
  bottomBun: 1.0 // never moves
}

// Explosion distances (how far each group moves from START_Y)
const EXPLOSION_DISTANCE = {
  topBun: 1.7,      // moves from 1.8 to 3.5
  lettuce: 1.4,     // moves from 1.5 to 2.9
  tomato: 1.1,      // moves from 1.3 to 2.4
  veggies: 0.75,    // moves from 1.15 to 1.9
  sauce: 0.35,     // moves from 1.05 to 1.4
  cheese: -0.05,   // moves from 0.95 to 0.9 (slight downward)
  patty: -0.2,     // moves from 0.7 to 0.5 (downward)
  bottomBun: 0     // no movement
}

export function Burger() {
  const { nodes, materials, scene } = useGLTF('/Cheeseburger.glb')
  const scroll = useScroll()
  
  // Create refs for each group
  const topBunGroupRef = useRef()
  const lettuceGroupRef = useRef()
  const tomatoGroupRef = useRef()
  const veggiesGroupRef = useRef() // renamed from crunch
  const sauceGroupRef = useRef()
  const cheeseGroupRef = useRef()
  const pattyGroupRef = useRef()
  const bottomBunGroupRef = useRef()
  
  // Helper function to calculate progress with delay
  const calculateProgress = (scrollOffset, delay) => {
    if (scrollOffset < delay) {
      return 0 // Stay at START_Y until delay point
    }
    // Map from [delay, 1.0] to [0, 1.0]
    return Math.max(0, Math.min(1, (scrollOffset - delay) / (1 - delay)))
  }
  
  // Collect all nodes into groups and apply material overrides
  const groups = useMemo(() => {
    const groups = {
      topBun: [],
      lettuce: [],
      tomato: [],
      veggies: [], // Pickles + Onions
      sauce: [],
      cheese: [],
      patty: [],
      bottomBun: []
    }
    
    // Helper to check if node is SkinnedMesh
    const isSkinnedMesh = (node) => {
      return node && node.isSkinnedMesh
    }
    
    // Check for ROOT and SkinnedMesh
    if (nodes.ROOT) {
      console.warn('ROOT object detected. Ensuring groups override parent transforms.')
    }
    
    // Collect all nodes
    Object.keys(nodes).forEach(nodeName => {
      const node = nodes[nodeName]
      if (!node) return
      
      // Check for SkinnedMesh
      if (isSkinnedMesh(node)) {
        console.warn(`SkinnedMesh detected: ${nodeName}. Will wrap in group to override bone transforms.`)
      }
      
      // Top Bun Group: BunTop + all Top_Seed_X
      if (nodeName === 'BunTop' || nodeName.startsWith('Top_Seed_')) {
        groups.topBun.push(node)
        
        // Apply material override for buns
        if (node.material) {
          const clonedMaterial = node.material.clone()
          clonedMaterial.roughness = 0.8
          node.material = clonedMaterial
        }
      }
      
      // Lettuce Group
      else if (nodeName === 'Lettuce') {
        groups.lettuce.push(node)
      }
      
      // Tomato Group
      else if (nodeName === 'Tomato') {
        groups.tomato.push(node)
        
        // Apply material override for tomato (wet/oily)
        if (node.material) {
          const clonedMaterial = node.material.clone()
          clonedMaterial.roughness = 0.2
          clonedMaterial.metalness = 0.1
          node.material = clonedMaterial
        }
      }
      
      // Veggies Layer: Pickles + Onions
      else if (nodeName === 'Pickles' || nodeName === 'Onions') {
        groups.veggies.push(node)
        
        // Apply material override for pickles/onions (wet look)
        if (node.material) {
          const clonedMaterial = node.material.clone()
          clonedMaterial.roughness = 0.3
          clonedMaterial.metalness = 0.0
          node.material = clonedMaterial
        }
      }
      
      // Sauce Layer: Ketchup + Mustard
      else if (nodeName === 'Ketchup' || nodeName === 'Mustard') {
        groups.sauce.push(node)
        
        // Apply material override for sauces (high gloss)
        if (node.material) {
          const clonedMaterial = node.material.clone()
          clonedMaterial.roughness = 0.1
          clonedMaterial.metalness = 0.1
          node.material = clonedMaterial
        }
      }
      
      // Cheese Group
      else if (nodeName === 'Cheese') {
        groups.cheese.push(node)
        
        // Apply material override for cheese (wet/oily)
        if (node.material) {
          const clonedMaterial = node.material.clone()
          clonedMaterial.roughness = 0.2
          clonedMaterial.metalness = 0.1
          node.material = clonedMaterial
        }
      }
      
      // Patty Group
      else if (nodeName === 'Patty') {
        groups.patty.push(node)
      }
      
      // Bottom Bun Group: BunBottom + all Bottom_Seed_X
      else if (nodeName === 'BunBottom' || nodeName.startsWith('Bottom_Seed_')) {
        groups.bottomBun.push(node)
        
        // Apply material override for buns
        if (node.material) {
          const clonedMaterial = node.material.clone()
          clonedMaterial.roughness = 0.8
          node.material = clonedMaterial
        }
      }
    })
    
    console.log('Grouped nodes:', {
      topBun: groups.topBun.length,
      lettuce: groups.lettuce.length,
      tomato: groups.tomato.length,
      veggies: groups.veggies.length,
      sauce: groups.sauce.length,
      cheese: groups.cheese.length,
      patty: groups.patty.length,
      bottomBun: groups.bottomBun.length
    })
    
    return groups
  }, [nodes])

  useFrame(() => {
    // Get scroll offset (0 to 1)
    const scrollOffset = scroll.offset

    // Top Bun Group: starts immediately, moves from 1.8 to 3.5
    if (topBunGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.topBun)
      topBunGroupRef.current.position.x = 0
      topBunGroupRef.current.position.z = 0
      topBunGroupRef.current.position.y = START_Y.topBun + (progress * EXPLOSION_DISTANCE.topBun)
    }

    // Lettuce Group: starts at 15% scroll, moves from 1.5 to 2.9
    if (lettuceGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.lettuce)
      lettuceGroupRef.current.position.x = 0
      lettuceGroupRef.current.position.z = 0
      lettuceGroupRef.current.position.y = START_Y.lettuce + (progress * EXPLOSION_DISTANCE.lettuce)
    }

    // Tomato Group: starts at 30% scroll, moves from 1.3 to 2.4
    if (tomatoGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.tomato)
      tomatoGroupRef.current.position.x = 0
      tomatoGroupRef.current.position.z = 0
      tomatoGroupRef.current.position.y = START_Y.tomato + (progress * EXPLOSION_DISTANCE.tomato)
    }

    // Veggies Layer (Pickles/Onions): starts at 45% scroll, moves from 1.15 to 1.9
    if (veggiesGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.veggies)
      veggiesGroupRef.current.position.x = 0
      veggiesGroupRef.current.position.z = 0
      veggiesGroupRef.current.position.y = START_Y.veggies + (progress * EXPLOSION_DISTANCE.veggies)
    }

    // Sauce Layer (Ketchup/Mustard): starts at 55% scroll, moves from 1.05 to 1.4
    if (sauceGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.sauce)
      sauceGroupRef.current.position.x = 0
      sauceGroupRef.current.position.z = 0
      sauceGroupRef.current.position.y = START_Y.sauce + (progress * EXPLOSION_DISTANCE.sauce)
    }

    // Cheese Group: starts at 65% scroll, moves from 0.95 to 0.9 (slight downward)
    if (cheeseGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.cheese)
      cheeseGroupRef.current.position.x = 0
      cheeseGroupRef.current.position.z = 0
      cheeseGroupRef.current.position.y = START_Y.cheese + (progress * EXPLOSION_DISTANCE.cheese)
    }

    // Patty Group: starts at 75% scroll, moves from 0.7 to 0.5 (downward)
    if (pattyGroupRef.current) {
      const progress = calculateProgress(scrollOffset, DELAYS.patty)
      pattyGroupRef.current.position.x = 0
      pattyGroupRef.current.position.z = 0
      pattyGroupRef.current.position.y = START_Y.patty + (progress * EXPLOSION_DISTANCE.patty)
    }

    // Bottom Bun Group: stays at Y = 0 (never moves)
    if (bottomBunGroupRef.current) {
      bottomBunGroupRef.current.position.x = 0
      bottomBunGroupRef.current.position.z = 0
      bottomBunGroupRef.current.position.y = START_Y.bottomBun
    }
  })

  // Render all groups with their nodes
  return (
    <group>
      {/* Top Bun Group */}
      <group ref={topBunGroupRef}>
        {groups.topBun.map((node, index) => (
          <primitive key={`topBun-${index}`} object={node} />
        ))}
      </group>

      {/* Lettuce Group */}
      <group ref={lettuceGroupRef}>
        {groups.lettuce.map((node, index) => (
          <primitive key={`lettuce-${index}`} object={node} />
        ))}
      </group>

      {/* Tomato Group */}
      <group ref={tomatoGroupRef}>
        {groups.tomato.map((node, index) => (
          <primitive key={`tomato-${index}`} object={node} />
        ))}
      </group>

      {/* Veggies Layer (Pickles + Onions) */}
      <group ref={veggiesGroupRef}>
        {groups.veggies.map((node, index) => (
          <primitive key={`veggies-${index}`} object={node} />
        ))}
      </group>

      {/* Sauce Layer (Ketchup + Mustard) */}
      <group ref={sauceGroupRef}>
        {groups.sauce.map((node, index) => (
          <primitive key={`sauce-${index}`} object={node} />
        ))}
      </group>

      {/* Cheese Group */}
      <group ref={cheeseGroupRef}>
        {groups.cheese.map((node, index) => (
          <primitive key={`cheese-${index}`} object={node} />
        ))}
      </group>

      {/* Patty Group */}
      <group ref={pattyGroupRef}>
        {groups.patty.map((node, index) => (
          <primitive key={`patty-${index}`} object={node} />
        ))}
      </group>

      {/* Bottom Bun Group */}
      <group ref={bottomBunGroupRef}>
        {groups.bottomBun.map((node, index) => (
          <primitive key={`bottomBun-${index}`} object={node} />
        ))}
      </group>
    </group>
  )
}

// Preload the model
useGLTF.preload('/Cheeseburger.glb')
