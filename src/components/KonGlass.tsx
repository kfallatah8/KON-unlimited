// The footer word, as real glass: three hollow, thick-walled glass letters, part-filled with deep
// royal teal liquid. Everything is drawn by one fragment shader from exact signed-distance shapes,
// so it stays razor sharp at any size (rendered up to 2560px wide) and needs no images.
//
// Glass: an outer rounded rim and an inner lip catch two studio lights and a soft top softbox; the
// back edges of each letter show through, offset by a little parallax that follows the pointer.
// Liquid: a level surface per letter that tilts with gravity (phone tilt, or the pointer on a
// desktop), carries a small spring-and-wave simulation (sloshing, ripples where the pointer passes,
// a nudge on scroll, a splash on tap), a lit meniscus, the surface seen from slightly above, foam
// specks and a few twinkling glints.
// Cost: animates only while on screen, phones render at a lower resolution and 30 fps, a single
// still frame for reduced-motion visitors. Without WebGL the SVG version is shown instead.
import { useEffect, useRef, useState } from 'react'
import { KonFooterMark } from './KonFooterMark'

const VW = 1.5 // half the view width, in letter heights
const ASPECT = 2.45
const COLS = 64
// letter spans in shader space (before the 0.08 centring shift): x0, x1, base level
const SPANS: [number, number, number][] = [[-1.32, -0.38, 0.07], [-0.5, 0.5, 0.15], [0.57, 1.48, 0.15]]

