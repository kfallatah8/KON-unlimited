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
  // heavy ocean swell: exponential-sine waves (sharp crests, broad troughs), slow because the liquid is thick
  float idle = 0.024 * (exp(sin(x * 2.4 - t * 0.42 + k * 1.7)) - 1.2) / 1.7
             + 0.011 * (exp(sin(x * 4.9 + t * 0.6 + k * 0.6)) - 1.2) / 1.7
             + 0.004 * sin(x * 9.5 - t * 0.85 + k * 2.3);
  idle *= agit;
  return lv + slope * (x - (x0 + x1) * 0.5) + sim + idle;
}

void main(){
  vec2 uv = gl_FragCoord.xy / res;
  vec2 p = (uv * 2.0 - 1.0) * vec2(VW, VW * res.y / res.x) + vec2(0.08, 0.0);
  float dK = sdK(p + vec2(0.08, 0.0)), dO = sdO(p), dN = sdN(p - vec2(0.08, 0.0));
  float d = min(dK, min(dO, dN));
  if (d > 3.0 * px) {
    float g = exp(-d / 0.07) * 0.05 * smoothstep(0.25, -0.5, p.y);
    gl_FragColor = vec4(vec3(0.03, 0.42, 0.39) * g, g);
    return;
  }
  float k = dK <= min(dO, dN) ? 0.0 : (dO <= dN ? 1.0 : 2.0);
  float cov = smoothstep(px, -px, d);

  float h = 0.0015;
  vec2 n2 = normalize(vec2(sdAll(p + vec2(h, 0.0)) - sdAll(p - vec2(h, 0.0)), sdAll(p + vec2(0.0, h)) - sdAll(p - vec2(0.0, h))) + 1e-6);
  float e = -d;

  // ---------- what sits inside the glass ----------
  // seen through the thick wall, the inside is bent inward (refraction)
  float inWall = 1.0 - smoothstep(W + W2 - px, W + W2 + px, e);
  float cav0 = smoothstep(W - px, W + px, e);
  vec2 q = p - n2 * (W + W2 - e) * 0.55 * inWall;
  float wd0 = max(e - W, 0.0);
  float ys = level(k, q.x) + 0.006 * exp(-wd0 / 0.022) * smoothstep(0.0, W, e);
  float ysR = level(k, q.x + 0.01);
  float sl = (ysR - ys) / 0.01;                                     // local surface slope
  float crest = clamp((ys - level(k, q.x - 0.12) * 0.5 - level(k, q.x + 0.12) * 0.5) * 18.0, -1.0, 1.0);
  float below = smoothstep(px, -px, q.y - ys);
  float dz = max(ys - q.y, 0.0);
  float depth = clamp(dz / 0.62, 0.0, 1.0);
  // KON royal deep teal: #3FD0BD, #14AB9A, #087A72, #04524D, #012F2E
  // KON royal deep teal: #14AB9A -> #087A72 -> #04524D -> #012F2E -> abyss
  vec3 c0 = vec3(0.078, 0.62, 0.56), c1 = vec3(0.022, 0.43, 0.40), c2 = vec3(0.010, 0.28, 0.265), c3 = vec3(0.002, 0.15, 0.148), c4 = vec3(0.0, 0.05, 0.055);
  vec3 liq = mix(c0, c1, smoothstep(0.0, 0.07, depth));
  liq = mix(liq, c2, smoothstep(0.05, 0.3, depth));
  liq = mix(liq, c3, smoothstep(0.25, 0.6, depth));
  liq = mix(liq, c4, smoothstep(0.55, 1.0, depth));
  float wd = max(e - W, 0.0);
  // light passing through the thin crests (subsurface glow)
  liq += vec3(0.05, 0.42, 0.38) * max(crest, 0.0) * exp(-dz / 0.05) * 0.55;
  // soft light shafts falling from the surface, drifting with the swell
  float shaft = noise(vec2(q.x * 7.0 + dz * 2.2 - t * 0.12, t * 0.05)) * noise(vec2(q.x * 13.0 - dz * 1.4 + t * 0.09, 3.0));
  liq += vec3(0.03, 0.26, 0.24) * pow(shaft, 1.6) * exp(-dz / 0.32) * 0.75;
  // caustic web dancing on the back wall
  float c1n = 1.0 - abs(noise(q * vec2(11.0, 15.0) + vec2(t * 0.16, -t * 0.08)) * 2.0 - 1.0);
  float c2n = 1.0 - abs(noise(q * vec2(17.0, 9.0) - vec2(t * 0.11, t * 0.13) + 4.0) * 2.0 - 1.0);
  liq += vec3(0.08, 0.5, 0.46) * pow(c1n * c2n, 7.0) * exp(-dz / 0.28) * 0.7;
  // the walls catch light (scattering)
  liq += vec3(0.02, 0.2, 0.19) * exp(-wd / 0.018) * (1.0 - 0.55 * depth);
  // slow currents and tiny suspended bubbles rising
  liq *= 0.94 + 0.12 * noise(q * vec2(3.0, 6.0) + vec2(t * 0.03, -t * 0.025));
  vec2 bc = vec2(q.x * 46.0, q.y * 46.0 - t * 0.9);
  vec2 bi = floor(bc), bf = fract(bc) - 0.5;
  float bh = hash(bi + k * 13.0);
  vec2 bo = vec2(hash(bi + 1.7) - 0.5, hash(bi + 3.1) - 0.5) * 0.6 + vec2(0.06 * sin(t + bh * 6.3), 0.0);
  float bub = step(0.965, bh) * smoothstep(0.11, 0.0, length(bf - bo)) * (1.0 - depth * 0.7);
  liq += vec3(0.5, 0.95, 0.9) * bub * 0.22;

  // the top of the liquid, seen slightly from above: a heavy, glossy plane
  float band = 0.03 + 0.02 * clamp(abs(sl), 0.0, 1.0);
  float ysb = ys + band;
  float onTop = smoothstep(ys - px, ys + px, q.y) * smoothstep(ysb + px, ysb - px, q.y);
  float sv = clamp((q.y - ys) / band, 0.0, 1.0);               // 0 front lip -> 1 far edge
  // the plane reflects the overhead softbox more as it recedes (fresnel), bent by the swell
  float refl = smoothstep(0.15, 1.0, sv) * (0.55 + 0.45 * smoothstep(-0.6, 0.6, -sl));
  float streak = smoothstep(0.55, 1.0, noise(vec2(q.x * 5.0 - sl * 3.0 - t * 0.12, sv * 2.0 + k)));
  vec3 surf = mix(c1 * 1.05, c0 * 1.15, sv) + vec3(0.62, 0.95, 0.9) * refl * 0.32 + vec3(0.9, 1.0, 0.98) * streak * refl * 0.35;
  // a soft glow lives just under the surface where light enters the thick liquid
  liq += vec3(0.04, 0.36, 0.33) * exp(-dz / 0.035) * 0.55;
  // and a darker meniscus shadow a hair below the lip gives it weight
  liq *= 1.0 - 0.35 * exp(-abs(dz - 0.006) / 0.004);
  vec3 empty = vec3(0.003, 0.012, 0.014) + vec3(0.01, 0.035, 0.035) * exp(-wd / 0.035);
  vec3 inside = mix(empty, liq, below);
  inside = mix(inside, surf, onTop);
  inside += vec3(0.7, 1.0, 0.95) * exp(-abs(q.y - ys) / (px * 1.0 + 0.0008)) * (0.5 + 0.25 * max(crest, 0.0));   // bright front lip
  inside += vec3(0.75, 1.0, 0.96) * exp(-abs(q.y - ysb) / (px * 1.2 + 0.0012)) * 0.45 * (1.0 - below);         // far edge catching light

  float cav = smoothstep(W - px, W + px, e);
  vec3 col = mix(inside * 0.97 + vec3(0.004, 0.009, 0.01) * (1.0 - below), inside, cav);
  float lw = px * 1.1 + 0.0007;
  // crisp edge lines with a whisper of dispersion (red, green, blue split by a hair)
  vec3 edge = vec3(exp(-abs(e - 0.0009) / lw), exp(-abs(e) / lw), exp(-abs(e + 0.0009) / lw)) * 0.6
            + vec3(exp(-abs(e - W - W2 - 0.0008) / lw), exp(-abs(e - W - W2) / lw), exp(-abs(e - W - W2 + 0.0008) / lw)) * 0.26;
  col += edge * vec3(0.8, 0.95, 1.0);

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
  col += vec3(0.42, 0.55, 0.66) * wall * (0.06 + 0.32 * pow(1.0 - N.z, 1.4)) * (0.75 + 0.25 * n2.y) * (1.0 - 0.55 * below);
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
        const acc = (target - ang) * 15 - angV * 4.2
        angV += acc * h; ang += angV * h
        for (let k = 0; k < 3; k++) {
          const o = k * COLS
          for (let i = 0; i < COLS; i++) {
            const l = H[o + (i ? i - 1 : 0)], r = H[o + (i < COLS - 1 ? i + 1 : COLS - 1)]
            const edge = (i / (COLS - 1) - 0.5) * 2
            const a = (l + r - 2 * H[o + i]) * 760 - H[o + i] * 4 - Vv[o + i] * 2.9 - angV * edge * 0.11
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
      if (e.pointerType === 'touch') { if (dragging) push(e); return }
      ptr.tx = Math.max(-1, Math.min(1, (e.clientX / window.innerWidth) * 2 - 1))
      ptr.ty = Math.max(-1, Math.min(1, (e.clientY / window.innerHeight) * 2 - 1))
      target = -ptr.tx * 0.32
      const r = c.getBoundingClientRect()
      if (e.clientY > r.top && e.clientY < r.bottom && e.clientX > r.left && e.clientX < r.right) {
        const now = performance.now(), x = toWorldX(e.clientX)
        const v = lastT ? Math.max(-3, Math.min(3, (x - lastX) / Math.max(0.008, (now - lastT) / 1000))) : 0
        kick(x, -Math.abs(v) * 0.035); kick(x + Math.sign(v) * 0.05, Math.abs(v) * 0.02)
        lastX = x; lastT = now
      }
    }
    // a drop: press pushes the liquid down, it rebounds as rings; dragging sideways pushes a wave
    let dragging = false, dx = 0
    const push = (e: PointerEvent) => {
      const x = toWorldX(e.clientX), v = x - dx; dx = x
      kick(x, -Math.abs(v) * 1.2); kick(x + Math.sign(v) * 0.06, Math.abs(v) * 0.7); energy += Math.abs(v) * 2; wake()
    }
    const onTap = (e: PointerEvent) => {
      dragging = true; dx = toWorldX(e.clientX)
      kick(dx, -0.5); energy += 0.7; wake()
      if (e.pointerType === 'touch') navigator.vibrate?.(6)
    }
    const onUp = () => { dragging = false }
    window.addEventListener('pointerup', onUp, { passive: true })
    window.addEventListener('pointercancel', onUp, { passive: true })
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
      window.removeEventListener('pointerup', onUp); window.removeEventListener('pointercancel', onUp)
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
          {lang === 'ar' ? 'حرك جوالك، والسائل يتحرك معك' : 'Tilt your phone and the liquid follows'}
        </button>
      )}
    </div>
  )
}
