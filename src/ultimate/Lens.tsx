// The hero's "beneath the surface" lens: a dark royal-teal fluid on the surface; inside a soft
// lens the fluid turns to crystal facets lit from within. One full-screen triangle, drawn at
// reduced resolution, paused whenever the hero is off screen or the tab is hidden.
import { useEffect, useRef, useState } from 'react'

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`

const FRAG = `precision mediump float;
uniform vec2 res; uniform float t; uniform vec2 lens; uniform float rad; uniform float rtl;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 5; i++){ v += a*n(p); p = p*2.03 + 7.1; a *= 0.5; } return v; }
// crystal: distance to nearest and second-nearest cell centre gives facet edges
vec3 cells(vec2 p){ vec2 i = floor(p), f = fract(p); float d1 = 8.0, d2 = 8.0; float id = 0.0;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ vec2 g = vec2(float(x), float(y));
    vec2 o = vec2(h(i+g), h(i+g+3.7)); o = 0.5 + 0.42*sin(t*0.25 + 6.2831*o);
    float d = length(g + o - f); if (d < d1){ d2 = d1; d1 = d; id = h(i+g+9.1); } else if (d < d2) d2 = d; }
  return vec3(d1, d2, id); }
void main(){
  vec2 uv = gl_FragCoord.xy / res; float asp = res.x / res.y;
  vec2 p = vec2(uv.x*asp, uv.y);
  // surface: slow domain-warped fluid, deep teal
  vec2 q = vec2(fbm(p*1.6 + t*0.03), fbm(p*1.6 + vec2(5.2, 1.3) - t*0.025));
  float f = fbm(p*1.9 + 2.2*q + vec2(0.0, t*0.02));
  vec3 deep = vec3(0.004, 0.05, 0.055), mid = vec3(0.016, 0.32, 0.30), hi = vec3(0.03, 0.48, 0.45);
  vec3 surf = mix(deep, mid, smoothstep(0.35, 0.95, f));
  surf = mix(surf, hi, smoothstep(0.78, 1.05, f + 0.25*q.x) * 0.55);
  // lens mask
  vec2 lc = vec2(lens.x*asp, lens.y);
  float d = length(p - lc);
  float m = 1.0 - smoothstep(rad*0.72, rad, d);
  float rim = smoothstep(rad*0.86, rad*0.97, d) * (1.0 - smoothstep(rad*0.97, rad*1.04, d));
  // beneath: refracted crystal facets lit from within
  vec2 rp = p + (p - lc) * 0.28 * m;
  vec3 c = cells(rp*9.0 + q*0.5);
  vec3 c2 = cells(rp*4.0 - q*0.3 + 11.0);
  float edge = 1.0 - smoothstep(0.0, 0.035, c.y - c.x);
  float edge2 = 1.0 - smoothstep(0.0, 0.05, c2.y - c2.x);
  // each facet has its own tilt; a slow light sweeps across them
  vec3 nrm = normalize(vec3(c.z - 0.5, fract(c.z*7.13) - 0.5, 0.65));
  vec3 lt = normalize(vec3(cos(t*0.23), sin(t*0.19), 0.9));
  float lit = pow(max(dot(nrm, lt), 0.0), 3.0);
  float tone = fract(c2.z*3.7);
  vec3 gem = mix(vec3(0.012, 0.2, 0.2), vec3(0.03, 0.42, 0.4), tone);
  gem = mix(gem, vec3(0.55, 0.92, 0.86), lit*0.6);
  gem += vec3(0.7, 1.0, 0.96) * (edge*0.28 + edge2*0.22);
  float glint = pow(max(0.0, sin(c.z*53.0 + t*1.1)), 40.0) * lit;
  gem += vec3(1.0) * glint * 0.9;
  gem = mix(gem, surf*1.8, 0.18);
  vec3 col = mix(surf, gem, m);
  col += vec3(0.37, 0.89, 0.82) * rim * 0.16;
  // the copy side stays quiet for reading
  float side = rtl > 0.5 ? uv.x : 1.0 - uv.x;
  col *= mix(0.55, 1.0, smoothstep(0.35, 0.9, 1.0 - side + 0.35));
  col *= 0.75 + 0.25*smoothstep(0.0, 0.6, uv.y);
  gl_FragColor = vec4(col, 1.0);
}`

export function Lens({ rtl }: { rtl: boolean }) {
  const cv = useRef<HTMLCanvasElement>(null)
  const [ok, setOk] = useState(true)
  const rtlRef = useRef(rtl)
  rtlRef.current = rtl

  useEffect(() => {
    const c = cv.current
    if (!c) return
    const gl = c.getContext('webgl', { antialias: false, depth: false, stencil: false, alpha: false, powerPreference: 'low-power' })
    if (!gl) { setOk(false); return }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
    const pr = gl.createProgram()!
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { setOk(false); return }
    gl.useProgram(pr)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (k: string) => gl.getUniformLocation(pr, k)
    const uRes = U('res'), uT = U('t'), uLens = U('lens'), uRad = U('rad'), uRtl = U('rtl')

    const coarse = matchMedia('(pointer: coarse)').matches
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const scale = coarse ? 0.5 : 0.6
    const size = () => {
      const r = c.getBoundingClientRect()
      const w = Math.max(160, Math.round(r.width * scale)), hh = Math.max(160, Math.round(r.height * scale))
      if (c.width !== w || c.height !== hh) { c.width = w; c.height = hh; gl.viewport(0, 0, w, hh) }
      gl.uniform2f(uRes, w, hh)
    }
    size()
    const ro = new ResizeObserver(size); ro.observe(c)

    // the lens drifts on its own; a pointer, a finger or the phone's tilt takes it over for a while
    const L = { x: 0.3, y: 0.55, tx: 0.3, ty: 0.55, hold: 0 }
    const toLens = (cx: number, cy: number) => {
      const r = c.getBoundingClientRect()
      L.tx = (cx - r.left) / r.width; L.ty = 1 - (cy - r.top) / r.height; L.hold = performance.now() + 3500
    }
    const onMove = (e: PointerEvent) => toLens(e.clientX, e.clientY)
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null || e.beta == null) return
      L.tx = 0.5 + Math.max(-0.4, Math.min(0.4, e.gamma / 60)); L.ty = 0.55 - Math.max(-0.3, Math.min(0.3, (e.beta - 45) / 80)); L.hold = performance.now() + 1500
    }
    const host = c.parentElement!
    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerdown', onMove, { passive: true })
    window.addEventListener('deviceorientation', onTilt, { passive: true })

    let raf = 0, visible = true, last = 0
    const t0 = performance.now()
    const frame = (now: number) => {
      raf = 0
      if (!visible || document.hidden) return
      if (coarse && now - last < 32) { raf = requestAnimationFrame(frame); return }
      last = now
      const t = (now - t0) / 1000
      if (now > L.hold) {
        const narrow = c.clientWidth < 700
        const baseX = narrow ? 0.5 : rtlRef.current ? 0.17 : 0.83
        L.tx = baseX + Math.sin(t * 0.21) * (narrow ? 0.28 : 0.08)
        L.ty = (narrow ? 0.28 : 0.48) + Math.sin(t * 0.17 + 1.3) * (narrow ? 0.1 : 0.18)
      }
      L.x += (L.tx - L.x) * 0.06; L.y += (L.ty - L.y) * 0.06
      const narrow = c.clientWidth < 700
      gl.uniform1f(uT, t)
      gl.uniform2f(uLens, L.x, L.y)
      gl.uniform1f(uRad, narrow ? 0.19 : 0.23)
      gl.uniform1f(uRtl, rtlRef.current ? 1 : 0)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
      if (!still) raf = requestAnimationFrame(frame)
    }
    const kick = () => { if (!raf) raf = requestAnimationFrame(frame) }
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick() })
    io.observe(c)
    const onVis = () => kick()
    document.addEventListener('visibilitychange', onVis)
    kick()
    if (still) setTimeout(kick, 200)
    return () => {
      cancelAnimationFrame(raf); ro.disconnect(); io.disconnect()
      host.removeEventListener('pointermove', onMove); host.removeEventListener('pointerdown', onMove)
      window.removeEventListener('deviceorientation', onTilt)
      document.removeEventListener('visibilitychange', onVis)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return ok ? <canvas ref={cv} className="u-lens" aria-hidden="true" /> : <div className="u-lens is-fallback" aria-hidden="true" />
}