const VERT = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0.0, 1.0); }'
const FRAG = `
precision highp float;
uniform vec2 res;
uniform float t, slope, px, agit;
uniform vec2 ptr;
uniform sampler2D hf;
const float R = 0.06;
const float W = 0.065;
const float W2 = 0.024;
const float VW = ${VW.toFixed(3)};

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y); }
float smin(float a, float b, float k){ float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0); return mix(b, a, h) - k * h * (1.0 - h); }
float sdBox(vec2 p, vec2 b){ vec2 d = abs(p) - b; return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0); }
float sdSeg(vec2 p, vec2 a, vec2 b, float w){ vec2 ba = b - a; float L = length(ba); vec2 dd = ba / L; vec2 q = p - (a + b) * 0.5;
  q = vec2(dot(q, dd), dot(q, vec2(-dd.y, dd.x))); return sdBox(q, vec2(L * 0.5, w)); }
float sdK(vec2 p){
  float d = sdBox(p - vec2(-1.08, 0.0), vec2(0.145 - R, 0.5 - R));
  d = smin(d, sdSeg(p, vec2(-0.95, -0.06), vec2(-0.40, 0.62), 0.13 - R), 0.035);
  d = smin(d, sdSeg(p, vec2(-0.92, 0.08), vec2(-0.40, -0.66), 0.135 - R), 0.035);
  return max(d, abs(p.y) - (0.5 - R)) - R; }
float sdO(vec2 p){ return abs(length(p) - 0.37) - 0.13; }
float sdN(vec2 p){
  float d = sdBox(p - vec2(0.63, 0.0), vec2(0.135 - R, 0.5 - R));
  d = smin(d, sdBox(p - vec2(1.26, 0.0), vec2(0.135 - R, 0.5 - R)), 0.03);
  d = smin(d, sdSeg(p, vec2(0.60, 0.66), vec2(1.29, -0.66), 0.14 - R), 0.03);
  return max(d, abs(p.y) - (0.5 - R)) - R; }
float sdAll(vec2 p){ return min(sdK(p + vec2(0.08, 0.0)), min(sdO(p), sdN(p - vec2(0.08, 0.0)))); }

// liquid surface height of letter k (0 K, 1 O, 2 N) at x
float level(float k, float x){
  float x0 = k < 0.5 ? -1.32 : (k < 1.5 ? -0.5 : 0.57);
  float x1 = k < 0.5 ? -0.38 : (k < 1.5 ? 0.5 : 1.48);
  float lv = k < 0.5 ? 0.07 : 0.15;
  float u = clamp((x - x0) / (x1 - x0), 0.0, 1.0);
  float sim = (texture2D(hf, vec2(u * ${((COLS - 1) / COLS).toFixed(5)} + ${(0.5 / COLS).toFixed(5)}, (k + 0.5) / 4.0)).r - 0.5) * 0.16;
  float idle = (0.022 * sin(x * 4.2 - t * 0.8 + k * 1.7) + 0.012 * sin(x * 9.0 + t * 1.3 + k) + 0.005 * sin(x * 19.0 - t * 2.2 + k * 3.1) + 0.002 * sin(x * 37.0 + t * 3.1)) * agit;
  return lv + slope * (x - (x0 + x1) * 0.5) + sim + idle;
}

void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = (uv * 2.0 - 1.0) * vec2(VW, VW * res.y / res.x) + vec2(0.08, 0.0);
  float dK = sdK(p + vec2(0.08, 0.0)), dO = sdO(p), dN = sdN(p - vec2(0.08, 0.0));
  float d = min(dK, min(dO, dN));
  if (d > 3.0 * px) { gl_FragColor = vec4(0.0); return; }
  float k = dK <= min(dO, dN) ? 0.0 : (dO <= dN ? 1.0 : 2.0);
  float cov = smoothstep(px, -px, d);

  float h = 0.0015;
  vec2 n2 = normalize(vec2(sdAll(p + vec2(h, 0.0)) - sdAll(p - vec2(h, 0.0)), sdAll(p + vec2(0.0, h)) - sdAll(p - vec2(0.0, h))) + 1e-6);
  float e = -d;

  // ---------- what sits inside the glass ----------
  float ys = level(k, p.x);
  float below = smoothstep(px, -px, p.y - ys);
  float depth = clamp((ys - p.y) / 0.7, 0.0, 1.0);
  vec3 top = vec3(0.02, 0.33, 0.39), mid = vec3(0.008, 0.19, 0.24), deep = vec3(0.002, 0.035, 0.055);
  vec3 liq = mix(top, mid, smoothstep(0.0, 0.16, depth));
  liq = mix(liq, deep, smoothstep(0.08, 0.75, depth));
  float wd = max(e - W, 0.0);
  liq += vec3(0.02, 0.17, 0.2) * exp(-wd / 0.02) * (1.0 - 0.5 * depth);
  liq += vec3(0.01, 0.08, 0.1) * exp(-pow((p.y - ys + 0.12) / 0.1, 2.0));          // light scattering at the walls
  liq *= 0.93 + 0.14 * noise(p * vec2(4.0, 8.0) + vec2(t * 0.05, -t * 0.035));       // slow inner currents
  liq += vec3(0.015, 0.09, 0.11) * pow(noise(p * 16.0 + vec2(t * 0.22, t * 0.1)), 3.0) * (1.0 - depth); // caustic flecks

  // the far side of the surface, seen from slightly above
  float band = 0.024 + 0.008 * sin(p.x * 5.0 + t * 0.7);
  float ysb = ys + band + 0.004 * sin(p.x * 17.0 - t * 1.4 + k);
  float onTop = smoothstep(ys - px, ys + px, p.y) * smoothstep(ysb + px, ysb - px, p.y);
  vec3 surf = vec3(0.05, 0.33, 0.40) + vec3(0.3, 0.45, 0.5) * pow(noise(vec2(p.x * 40.0 - t * 0.6, p.y * 90.0)), 4.0);
  vec3 empty = vec3(0.004, 0.012, 0.018) + vec3(0.012, 0.03, 0.04) * exp(-wd / 0.04);
  vec3 inside = mix(empty, liq, below);
  inside = mix(inside, surf, onTop * 0.85);
  inside += vec3(0.55, 0.92, 0.95) * exp(-abs(p.y - ys) / (px * 1.4 + 0.0012)) * 0.55;    // meniscus
  inside += vec3(0.4, 0.75, 0.78) * exp(-abs(p.y - ysb) / (px * 1.2 + 0.001)) * 0.22 * (1.0 - below);
  // foam specks riding the front edge
  float fx = floor(p.x / (px * 2.2 + 0.0016));
  float fz = step(0.9, hash(vec2(fx, floor(t * 2.0 + hash(vec2(fx, k)) * 9.0))));
  inside += vec3(0.9, 1.0, 1.0) * fz * exp(-abs(p.y - ys - 0.004) / 0.004) * 0.5;

  float cav = smoothstep(W - px, W + px, e);
  vec3 col = mix(inside * 0.9 + vec3(0.008, 0.014, 0.02), inside, cav);
  float lw = px * 1.1 + 0.0007;
  col += vec3(0.62, 0.8, 0.95) * (exp(-abs(e) / lw) * 0.6 + exp(-abs(e - W - W2) / lw) * 0.28);

  // ---------- the glass ----------
  vec3 N = vec3(0.0, 0.0, 1.0);
  if (e < W) { float u = clamp(e / W, 0.0, 1.0); float s = (1.0 - u) / sqrt(max(1.0 - (1.0 - u) * (1.0 - u), 0.015)); N = normalize(vec3(n2 * s, 1.0)); }
  else if (e < W + W2) { float u = (e - W) / W2; N = normalize(vec3(-n2 * (1.0 - u) * 1.6, 1.0)); }
  vec3 V = vec3(0.0, 0.0, 1.0);
  vec3 L1 = normalize(vec3(-0.35 + ptr.x * 0.25, 0.75 - ptr.y * 0.1, 0.55));
  vec3 L2 = normalize(vec3(0.75, 0.2, 0.6));
  float nh1 = max(dot(N, normalize(L1 + V)), 0.0), nh2 = max(dot(N, normalize(L2 + V)), 0.0);
  float spec = pow(nh1, 70.0) * 0.75 + pow(nh1, 700.0) * 2.4 + pow(nh2, 60.0) * 0.35 + pow(nh2, 600.0) * 1.2;
  vec3 r = reflect(-V, N);
  float fres = 0.04 + 0.96 * pow(1.0 - N.z, 5.0);
  float env = smoothstep(0.45, 0.95, r.y) * 0.8 + smoothstep(0.7, 0.97, -r.x) * 0.3 + smoothstep(0.75, 0.97, r.x) * 0.2;
  float rim = pow(1.0 - N.z, 2.6) * (0.5 + 0.35 * dot(n2, normalize(vec2(-0.35, 1.0))));
  col += vec3(0.78, 0.9, 1.0) * (env * fres * 2.2 + rim * 0.42) + vec3(1.0, 0.99, 0.97) * spec;
  // the thick wall itself: pale, silvery glass that brightens toward its curved edges
  float wall = (1.0 - smoothstep(W + W2 - px, W + W2 + px, e));
  col += vec3(0.42, 0.55, 0.66) * wall * (0.06 + 0.32 * pow(1.0 - N.z, 1.4)) * (0.75 + 0.25 * n2.y);
  // a broad, faint sheen across the front face
  col += vec3(0.6, 0.85, 0.9) * 0.035 * (1.0 - below) * smoothstep(0.35, 0.0, abs(p.y * 0.8 - p.x * 0.25 - 0.18 - ptr.x * 0.15));

  // back edges of each letter, seen through the glass
  vec2 par = vec2(0.016, -0.02) + ptr * vec2(0.012, 0.008);
  float dB = sdAll(p - par);
  float back = exp(-abs(dB + W * 0.5) / 0.0025) * 0.1 * step(dB, 0.002) * cav;
  col += vec3(0.6, 0.85, 1.0) * back * (1.0 - below * 0.55);

  // glints: a few stars twinkling on the wave crests
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float x0 = k < 0.5 ? -1.32 : (k < 1.5 ? -0.5 : 0.57);
    float x1 = k < 0.5 ? -0.38 : (k < 1.5 ? 0.5 : 1.48);
    float gx = mix(x0, x1, 0.2 + 0.3 * fi + 0.06 * sin(t * 0.3 + fi + k * 2.0));
    vec2 g = vec2(gx, level(k, gx) + 0.005);
    vec2 q = p - g;
    float tw = pow(0.5 + 0.5 * sin(t * (1.3 + 0.4 * fi) + fi * 2.1 + k * 1.3), 8.0);
    float star = exp(-length(q) / 0.0035) + (exp(-abs(q.x) / 0.0011) * exp(-abs(q.y) / 0.02) + exp(-abs(q.y) / 0.0011) * exp(-abs(q.x) / 0.02)) * 0.7;
    col += vec3(0.9, 1.0, 1.0) * star * tw * 0.9 * step(sdAll(g), -W);
  }

  col = col / (1.0 + col * 0.18);
  gl_FragColor = vec4(col * cov, cov);
}`

