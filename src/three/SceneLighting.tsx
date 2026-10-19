// Cinematic studio lighting shared by every scene. The environment is built from
// Lightformers (no HDR download), giving controlled reflections on titanium and glass.
// A slow specular "sweep" light travels across the metal like a studio turntable shot.
import { useRef } from 'react'
import type * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { palette } from './materials'

export function SceneLighting({ quality = 'high', sweep = true }: { quality?: 'high' | 'low'; sweep?: boolean }) {
  const sweepRef = useRef<THREE.DirectionalLight>(null)
  useFrame((s) => {
    if (!sweep || !sweepRef.current) return
    const t = s.clock.elapsedTime * 0.12
    sweepRef.current.position.set(Math.sin(t) * 9, 4 + Math.cos(t * 0.7) * 2, 6)
  })
  return (
    <>
      <ambientLight intensity={0.18} />
      {/* soft champagne key */}
      <directionalLight position={[5, 7, 5]} intensity={1.35} color="#f3ead9" />
      {/* teal rim from behind */}
      <directionalLight position={[-6, 2.5, -6]} intensity={1.15} color={palette.tealBright} />
      {/* low fill */}
      <directionalLight position={[-4, -3, 5]} intensity={0.28} color="#9fb3b8" />
      {/* travelling specular sweep */}
      <directionalLight ref={sweepRef} position={[0, 4, 6]} intensity={sweep ? 0.9 : 0} color="#ffffff" />
      <Environment resolution={quality === 'high' ? 256 : 64} frames={1}>
        <Lightformer form="rect" intensity={2.2} color="#fff8ee" position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#d8e4e6" position={[6, 1, 3]} rotation-y={-Math.PI / 2} scale={[4, 8, 1]} />
        <Lightformer form="rect" intensity={1.4} color={palette.teal} position={[-6, 0, -2]} rotation-y={Math.PI / 2} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={0.9} color="#d9c7a3" position={[0, -4, 3]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
        <Lightformer form="ring" intensity={0.8} color="#ffffff" position={[0, 0, -8]} scale={4} />
      </Environment>
    </>
  )
}
