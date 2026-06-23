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

  // Initialize block descriptors (only once)
  // We keep an array of 27 blocks, each having a unique ID, a THREE.Vector3 position, and a THREE.Quaternion orientation
  const blocks = useMemo(() => {
    const list = []
    const offsets = [-spacing, 0, spacing]
    let id = 0
    offsets.forEach(x => {
      offsets.forEach(y => {
        offsets.forEach(z => {
          list.push({
            id: id++,
            pos: new THREE.Vector3(x, y, z),
            rot: new THREE.Quaternion()
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
        // We use a small epsilon tolerance (0.05) because of float rounding
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

            // Apply orientation quaternion update (premultiply world-axis rotation)
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
        {blocks.map((block, idx) => (
          <group
            key={block.id}
            ref={el => { blocksRef.current[idx] = el }}
          >
            <RoundedBox
              args={[1, 1, 1]} // dimensions: width, height, depth
              radius={0.07}    // smooth, beveled edges
              smoothness={4}   // subdivision segments
            >
              <meshPhysicalMaterial
                color="#ffffff"
                transparent={true}
                opacity={0.03}              // Face color: rgba(255, 255, 255, 0.03)
                emissive="#c8c8c8"
                emissiveIntensity={0.4}     // Glow/emissive: rgba(200, 200, 200, 0.4)
                metalness={0.9}
                roughness={0.15}
                clearcoat={1.0}
                clearcoatRoughness={0.05}
                transmission={0.9}          // glass transparency effect
                thickness={0.5}
              />
            </RoundedBox>
            <lineSegments>
              <edgesGeometry attach="geometry" args={[new THREE.BoxGeometry(1.002, 1.002, 1.002)]} />
              <lineBasicMaterial
                attach="material"
                color="#c0c0c0"             // Edge color: rgba(192, 192, 192)
                transparent={true}
                opacity={0.6}               // Edge alpha: 0.6
                linewidth={1}
                depthWrite={false}
              />
            </lineSegments>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function MetallicCube() {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Canvas
        orthographic
        camera={{
          position: [5, 5, 5],
          zoom: 70,
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
