// «من السطح إلى الجوهر» — one living light world behind the whole page.
// A single full-screen fragment shader, drawn at reduced resolution:
//   surface (hero)   → teal water with caustic light and drifting mist
//   descent          → the light thins as you read, so text always wins
//   pressure chapter → the water compresses into dark crystal, cracks of light, then the core ignites
//   finale           → the light rises again behind the glass KON
// No textures, no canvas readback (Safari rule), paused when hidden, static for reduced motion.
import { useEffect, useRef } from 'react'
import { depthState } from './depthState'

const VERT = `attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }`

const FRAG = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 res;
uniform float t;
uniform float depth;   // 0 top of page .. 1 bottom
uniform float press;   // 0..1 progress through the pressure chapter
uniform float pv;      // 0..1 how visible the pressure chapter is
uniform float rise;    // 0..1 light rising for the finale
uniform vec2 ptr;      // pointer 0..1

float h1(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
vec2 h2(vec2 p){ return fract(sin(vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)))) * 43758.5453); }

float noise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(h1(i), h1(i + vec2(1.0, 0.0)), u.x), mix(h1(i + vec2(0.0, 1.0)), h1(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p){
  float v = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++){ v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
  return v;
}

// Light focused by a moving water surface.
float caustic(vec2 p, float tt){
  vec2 i = p; float c = 1.0; const float inten = 0.005;
  for (int n = 0; n < 4; n++){
    float k = tt * (1.0 - (3.5 / float(n + 1)));
    i = p + vec2(cos(k - i.x) + sin(k + i.y), sin(k - i.y) + cos(k + i.x));
    c += 1.0 / length(vec2(p.x / (sin(i.x + k) / inten), p.y / (cos(i.y + k) / inten)));
  }
  c /= 4.0;
  c = 1.17 - pow(c, 1.4);
  return pow(abs(c), 8.0);
}

// Crystal cells: x = distance to the nearest facet edge, y = cell id, zw = cell centre offset
vec4 crystal(vec2 x, float tt){
  vec2 n = floor(x), f = fract(x);
  float md = 8.0, md2 = 8.0; vec2 id = vec2(0.0); vec2 mr = vec2(0.0);
  for (int j = -1; j <= 1; j++)
  for (int i = -1; i <= 1; i++){
    vec2 g = vec2(float(i), float(j));
    vec2 o = h2(n + g);
    o = 0.5 + 0.42 * sin(tt * 0.15 + 6.2831 * o);
    vec2 r = g + o - f;
    float d = dot(r, r);
    if (d < md){ md2 = md; md = d; id = n + g; mr = r; } else if (d < md2){ md2 = d; }
  }
  return vec4(sqrt(md2) - sqrt(md), h1(id), mr);
}

void main(){
  vec2 uv = gl_FragCoord.xy / res;
  float asp = res.x / res.y;
  // shortest side = 1, so the core keeps its size on tall phones
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / min(res.x, res.y);

  // palette (brand): abyss, deep teal, teal, teal-hi, aqua
  vec3 abyss = vec3(0.004, 0.051, 0.059);
  vec3 deep  = vec3(0.016, 0.149, 0.165);
  vec3 teal  = vec3(0.071, 0.647, 0.588);
  vec3 hi    = vec3(0.373, 0.890, 0.824);
  vec3 aqua  = vec3(0.659, 0.961, 0.918);

  float surf = 1.0 - smoothstep(0.0, 0.16, depth);           // hero → first sections
  float calm = 1.0 - surf;

  // sky of water: lighter where the surface is, deeper as we descend
  float topGlow = smoothstep(-0.2, 0.55, p.y);
  vec3 col = mix(abyss, deep, topGlow * (0.55 + 0.45 * surf) + 0.12 * rise);
  // the surface itself: a bright band of water light at the very top of the hero
  col += mix(teal, aqua, 0.25) * surf * 0.22 * smoothstep(0.15, 0.62, p.y) * (0.6 + 0.4 * fbm(vec2(p.x * 3.0 + t * 0.05, t * 0.03)));

  // drifting mist, the brand clouds seen from under the surface
  float tt = t * 0.06;
  float m = fbm(p * 1.6 + vec2(tt * 1.3, -tt * 0.7) + depth * 3.0);
  float m2 = fbm(p * 3.1 - vec2(tt * 0.9, tt * 0.4) + m);
  float mist = smoothstep(0.42, 0.9, m * 0.65 + m2 * 0.5);
  col += deep * mist * (0.55 + 0.35 * surf) + teal * mist * 0.07 * (0.4 + surf);

  // god rays falling from the surface, they lean with the pointer
  float lean = (ptr.x - 0.5) * 0.35;
  float rx = p.x + (0.5 - uv.y) * lean;
  float rays = pow(0.5 + 0.5 * sin(rx * 7.0 + sin(rx * 3.1 + t * 0.12) * 1.6), 6.0) * 0.6
             + pow(0.5 + 0.5 * sin(rx * 13.0 - t * 0.09 + 1.3), 10.0) * 0.4;
  rays *= smoothstep(-0.55, 0.55, p.y) * (0.35 + 0.65 * fbm(vec2(rx * 4.0, t * 0.05)));
  col += mix(teal, hi, 0.3) * rays * (0.3 * surf + 0.035 * calm + 0.12 * rise);

  // caustic light pooled across the page, strongest at the surface
  vec2 cp = mod(p * 4.2 + vec2(0.0, depth * 2.0), 6.2831) - 250.0;
  float cs = caustic(cp, t * 0.32 + 23.0);
  float pool = smoothstep(0.75, -0.25, length(p - vec2((ptr.x - 0.5) * asp * 0.35, 0.18)));
  col += mix(teal, aqua, 0.35) * cs * (0.62 * surf + 0.06 * calm + 0.12 * rise) * (0.35 + 0.65 * pool) * smoothstep(-0.65, 0.4, p.y);

  // ── pressure: the water compresses into crystal, then the core ignites
  if (pv > 0.001){
    float squeeze = smoothstep(0.0, 0.5, press);
    float ignite = smoothstep(0.52, 0.9, press);
    float r = length(p);
    // everything is drawn toward the core while pressure builds
    vec2 q = p * (1.0 + squeeze * 0.9);
    float scale = mix(2.2, 4.2, squeeze);
    vec4 cr = crystal(q * scale + vec2(3.1, 7.7), t);
    float edge = cr.x;
    float cell = cr.y;
    vec2 nrm = normalize(cr.zw + 1e-4);
    // dark compressed carbon (deep teal, never black coal), each facet tilted a little differently
    float tilt = dot(nrm, normalize(vec2(0.4, 0.9))) * 0.5 + 0.5;
    vec3 carbon = mix(vec3(0.006, 0.03, 0.034), deep * 0.75, cell * 0.5 + tilt * 0.25);
    // cracks of light run along the facet edges, brighter toward the core
    float crack = smoothstep(0.045, 0.0, edge) * squeeze * (0.35 + 0.65 * smoothstep(1.0, 0.1, r));
    // once ignited, the facets nearest the core turn into lit gem faces
    vec2 L = normalize(vec2(ptr.x - 0.5, ptr.y - 0.5) * 1.2 + vec2(0.25, 0.7));
    float face = pow(max(0.0, dot(nrm, L) * 0.5 + 0.5), 5.0);
    vec3 gem = mix(deep * 1.4 + teal * 0.25, aqua, face * (0.45 + 0.55 * cell)) + hi * 0.12;
    float coreR = mix(0.0, 0.62, ignite);
    float coreMask = smoothstep(coreR, coreR * 0.35, r) * ignite;
    vec3 pc = mix(carbon, gem, coreMask);
    pc += hi * crack * (0.55 + 0.45 * sin(t * 1.2 + cell * 20.0));
    // a slight dispersion on the bright edges inside the core
    vec3 disp = vec3(smoothstep(0.04, 0.0, edge - 0.008), smoothstep(0.04, 0.0, edge), smoothstep(0.04, 0.0, edge + 0.008));
    pc += mix(hi, vec3(1.0), 0.5) * disp * coreMask * 0.6;
    // the bloom of the core
    pc += aqua * ignite * exp(-r * r * 7.0) * 0.38;
    // dark frame at the edges keeps the core the only bright thing on screen
    pc *= mix(1.0, smoothstep(1.25, 0.25, r), 0.75);
    col = mix(col, pc, pv);
  }

  // the finale: light rises from below toward the glass KON
  col += teal * rise * exp(-pow(p.y + 0.15, 2.0) * 5.0) * 0.18;

  // keep reading areas calm, vignette, dither against banding
  float vig = smoothstep(1.25, 0.25, length(p * vec2(0.9, 1.15)));
  col *= 0.55 + 0.45 * vig;
  col = col / (1.0 + col * 0.35);
  col += (h1(gl_FragCoord.xy + fract(t)) - 0.5) / 255.0 * 2.0;
  gl_FragColor = vec4(col, 1.0);
}`

export function Depth() {
  const cv = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const c = cv.current
    if (!c) return
    const gl = c.getContext('webgl', { alpha: false, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: false })
    if (!gl) { c.classList.add('is-off'); return }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
    const pr = gl.createProgram()!
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { c.classList.add('is-off'); return }
    gl.useProgram(pr)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(pr, n)
    const uRes = U('res'), uT = U('t'), uDepth = U('depth'), uPress = U('press'), uPv = U('pv'), uRise = U('rise'), uPtr = U('ptr')

    const coarse = matchMedia('(pointer: coarse)').matches
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    // quality: a fraction of CSS pixels, the image is soft by nature so this stays invisible
    const scale = coarse ? 0.42 : 0.5
    const size = () => {
      const w = Math.max(240, Math.round(innerWidth * scale))
      const h = Math.max(240, Math.round(innerHeight * scale))
      if (c.width !== w || c.height !== h) { c.width = w; c.height = h; gl.viewport(0, 0, w, h) }
      gl.uniform2f(uRes, w, h)
    }
    size()

    let raf = 0
    let last = 0
    let visible = !document.hidden
    const minDt = coarse ? 1000 / 30 : 1000 / 50
    const sm = { depth: 0, press: 0, pv: 0, rise: 0, px: 0.5, py: 0.6 }
    const t0 = performance.now()
    const draw = (now: number) => {
      const k = still ? 1 : 0.12
      sm.depth += (depthState.depth - sm.depth) * k
      sm.press += (depthState.press - sm.press) * (still ? 1 : 0.18)
      sm.pv += (depthState.pv - sm.pv) * (still ? 1 : 0.12)
      sm.rise += (depthState.rise - sm.rise) * k
      sm.px += (depthState.px - sm.px) * 0.05
      sm.py += (depthState.py - sm.py) * 0.05
      gl.uniform1f(uT, still ? 12 : (now - t0) / 1000)
      gl.uniform1f(uDepth, sm.depth)
      gl.uniform1f(uPress, sm.press)
      gl.uniform1f(uPv, sm.pv)
      gl.uniform1f(uRise, sm.rise)
      gl.uniform2f(uPtr, sm.px, sm.py)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const loop = (now: number) => {
      raf = 0
      if (!visible) return
      if (now - last >= minDt - 1) { last = now; draw(now) }
      raf = requestAnimationFrame(loop)
    }
    const kick = () => { if (still) { requestAnimationFrame(draw) } else if (!raf && visible) raf = requestAnimationFrame(loop) }
    const onVis = () => { visible = !document.hidden; if (visible) kick() }
    const onResize = () => { size(); kick() }
    const onMove = (e: PointerEvent) => { depthState.px = e.clientX / innerWidth; depthState.py = 1 - e.clientY / innerHeight }
    document.addEventListener('visibilitychange', onVis)
    addEventListener('resize', onResize)
    addEventListener('pointermove', onMove, { passive: true })
    if (still) addEventListener('scroll', kick, { passive: true })
    depthState.onChange = kick
    kick()
    requestAnimationFrame(() => c.classList.add('is-on'))
    return () => {
      cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVis)
      removeEventListener('resize', onResize)
      removeEventListener('pointermove', onMove)
      removeEventListener('scroll', kick)
      depthState.onChange = null
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  return <canvas ref={cv} className="fd-depth" aria-hidden="true" />
}
