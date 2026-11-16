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
float clouds(vec2 q, float tt, bool cheap){
  float r = length(q) + 1e-4;
  float a = atan(q.y, q.x) + 0.22 * log(r) + tt * 0.006; // the slow twist
  float z = log(r) * 1.6 - tt * 0.045;                      // flying forward through them
  vec3 p = vec3(cos(a) * 1.35, sin(a) * 1.35, z);
  if (cheap) return fbm(p);
  vec3 w = vec3(fbm(p + vec3(0.0, 0.0, tt * 0.01)), fbm(p + vec3(5.2, 1.3, -tt * 0.008)), 0.0);
  float b = fbm(p + w * 0.7);
  return b + 0.05 * (1.0 - abs(2.0 * n(p * 5.0 + w * 2.0) - 1.0)) - 0.025; // billowy detail on the rims
}
void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 q = (uv - 0.5) * vec2(res.x / res.y, 1.0);
  float hd = 0.5 * length(vec2(res.x / res.y, 1.0));
  float rn = length(q) / hd;                                   // 0 centre .. 1 corner
  float d = clouds(q, t, false);
  float lit = d + (clouds(q * 0.965, t, true) - clouds(q, t, true)); // light from the middle                            // a sample nearer the centre = light from the middle
  float edge = smoothstep(0.382, 0.80, rn) * (1.0 - 0.35 * smoothstep(0.85, 1.0, rn));
  float body = smoothstep(0.44, 0.74, d) * edge;
  float shade = clamp((lit - d) * 5.0 + 0.5, 0.0, 1.0);
  float core = smoothstep(0.6, 0.85, d);            // thick parts sit in their own shadow
  vec3 deep = vec3(0.03, 0.16, 0.165);
  vec3 mist = vec3(0.62, 0.84, 0.81);
  vec3 rim  = vec3(0.86, 0.80, 0.66);                          // a hint of the brand's gold on the lit edges
  vec3 col = mix(deep, mist, (0.3 + 0.7 * shade) * (1.0 - 0.3 * core));
  col = mix(col, rim, smoothstep(0.7, 1.0, shade) * 0.25);
  float alpha = body * 0.23;
  gl_FragColor = vec4(col * alpha, alpha);
}`

export function CloudSky({ tier, reduced }: { tier: string; reduced: boolean }) {
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
    gl.uniform1f(uO, low ? 4 : 5)

    const scale = low ? 0.22 : 0.28
    const size = () => {
      const w = Math.max(160, Math.round(window.innerWidth * scale)), h = Math.max(160, Math.round(window.innerHeight * scale))
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uRes, w, h) }
    }
    size()
    // a random start, so every visit opens on a different sky
    const t0 = performance.now() / 1000 - Math.random() * 400
    const frame = (now: number) => { gl.uniform1f(uT, now / 1000 - t0); gl.drawArrays(gl.TRIANGLES, 0, 3) }

    let raf = 0, last = 0
    const step = 1000 / (low ? 18 : 24)
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
  }, [tier, reduced])

  return <canvas ref={ref} className="cloud-sky" aria-hidden="true" />
}
