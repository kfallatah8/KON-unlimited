// Behind everything: a slow, endless rise through soft clouds.
//
// Composition: the clouds live at the edges of the screen and thin out toward the centre, so the
// eye settles in the middle without being told to. The open centre has a radius of 0.382 of the
// half-diagonal (the golden-ratio minor), and the densest band sits at 0.618.
// Motion: the clouds are sampled in log-polar space and the radial coordinate scrolls with time,
// which reads as gliding forward and upward through them. Because the noise is continuous and
// 3D (angle is fed as a point on a circle), the loop has no seam and never visibly repeats.
// A very slow twist adds the "organised chaos".
//
// Cost: rendered at about a third of the screen's resolution (clouds are soft, so the upscale is
// invisible), capped at 30 fps, paused when the tab is hidden, and a single still frame for
// reduced-motion visitors.
import { useEffect, useRef } from 'react'

const VERT = `attribute vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`

const FRAG = `
precision mediump float;
uniform vec2 res;
uniform float t;
uniform float oct;

float h(vec3 p){ p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n(vec3 x){
  vec3 i = floor(x), f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(h(i), h(i + vec3(1,0,0)), f.x), mix(h(i + vec3(0,1,0)), h(i + vec3(1,1,0)), f.x), f.y),
             mix(mix(h(i + vec3(0,0,1)), h(i + vec3(1,0,1)), f.x), mix(h(i + vec3(0,1,1)), h(i + vec3(1,1,1)), f.x), f.y), f.z);
}
float fbm(vec3 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 6; i++) { if (float(i) >= oct) break; v += a * n(p); p = p * 2.03 + vec3(1.7, 9.2, 3.1); a *= 0.5; }
  return v;
}
uniform float front;   // 0 = the deep layer behind the gems, 1 = thin wisps in front of them
float clouds(vec2 q, float tt, bool cheap){
  float r = length(q) + 1e-4;
  float sp = 1.0 + front * 0.7;                                   // nearer clouds pass faster (parallax)
  float a = atan(q.y, q.x) + 0.22 * log(r) + tt * 0.006 + front * 2.1; // the slow twist
  float z = log(r) * (1.6 - front * 0.5) - tt * 0.045 * sp + front * 40.0; // flying forward through them
  vec3 p = vec3(cos(a), sin(a), 0.0) * (1.35 - front * 0.35) + vec3(0.0, 0.0, z);
  if (cheap) return fbm(p);
  vec3 w = vec3(fbm(p + vec3(0.0, 0.0, tt * 0.01)), fbm(p + vec3(5.2, 1.3, -tt * 0.008)), 0.0);
  return fbm(p + w * 0.75);
}
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 q = (uv - 0.5) * vec2(res.x / res.y, 1.0);
  float hd = 0.5 * length(vec2(res.x / res.y, 1.0));
  float rn = length(q) / hd;                                       // 0 centre .. 1 corner
  float d = clouds(q, t, false);
  float lo = mix(0.45, 0.53, front), hi = mix(0.70, 0.74, front);
  float body = smoothstep(lo, hi, d);
  // light comes from the open centre: march a few steps toward it and let thicker cloud shadow itself
  vec2 dir = -normalize(q + 1e-4) * 0.045;
  float od = 0.0;
  for (int i = 1; i <= 3; i++) od += smoothstep(lo, hi + 0.06, clouds(q + dir * float(i), t, true));
  float light = exp(-od * 0.9);
  float silver = pow(1.0 - body, 2.0) * light;                     // thin edges facing the light glow
  vec3 shadow = vec3(0.025, 0.12, 0.13);
  vec3 sun = vec3(0.80, 0.93, 0.90);
  vec3 gold = vec3(0.92, 0.84, 0.66);
  vec3 col = mix(shadow, sun, 0.12 + 0.88 * light);
  col = mix(col, gold, silver * 0.35);
  float edge = smoothstep(0.382, 0.82, rn) * (1.0 - 0.3 * smoothstep(0.88, 1.0, rn));
  float alpha = body * edge * mix(0.26, 0.15, front);
  gl_FragColor = vec4(col * alpha, alpha);
}`

export function CloudSky({ tier, reduced, front = false }: { tier: string; reduced: boolean; front?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const cv = ref.current
    if (!cv) return
    const gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'low-power' })
    if (!gl) return
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
    const pr = gl.createProgram()!
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return
    gl.useProgram(pr)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(pr, 'res'), uT = gl.getUniformLocation(pr, 't'), uO = gl.getUniformLocation(pr, 'oct')
    const low = tier === 'low'
    gl.uniform1f(uO, low || front ? 4 : 5)
    gl.uniform1f(gl.getUniformLocation(pr, 'front'), front ? 1 : 0)

    const scale = (low ? 0.22 : 0.28) * (front ? 0.8 : 1)
    const size = () => {
      const w = Math.max(160, Math.round(window.innerWidth * scale)), h = Math.max(160, Math.round(window.innerHeight * scale))
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h) }
    }
    size()
    // a random start, so every visit opens on a different sky
    const t0 = performance.now() / 1000 - Math.random() * 400
    const frame = (now: number) => { gl.uniform1f(uT, now / 1000 - t0); gl.drawArrays(gl.TRIANGLES, 0, 3) }

    let raf = 0, last = 0
    const step = 1000 / (low ? 18 : front ? 20 : 24)
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      if (now - last < step) return
      last = now
      frame(now)
    }
    const start = () => { if (!raf && !reduced && !document.hidden) raf = requestAnimationFrame(loop) }
    const stop = () => { cancelAnimationFrame(raf); raf = 0 }
    const onVis = () => (document.hidden ? stop() : start())
    let rt = 0
    const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => { size(); frame(performance.now()) }, 150) }

    frame(performance.now())
    requestAnimationFrame(() => cv.classList.add('is-on'))
    start()
    document.addEventListener('visibilitychange', onVis)
    window.addEventListener('resize', onResize)
    return () => {
      stop(); clearTimeout(rt)
      document.removeEventListener('visibilitychange', onVis)
      window.removeEventListener('resize', onResize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [tier, reduced, front])

  return <canvas ref={ref} className={`cloud-sky${front ? ' is-front' : ''}`} aria-hidden="true" />
}