export function KonGlass() {
  const cv = useRef<HTMLCanvasElement>(null)
  const [fallback, setFallback] = useState(false)
  const [needAsk, setNeedAsk] = useState(false)
  const grant = useRef<() => void>(() => {})

  useEffect(() => {
    const c = cv.current
    if (!c) return
    const gl = c.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, depth: false, stencil: false, powerPreference: 'high-performance' })
    if (!gl) { setFallback(true); return }
    const sh = (type: number, src: string) => { const s = gl.createShader(type)!; gl.shaderSource(s, src); gl.compileShader(s); return s }
    const pr = gl.createProgram()!
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, VERT)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FRAG)); gl.linkProgram(pr)
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { setFallback(true); return }
    gl.useProgram(pr)
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const U = (n: string) => gl.getUniformLocation(pr, n)
    const uRes = U('res'), uT = U('t'), uSlope = U('slope'), uPx = U('px'), uAgit = U('agit'), uPtr = U('ptr')
    gl.uniform1i(U('hf'), 0)

    // the wave simulation lives in a tiny 64x4 texture, one row per letter
    const tex = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, tex)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1)
    const bytes = new Uint8Array(COLS * 4).fill(128)
    const upload = () => gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, COLS, 4, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, bytes)
    upload()

    const coarse = matchMedia('(pointer: coarse)').matches
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches
    const maxW = coarse ? 1400 : 2560
    let pxW = 0
    const size = () => {
      const r = c.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, coarse ? 2.5 : 2)
      const w = Math.max(320, Math.min(maxW, Math.round(r.width * dpr)))
      const hgt = Math.round(w / ASPECT)
      if (c.width !== w || c.height !== hgt) { c.width = w; c.height = hgt; gl.viewport(0, 0, w, hgt) }
      gl.uniform2f(uRes, w, hgt)
      pxW = (2 * VW) / w
      gl.uniform1f(uPx, pxW * 1.1)
    }
    size()

    // physics state
    const H = new Float32Array(3 * COLS), Vv = new Float32Array(3 * COLS)
    let ang = 0, angV = 0, target = 0, energy = 0
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 }
    const toWorldX = (clientX: number) => { const r = c.getBoundingClientRect(); return ((clientX - r.left) / r.width * 2 - 1) * VW + 0.08 }
    const kick = (x: number, amt: number) => {
      SPANS.forEach(([x0, x1], k) => {
        if (x < x0 || x > x1) return
        const i = Math.round(((x - x0) / (x1 - x0)) * (COLS - 1))
        for (let j = -3; j <= 3; j++) { const n = i + j; if (n >= 0 && n < COLS) Vv[k * COLS + n] += amt * Math.exp(-(j * j) / 4) }
      })
    }

    let raf = 0, last = 0, visible = false, drawn = 0
    const t0 = performance.now()
    const draw = (now: number) => {
      gl.uniform1f(uT, (now - t0) / 1000)
      gl.uniform1f(uSlope, Math.tan(ang) * 0.6)
      gl.uniform1f(uAgit, 1 + Math.min(2.5, energy))
      gl.uniform2f(uPtr, ptr.x, ptr.y)
      for (let i = 0; i < 3 * COLS; i++) bytes[i] = Math.max(0, Math.min(255, Math.round((H[i] / 0.16 + 0.5) * 255)))
      upload()
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const step = (now: number) => {
      raf = 0
      if (!visible) return
      const dt = Math.min(1 / 30, last ? (now - last) / 1000 : 1 / 60)
      last = now
      const sub = 2, h = dt / sub
      for (let s = 0; s < sub; s++) {
        const acc = (target - ang) * 26 - angV * 6.5
        angV += acc * h; ang += angV * h
        for (let k = 0; k < 3; k++) {
          const o = k * COLS
          for (let i = 0; i < COLS; i++) {
            const l = H[o + (i ? i - 1 : 0)], r = H[o + (i < COLS - 1 ? i + 1 : COLS - 1)]
            const edge = (i / (COLS - 1) - 0.5) * 2
            const a = (l + r - 2 * H[o + i]) * 1500 - H[o + i] * 5 - Vv[o + i] * 2.4 - angV * edge * 0.09
            Vv[o + i] += a * h
          }
          for (let i = 0; i < COLS; i++) H[o + i] = Math.max(-0.075, Math.min(0.075, H[o + i] + Vv[o + i] * h))
        }
      }
      energy = energy * Math.pow(0.35, dt) + Math.abs(angV) * dt * 3
      ptr.x += (ptr.tx - ptr.x) * Math.min(1, dt * 4); ptr.y += (ptr.ty - ptr.y) * Math.min(1, dt * 4)
      if (!coarse || now - drawn > 32) { draw(now); drawn = now }
      raf = requestAnimationFrame(step)
    }
    const wake = () => { if (visible && !raf && !still) { last = 0; raf = requestAnimationFrame(step) } }
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) { size(); draw(performance.now()) } wake() }, { rootMargin: '120px' })
    io.observe(c)

    // gravity: the phone's own tilt, or the pointer on a desktop
    const onTilt = (e: DeviceOrientationEvent) => {
      if (e.gamma == null) return
      const o = (screen.orientation?.angle ?? 0) as number
      const deg = o === 90 ? (e.beta ?? 0) : o === 270 || o === -90 ? -(e.beta ?? 0) : e.gamma
      target = -(Math.max(-40, Math.min(40, deg)) * Math.PI) / 180
      ptr.tx = Math.max(-1, Math.min(1, deg / 30))
      wake()
    }
    let lastX = 0, lastT = 0
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return
      ptr.tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1))
      ptr.ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1))
      target = -ptr.tx * 0.32
      const r = c.getBoundingClientRect()
      if (e.clientY > r.top && e.clientY < r.bottom && e.clientX > r.left && e.clientX < r.right) {
        const now = performance.now(), x = toWorldX(e.clientX)
        const v = lastT ? Math.max(-3, Math.min(3, (x - lastX) / Math.max(0.008, (now - lastT) / 1000))) : 0
        kick(x, -Math.abs(v) * 0.05)
        lastX = x; lastT = now
      }
    }
    const onTap = (e: PointerEvent) => { kick(toWorldX(e.clientX), -0.55); energy += 0.8; wake() }
    let sy = window.scrollY
    const onScroll = () => {
      const dy = window.scrollY - sy; sy = window.scrollY
      if (!visible) return
      const f = Math.max(-80, Math.min(80, dy)) * 0.0016
      for (let i = 0; i < 3 * COLS; i++) Vv[i] += f * Math.sin((i % COLS) * 0.45 + (i / COLS) * 1.3)
      energy += Math.abs(f) * 2
    }
    const D = window.DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> } | undefined
    const listen = () => window.addEventListener('deviceorientation', onTilt)
    if (D && typeof D.requestPermission === 'function' && coarse) { setNeedAsk(true); listen() } else if (D) listen()
    grant.current = () => { D?.requestPermission?.().then((s) => { if (s === 'granted') listen() }).catch(() => {}).finally(() => setNeedAsk(false)) }

    let rt = 0
    const onResize = () => { clearTimeout(rt); rt = window.setTimeout(() => { size(); draw(performance.now()) }, 120) }
    window.addEventListener('pointermove', onMove, { passive: true })
    c.addEventListener('pointerdown', onTap)
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    draw(t0)
    return () => {
      io.disconnect(); cancelAnimationFrame(raf); clearTimeout(rt)
      window.removeEventListener('deviceorientation', onTilt)
      window.removeEventListener('pointermove', onMove)
      c.removeEventListener('pointerdown', onTap)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [])

  if (fallback) return <KonFooterMark />
  const lang = typeof document !== 'undefined' ? document.documentElement.lang : 'ar'
  return (
    <div className="kon-foot kon-glass3d" dir="ltr">
      <canvas ref={cv} role="img" aria-label="KON Unlimited" />
      <p className="kf-sub"><span>Unlimited</span></p>
      {needAsk && (
        <button type="button" className="kl-ask" onClick={() => grant.current()}>
          {lang === 'ar' ? 'حرّك جوالك، والسائل يتحرك معك' : 'Tilt your phone and the liquid follows'}
        </button>
      )}
    </div>
  )
}
