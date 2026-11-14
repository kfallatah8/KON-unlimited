// KON Tempest gem shading (built on KON Prism).
// Every stone begins as raw rock: dark, rough, lumpy, with veins of light leaking through its
// cracks. Under pressure (time and scroll) the veins widen, the rock burns away, and a cut gem is
// left: dielectric reflection, light refracted through three slightly different indices
// (dispersion), one internal bounce off a faceted back wall (scintillation), absorption in the
// stone's own colour (teal or burgundy), a thin-film sheen that drifts like a daydream,
// and an inner glow that rises and falls with one slow, shared breath.
// Samples the studio environment cube directly (GPU-rendered, never read back to the CPU).
import * as THREE from 'three'

export const gemUniforms = {
  uEnv: { value: null as THREE.Texture | null },
  uTime: { value: 0 },
  uRim: { value: 0.9 },
  /** 0..1, the shared breath (about 5.5 breaths a minute). */
  uBreath: { value: 0.5 },
  /** 0..1, the gathering storm: coal veins burn brighter and pulse faster under pressure. */
  uStorm: { value: 0 },
  /** 0..1, lightning inside the clouds: a cold flash across every facet. */
  uBolt: { value: 0 },
  /** 0..1, the stones are packed into one core: heat builds in every vein. */
  uPress: { value: 0 },
  uFog: { value: new THREE.Color('#031e1f') },
  uKey: { value: new THREE.Vector3(0.4, 0.75, 0.55).normalize() },
}

const noise = /* glsl */ `
  // Compact 3D value noise + fbm (no textures).
  float h3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
  float vn(vec3 x) {
    vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
    return mix(mix(mix(h3(i), h3(i + vec3(1,0,0)), f.x), mix(h3(i + vec3(0,1,0)), h3(i + vec3(1,1,0)), f.x), f.y),
               mix(mix(h3(i + vec3(0,0,1)), h3(i + vec3(1,0,1)), f.x), mix(h3(i + vec3(0,1,1)), h3(i + vec3(1,1,1)), f.x), f.y), f.z);
  }
  float fbm(vec3 p) { float a = 0.5, s = 0.0; for (int i = 0; i < 4; i++) { s += a * vn(p); p *= 2.03; a *= 0.5; } return s; }
`

const vertex = /* glsl */ `
  attribute vec2 aState; // x: rock (1 = raw rock, 0 = cut gem), y: flash from a ripple
  varying vec3 vWPos;
  varying vec3 vN;
  varying vec3 vLocal;
  varying vec3 vTint;
  varying float vSeed;
  varying vec2 vState;
  ${noise}
  void main() {
    mat4 im = mat4(1.0);
    #ifdef USE_INSTANCING
      im = instanceMatrix;
    #endif
    vSeed = fract(float(gl_InstanceID) * 0.6180339);
    vState = aState;
    // Rock: the cut is buried in a lumpy shell (same position -> same lift, so no seams open).
    vec3 p = position;
    if (aState.x > 0.001) {
      float lump = fbm(p * 1.6 + vSeed * 17.0);
      p = p * (1.0 + (lump - 0.42) * 0.9 * aState.x) + normalize(p + 1e-4) * 0.08 * aState.x;
    }
    vLocal = position;
    vec4 wp = modelMatrix * im * vec4(p, 1.0);
    vWPos = wp.xyz;
    vN = normalize(mat3(modelMatrix) * mat3(im) * normal);
    #ifdef USE_INSTANCING_COLOR
      vTint = instanceColor;
    #else
      vTint = vec3(0.02, 0.4, 0.33);
    #endif
    gl_Position = projectionMatrix * viewMatrix * wp;
  }
`

