// The persistent WebGL stage. One canvas, one context, for the whole narrative:
// hero → five chapters → diagnostic framework → Human + AI → calm rest state.
// Lazy-loaded (dynamic import) so text and layout paint before any 3D code arrives.
import { useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { MeshReflectorMaterial, PerformanceMonitor } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { Capabilities } from '../lib/capabilities'
import { store } from '../state/store'
import { BusinessSystemModel } from './BusinessSystemModel'
import { CameraRig } from './CameraRig'
import { FORMATIONS, lerp, sceneBlend } from './formations'
import { disposeMaterials, palette } from './materials'
import { runtime } from './runtime'
import { SceneLighting } from './SceneLighting'

function StageFader({ el }: { el: React.RefObject<HTMLDivElement | null> }) {
  const last = useRef(-1)
  useFrame(() => {
    const { a, b, t } = sceneBlend(runtime.scene)
    const o = Math.round(lerp(FORMATIONS[a].canvasOpacity, FORMATIONS[b].canvasOpacity, t) * 1000) / 1000
    if (el.current && o !== last.current) {
      last.current = o
      el.current.style.opacity = String(o)
    }
  })
  return null
}

/** Stops the render loop while an opaque section fills the screen (the stage is invisible
 *  then), so scrolling through services and case studies never competes with WebGL. */
function FrameGate() {
  const setFrameloop = useThree((s) => s.setFrameloop)
  useEffect(() => {
    let id = 0
    let running = true
    const check = () => {
      const want = !store.get().covered
      if (want !== running) {
        running = want
        setFrameloop(want ? 'always' : 'never')
      }
      id = requestAnimationFrame(check)
    }
    id = requestAnimationFrame(check)
    return () => cancelAnimationFrame(id)
  }, [setFrameloop])
  return null
}

function ReadySignal() {
  const gl = useThree((s) => s.gl)
  useEffect(() => {
    const id = requestAnimationFrame(() => store.set({ ready: true }))
    return () => {
      cancelAnimationFrame(id)
      gl.dispose()
      disposeMaterials()
    }
  }, [gl])
  return null
}

export default function Hero3DScene({ caps }: { caps: Capabilities }) {
  const wrap = useRef<HTMLDivElement>(null)
  const { tier, reducedMotion, touch } = caps
  const motion = !reducedMotion
  const maxDpr = tier === 'high' ? 1.5 : tier === 'mid' ? 1.25 : 1
  const [dpr, setDpr] = useState(maxDpr)

  return (
    <div className="stage" ref={wrap} aria-hidden="true">
      <Canvas
        dpr={dpr}
        camera={{ position: [2.3, 0.5, 9.2], fov: 34, near: 0.1, far: 60 }}
        gl={{ antialias: tier !== 'high', powerPreference: 'high-performance', alpha: false }}
        eventSource={document.getElementById('root') ?? undefined}
        eventPrefix="client"
      >
        <color attach="background" args={[palette.ink]} />
        <fog attach="fog" args={[palette.ink, 11, 26]} />
        <PerformanceMonitor
          onDecline={() => setDpr((d) => Math.max(1, d - 0.25))}
          onIncline={() => setDpr((d) => Math.min(maxDpr, d + 0.25))}
        />
        <SceneLighting quality={tier === 'high' ? 'high' : 'low'} sweep={motion} />
        {tier === 'high' && (
          // polished dark stone floor: soft reflections ground the system like a gallery plinth
          <mesh rotation-x={-Math.PI / 2} position={[0, -2.9, 0]}>
            <planeGeometry args={[60, 60]} />
            <MeshReflectorMaterial
              resolution={256}
              mirror={0.6}
              mixBlur={6}
              mixStrength={1.4}
              blur={[400, 120]}
              roughness={0.85}
              depthScale={0.6}
              minDepthThreshold={0.4}
              maxDepthThreshold={1.2}
              color="#0b1013"
              metalness={0.6}
            />
          </mesh>
        )}
        <BusinessSystemModel
          minorCount={tier === 'high' ? 40 : tier === 'mid' ? 32 : 18}
          motion={motion}
          flow={motion && tier !== 'low'}
          labels={tier !== 'low'}
          labelPortal={wrap}
        />
        <CameraRig parallax={!touch} centered={tier === 'low'} motion={motion} />
        <StageFader el={wrap} />
        <FrameGate />
        <ReadySignal />
        {tier === 'high' && (
          <EffectComposer multisampling={2}>
            <Bloom mipmapBlur intensity={0.42} luminanceThreshold={0.82} luminanceSmoothing={0.2} />
            <Vignette offset={0.32} darkness={0.62} />
          </EffectComposer>
        )}
      </Canvas>
    </div>
  )
}
