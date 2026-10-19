// One material library shared by every scene, so all 3D reads as a single art-directed system.
import * as THREE from 'three'

export const palette = {
  ink: '#0a0e11',
  titanium: '#9aa3a7',
  titaniumWarm: '#b5a48f',
  darkMetal: '#4a555a',
  glass: '#0c1417',
  teal: '#1fa3a0', // Royal Teal accent
  tealBright: '#5fd4cc',
  amber: '#d39a55', // used only to flag findings in the Discovery chapter
}

let cache: ReturnType<typeof create> | null = null

function create() {
  const titanium = new THREE.MeshStandardMaterial({ color: palette.titanium, metalness: 1, roughness: 0.34 })
  const darkMetal = new THREE.MeshStandardMaterial({ color: palette.darkMetal, metalness: 0.85, roughness: 0.38 })
  const glass = new THREE.MeshPhysicalMaterial({
    color: palette.glass,
    metalness: 0.3,
    roughness: 0.08,
    transparent: true,
    opacity: 0.62,
    clearcoat: 1,
    clearcoatRoughness: 0.08,
    envMapIntensity: 1.4,
  })
  const tealLine = new THREE.MeshBasicMaterial({ color: palette.tealBright, toneMapped: false })
  return { titanium, darkMetal, glass, tealLine }
}

/** Shared base materials. Per-module variants are cloned from these. */
export function materials() {
  if (!cache) cache = create()
  return cache
}

export function disposeMaterials() {
  if (!cache) return
  Object.values(cache).forEach((m) => m.dispose())
  cache = null
}
