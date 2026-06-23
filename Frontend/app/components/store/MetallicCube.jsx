'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { RoundedBox, OrbitControls } from '@react-three/drei'
import * as THREE from 'three'

// Inner component to handle Rubik's cube twisting and mouse-tilt parallax
function CubeGroup() {
  const tiltRef = useRef()
  const rotateRef = useRef()
  const blocksRef = useRef([])

  // Spacing coordinate offset
  const spacing = 1.04

  // --- PROCEDURAL TEXTURES (Generated in-memory via Canvas) ---
  
  // 1. Brushed Silver Texture
  const brushedTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 256
    canvas.height = 256
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#888888'
    ctx.fillRect(0, 0, 256, 256)
    
    ctx.strokeStyle = '#aaaaaa'
    ctx.lineWidth = 1
    for (let i = 0; i < 400; i++) {
      const y = Math.random() * 256
      ctx.beginPath()
      ctx.moveTo(0, y)
      ctx.lineTo(256, y)
      ctx.stroke()
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    return tex
  }, [])

  // 2. Perforated Grid Texture (Dot Mesh)
  const dotGridTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 128
    canvas.height = 128
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, 128, 128)
    
    ctx.fillStyle = '#000000'
    const size = 8
    for (let x = 4; x < 128; x += size) {
      for (let y = 4; y < 128; y += size) {
        ctx.beginPath()
        ctx.arc(x, y, 1.5, 0, Math.PI * 2)
        ctx.fill()
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(2, 2)
    return tex
  }, [])

  // 3. Carbon Fiber Checker Pattern
  const carbonTexture = useMemo(() => {
    if (typeof window === 'undefined') return null
    const canvas = document.createElement('canvas')
    canvas.width = 64
    canvas.height = 64
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#222222'
    ctx.fillRect(0, 0, 64, 64)
    
    ctx.fillStyle = '#111111'
    for (let x = 0; x < 64; x += 8) {
      for (let y = 0; y < 64; y += 8) {
        if ((x + y) % 16 === 0) {
          ctx.fillRect(x, y, 8, 8)
        }
      }
    }
    const tex = new THREE.CanvasTexture(canvas)
    tex.wrapS = THREE.RepeatWrapping
    tex.wrapT = THREE.RepeatWrapping
    tex.repeat.set(3, 3)
    return tex
  }, [])

  // Initialize block descriptors (only once)
  // We keep an array of 27 blocks, each having a unique ID, position, orientation, and a material type finish
  const blocks = useMemo(() => {
    const list = []
    const offsets = [-spacing, 0, spacing]
    let id = 0
    
    // Stable material types
    const materialTypes = ['brushed', 'perforated', 'carbon', 'matte', 'gloss']

    offsets.forEach(x => {
      offsets.forEach(y => {
        offsets.forEach(z => {
          // Use coordinate coordinates stable hash to select a material finish
          const hash = Math.abs(Math.sin(id + 1)) * 10
          const matType = materialTypes[Math.floor(hash) % materialTypes.length]

          list.push({
            id: id++,
            pos: new THREE.Vector3(x, y, z),
            rot: new THREE.Quaternion(),
            matType
          })
        })
      })
    })
    return list
  }, [])

  // Keep a mutable reference of block positions and rotations so we don't trigger React renders
  const blocksState = useRef(blocks.map(b => ({
    id: b.id,
    pos: b.pos.clone(),
    rot: b.rot.clone()
  })))

  // Twist state reference for random slice rotations
  const twist = useRef({
    isTwisting: false,
    axis: 'y', // 'x', 'y', or 'z'
    layerIndex: 0, // -spacing, 0, or spacing
    targetAngle: 0,
    currentAngle: 0,
    speed: 2.5, // radians per second
    delayTimer: 0.8 // delay in seconds before the first twist
  })

  useFrame((state, delta) => {
    const t = state.clock.getElapsedTime()
    const tw = twist.current

    // 1. Trigger next random slice twist
    if (!tw.isTwisting) {
      tw.delayTimer -= delta
      if (tw.delayTimer <= 0) {
        const axes = ['x', 'y', 'z']
        const layers = [-spacing, 0, spacing]
        const directions = [Math.PI / 2, -Math.PI / 2]

        tw.axis = axes[Math.floor(Math.random() * 3)]
        tw.layerIndex = layers[Math.floor(Math.random() * 3)]
        tw.targetAngle = directions[Math.floor(Math.random() * 2)]
        tw.currentAngle = 0
        tw.isTwisting = true
        tw.speed = Math.abs(tw.targetAngle) / 0.6 // turn takes 0.6 seconds
      }
    }

    // 2. Animate Twist
    if (tw.isTwisting) {
      const step = Math.sign(tw.targetAngle) * tw.speed * delta
      let nextAngle = tw.currentAngle + step

      const completed = Math.abs(nextAngle) >= Math.abs(tw.targetAngle)
      if (completed) {
        nextAngle = tw.targetAngle
      }

      tw.currentAngle = nextAngle

      // Determine rotation axis vector
      const axisVector = new THREE.Vector3()
      if (tw.axis === 'x') axisVector.set(1, 0, 0)
      else if (tw.axis === 'y') axisVector.set(0, 1, 0)
      else if (tw.axis === 'z') axisVector.set(0, 0, 1)

      const rotationDelta = new THREE.Quaternion().setFromAxisAngle(axisVector, tw.currentAngle)

      // Apply transformations to blocks
      blocksState.current.forEach((block, idx) => {
        const mesh = blocksRef.current[idx]
        if (!mesh) return

        // Check if block is in the twisting layer
        const coord = block.pos[tw.axis]
        const isInLayer = Math.abs(coord - tw.layerIndex) < 0.05

        if (isInLayer) {
          // Temporarily rotate position around origin
          const tempPos = block.pos.clone().applyAxisAngle(axisVector, tw.currentAngle)
          mesh.position.copy(tempPos)

          // Temporarily rotate orientation
          const tempRot = rotationDelta.clone().multiply(block.rot)
          mesh.quaternion.copy(tempRot)
        } else {
          // Block is static relative to the active slice twist
          mesh.position.copy(block.pos)
          mesh.quaternion.copy(block.rot)
        }
      })

      // Commit changes if twist is completed
      if (completed) {
        const snapRotation = new THREE.Quaternion().setFromAxisAngle(axisVector, tw.targetAngle)

        blocksState.current.forEach((block) => {
          const coord = block.pos[tw.axis]
          const isInLayer = Math.abs(coord - tw.layerIndex) < 0.05

          if (isInLayer) {
            // Apply transformation to rest coordinates
            block.pos.applyAxisAngle(axisVector, tw.targetAngle)

            // Round coordinates to prevent numerical floating point drift
            block.pos.x = Math.round(block.pos.x / spacing) * spacing
            block.pos.y = Math.round(block.pos.y / spacing) * spacing
            block.pos.z = Math.round(block.pos.z / spacing) * spacing

            // Apply orientation quaternion update
            block.rot.premultiply(snapRotation).normalize()
          }
        })

        tw.isTwisting = false
        tw.currentAngle = 0
        tw.delayTimer = 1.0 // 1.0 second delay before the next slice turns
      }
    } else {
      // Resting state: align meshes directly with state coordinates
      blocksState.current.forEach((block, idx) => {
        const mesh = blocksRef.current[idx]
        if (mesh) {
          mesh.position.copy(block.pos)
          mesh.quaternion.copy(block.rot)
        }
      })
    }

    // 3. Double-layered Idle Rotation & Wobbling (Inner Group)
    if (rotateRef.current) {
      // Gentle, constant floating/wobbling rotations
      rotateRef.current.rotation.y = t * 0.06
      rotateRef.current.rotation.x = Math.sin(t * 0.5) * 0.05
      rotateRef.current.rotation.z = Math.cos(t * 0.4) * 0.05
    }

    // 4. Cursor Parallax with Smooth Inertia/Lerping & Floating Wave (Outer Group)
    if (tiltRef.current) {
      const targetX = (state.pointer.y * Math.PI) / 6 // Mouse Y tilts X axis
      const targetY = (state.pointer.x * Math.PI) / 6 // Mouse X tilts Y axis

      // Smooth interpolation (damping/inertia)
      tiltRef.current.rotation.x = THREE.MathUtils.lerp(tiltRef.current.rotation.x, -targetX, 0.05)
      tiltRef.current.rotation.y = THREE.MathUtils.lerp(tiltRef.current.rotation.y, targetY, 0.05)
      
      // Gentle floating vertical wave
      tiltRef.current.position.y = Math.sin(t * 1.0) * 0.12
    }
  })

  return (
    // Outer tilt group for mouse parallax & vertical floating
    <group ref={tiltRef}>
      {/* Inner rotation group for continuous spinning and wobbling */}
      <group ref={rotateRef}>
        {blocks.map((block, idx) => {
          let material;
          switch (block.matType) {
            case 'brushed':
              material = (
                <meshPhysicalMaterial
                  color="#a8a8a8"
                  metalness={1.0}
                  roughness={0.35}
                  bumpMap={brushedTexture}
                  bumpScale={0.015}
                  clearcoat={0.3}
                  clearcoatRoughness={0.2}
                />
              )
              break
            case 'perforated':
              material = (
                <meshPhysicalMaterial
                  color="#1a1a1a"
                  metalness={0.8}
                  roughness={0.25}
                  bumpMap={dotGridTexture}
                  bumpScale={-0.03}
                />
              )
              break
            case 'carbon':
              material = (
                <meshPhysicalMaterial
                  color="#151515"
                  metalness={0.85}
                  roughness={0.35}
                  bumpMap={carbonTexture}
                  bumpScale={0.01}
                />
              )
              break
            case 'matte':
              material = (
                <meshPhysicalMaterial
                  color="#121212"
                  metalness={0.2}
                  roughness={0.75}
                />
              )
              break
            case 'gloss':
            default:
              material = (
                <meshPhysicalMaterial
                  color="#080808"
                  metalness={0.95}
                  roughness={0.05}
                  clearcoat={1.0}
                  clearcoatRoughness={0.02}
                />
              )
              break
          }

          return (
            <group
              key={block.id}
              ref={el => { blocksRef.current[idx] = el }}
            >
              <RoundedBox
                args={[1, 1, 1]} // dimensions: width, height, depth
                radius={0.07}    // smooth, beveled edges
                smoothness={4}   // subdivision segments
              >
                {material}
              </RoundedBox>
            </group>
          )
        })}
      </group>
    </group>
  )
}

export default function MetallicCube() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        camera={{
          position: [5.2, 5.2, 5.2], // Perspective viewpoint down the cube's diagonal
          fov: 38,                   // Field of view
          near: 0.1,
          far: 1000
        }}
        gl={{ antialias: true }}
        style={{ pointerEvents: 'auto', background: '#000000' }}
      >
        <color attach="background" args={['#000000']} />
        
        <ambientLight intensity={0.05} />

        {/* Studio Lights */}
        {/* Camera-aligned Key Light to illuminate front faces */}
        <directionalLight position={[6, 6, 6]} intensity={2.0} color="#ffffff" />

        {/* Bright white point light */}
        <pointLight position={[10, 10, 10]} intensity={2.5} />

        {/* White directional light */}
        <directionalLight position={[-10, 8, 5]} intensity={1.5} color="#ffffff" />

        {/* Cool slate-blue directional light pointing from underneath */}
        <directionalLight position={[0, -10, -5]} intensity={0.8} color="#445566" />

        <CubeGroup />

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          enableDamping={true}
          dampingFactor={0.05}
        />
      </Canvas>
    </div>
  )
}