const fragment = /* glsl */ `
  uniform samplerCube uEnv;
  uniform float uTime;
  uniform float uRim;
  uniform float uBreath;
  uniform float uStorm;
  uniform float uBolt;
  uniform float uPress;
  uniform vec3 uFog;
  uniform vec3 uKey;
  varying vec3 vWPos;
  varying vec3 vN;
  varying vec3 vLocal;
  varying vec3 vTint;
  varying float vSeed;
  varying vec2 vState;
  ${noise}

  vec3 env(vec3 d) { return textureCube(uEnv, d).rgb; }
  vec3 facet(vec3 d, float k) { vec3 q = floor(d * k + 0.5); return length(q) < 0.5 ? d : normalize(q); }
  // Thin-film colour shift (soap-bubble sheen), kept to the brand's teal / rose band.
  vec3 film(float x) { return 0.5 + 0.5 * cos(6.2831 * (x + vec3(0.0, 0.33, 0.67))); }

  void main() {
    vec3 V = normalize(vWPos - cameraPosition);
    vec3 N = normalize(vN);
    float rock = vState.x;
    float flash = vState.y;

    vec3 tint = max(vTint, vec3(0.0005));
    float lum = max(tint.g, max(tint.b, tint.r));
    vec3 hue = tint / lum;
    float clear = smoothstep(0.02, 0.5, lum);
    float breath = uBreath;

    // ---------- the cut gem ---------- (skipped while the stone is still all rock)
    vec3 gem = vec3(0.0);
    if (rock < 0.7) {
    float cosT = clamp(dot(-V, N), 0.0, 1.0);
    float F = 0.07 + 0.93 * pow(1.0 - cosT, 5.0);
    vec3 R = reflect(V, N);
    vec3 surf = env(R);
    float a = vSeed * 6.2831;
    mat3 rot = mat3(cos(a), 0.0, sin(a), 0.0, 1.0, 0.0, -sin(a), 0.0, cos(a));
    vec3 Tg = refract(V, N, 1.0 / 1.62);
    vec3 B = rot * facet(rot * Tg, 2.7);
    vec3 bounce = reflect(Tg, B);
    vec3 Tr = refract(V, N, 1.0 / 1.595);
    vec3 Tb = refract(V, N, 1.0 / 1.65);
    vec3 inner = vec3(env(reflect(Tr, B)).r, env(bounce).g, env(reflect(Tb, B)).b);
    // A second bounce off a differently cut wall: the extra "fire" that makes a real stone sparkle
    // from every angle rather than only one.
    vec3 B2 = rot * facet(rot * bounce.zxy, 3.4);
    vec3 b2 = reflect(bounce, B2);
    inner = inner * 0.72 + vec3(env(b2 + vec3(0.012, 0.0, 0.0)).r, env(b2).g, env(b2 - vec3(0.012, 0.0, 0.0)).b) * 0.42;
    vec3 absorb = mix(hue * hue * vec3(0.8, 0.9, 0.95), mix(hue, vec3(1.0), 0.16), clear);
    vec3 body = inner * absorb * mix(0.65, 1.3, clear) + hue * mix(0.03, 0.07, clear);
    float ig = pow(max(dot(bounce, uKey), 0.0), 70.0) + 0.6 * pow(max(dot(bounce, normalize(vec3(-0.5, 0.6, 0.6))), 0.0), 110.0)
             + 0.5 * pow(max(dot(b2, uKey), 0.0), 140.0);
    body += mix(hue, vec3(1.0), 0.55) * ig * 2.2;
    float g1 = pow(max(dot(R, uKey), 0.0), 220.0);
    vec3 k2 = normalize(vec3(-0.7, 0.2 + 0.3 * sin(uTime * 0.21), 0.6));
    float g2 = pow(max(dot(R, k2), 0.0), 360.0);
    vec3 glint = vec3(1.0, 0.98, 0.94) * g1 * 3.2 + vec3(1.0, 0.9, 0.75) * g2 * 2.4;
    // Daydream sheen: a slow drift of colour across facets at grazing angles.
    vec3 sheen = film(dot(N, vec3(0.3, 0.8, 0.5)) * 0.8 + uTime * 0.03 + vSeed) * mix(vec3(0.2, 0.9, 0.8), vec3(1.0, 0.9, 0.7), 0.3);
    float rimF = pow(1.0 - cosT, 2.4);
    vec3 glow = hue * (0.06 + 0.6 * rimF) * uRim * (0.35 + lum) * (0.8 + 0.45 * breath);
    gem = mix(body, surf, F) + glint + glow + sheen * rimF * 0.16;
    }

    // ---------- the raw rock ---------- (skipped once the shell has burned away)
    vec3 rockCol = vec3(0.0);
    vec3 R;
    if (rock > 0.25) {
    vec3 lp = vLocal * 1.7 + vSeed * 11.0;
    float n = fbm(lp * 1.8);
    // The lumpy shell's own faces (from screen derivatives), not the cut hidden inside it.
    vec3 Nr = normalize(cross(dFdx(vWPos), dFdy(vWPos)));
    if (dot(Nr, V) > 0.0) Nr = -Nr;
    N = normalize(mix(N, Nr, smoothstep(0.4, 0.9, rock)));
    R = reflect(V, N);
    // Faceted, slightly shiny basalt: dark charcoal with a cold blue-green cast.
    float diff = 0.35 + 0.65 * max(dot(N, uKey), 0.0);
    vec3 stone = mix(vec3(0.016, 0.02, 0.022), vec3(0.06, 0.07, 0.07), n) * diff;
    // Anthracite, not ash: glossy black faces that mirror the sky at a glance, with a clean specular.
    float Fr = 0.04 + 0.96 * pow(1.0 - clamp(dot(-V, N), 0.0, 1.0), 5.0);
    stone += dot(env(R), vec3(0.3333)) * vec3(0.85, 0.95, 0.95) * (0.04 + 0.26 * Fr) * (0.5 + n);
    stone += vec3(1.0, 0.96, 0.95) * pow(max(dot(R, uKey), 0.0), 160.0) * 0.3;
    // Veins of light: thin where the rock is whole, wide as it gives way.
    float vein = abs(fbm(lp * 1.05 + 4.0) - 0.5);
    float width = mix(0.02, 0.13, smoothstep(0.85, 0.15, rock));
    float crack = 1.0 - smoothstep(0.0, width, vein);
    // Under pressure the veins pulse faster and burn hotter, like a held breath.
    float pulse = 0.72 + 0.28 * sin(uTime * (2.2 + uStorm * 4.5) + vSeed * 30.0);
    vec3 light = mix(hue, vec3(1.0), 0.15) * (1.2 + 2.0 * (1.0 - rock) + uStorm * 1.1) * pulse * (0.7 + 0.5 * breath);
    // Packed into the core, the veins widen and burn: the light is trying to get out.
    crack = max(crack, (1.0 - smoothstep(0.0, width + 0.025 * uPress, vein)) * uPress);
    rockCol = stone + light * crack * (1.0 + uPress * 0.8);
    }

    // The moment of change: a burst of the stone's own light as the shell burns away.
    float edge = smoothstep(0.0, 0.35, rock) * smoothstep(0.75, 0.35, rock);
    vec3 col = mix(gem, rockCol, smoothstep(0.25, 0.7, rock)) + hue * edge * 1.6;

    // Lightning: a cold flash from above that silvers every upward face for an instant.
    float up = clamp(dot(N, normalize(vec3(0.2, 1.0, 0.35))) * 0.5 + 0.5, 0.0, 1.0);
    col += vec3(0.9, 0.86, 0.95) * uBolt * (0.04 + 0.32 * pow(up, 4.0)) * mix(0.6, 1.0, rock);

    // A ripple of light from a tap or click.
    col += mix(hue, vec3(1.0), 0.5) * flash * 1.8;

    float dist = length(vWPos - cameraPosition);
    col = mix(col, uFog, smoothstep(15.0, 25.0, dist) * 0.72);

    gl_FragColor = vec4(col, 1.0);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
  }
`

export function makeGemMaterial() {
  return new THREE.ShaderMaterial({ uniforms: gemUniforms, vertexShader: vertex, fragmentShader: fragment })
}
