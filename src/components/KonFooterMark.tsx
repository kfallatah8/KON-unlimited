// KON footer mark in thick translucent glass. The letters are clear teal glass: you see the soft
// light behind them through the letters, bent by refraction (a displacement filter applied only
// inside the glyphs). Light gathers along the thick edges the way it does in real cast glass,
// a gloss reflection crosses the upper third, the bottom of each letter holds the brightest teal
// where light collects, and the glass throws a caustic pool of light onto the floor. No outlines:
// every edge is light, not a line.
export function KonFooterMark() {
  const T = (props: Record<string, unknown>) => (
    <text x="500" y="236" textAnchor="middle" className="kg-glyphs" {...props}>KON</text>
  )
  return (
    <div className="kon-foot kon-glass" dir="ltr">
      <svg viewBox="0 0 1000 380" role="img" aria-label="KON Unlimited">
        <defs>
          {/* soft light behind the glass, which the glass bends */}
          <radialGradient id="kgl-a" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#5fe3d2" stopOpacity="0.75" /><stop offset="1" stopColor="#5fe3d2" stopOpacity="0" /></radialGradient>
          <radialGradient id="kgl-b" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#e9d3a0" stopOpacity="0.5" /><stop offset="1" stopColor="#e9d3a0" stopOpacity="0" /></radialGradient>
          <radialGradient id="kgl-c" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#bff7ef" stopOpacity="0.6" /><stop offset="1" stopColor="#bff7ef" stopOpacity="0" /></radialGradient>
          <linearGradient id="kgl-body" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d9fff9" stopOpacity="0.16" />
            <stop offset="0.55" stopColor="#5fe3d2" stopOpacity="0.1" />
            <stop offset="1" stopColor="#1fbfab" stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id="kgl-rim" gradientUnits="userSpaceOnUse" x1="150" y1="60" x2="820" y2="260">
            <stop offset="0" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="0.45" stopColor="#c8fff6" stopOpacity="0.55" />
            <stop offset="1" stopColor="#5fe3d2" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="kgl-gloss" gradientUnits="userSpaceOnUse" x1="0" y1="70" x2="0" y2="150">
            <stop offset="0" stopColor="#fff" stopOpacity="0.55" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kgl-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0.42" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.45" />
            <stop offset="0.58" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kgl-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff" stopOpacity="0.28" /><stop offset="0.7" stopColor="#fff" stopOpacity="0" /></linearGradient>

          <filter id="kgl-refract" x="-5%" y="-10%" width="110%" height="120%">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.03" numOctaves="2" seed="7" result="n" />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="46" xChannelSelector="R" yChannelSelector="G" />
          </filter>
          {/* the glass itself, built from the letters' own shape: a rounded height map lit by two
              lights, plus the bright band where thick edges gather light. No strokes anywhere. */}
          <filter id="kgl-glass" x="-6%" y="-12%" width="112%" height="130%" colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceAlpha" stdDeviation="6" result="h" />
            <feSpecularLighting in="h" surfaceScale="10" specularConstant="1.25" specularExponent="34" lightingColor="#ffffff" result="s1">
              <fePointLight x="180" y="-160" z="260" />
            </feSpecularLighting>
            <feComposite in="s1" in2="SourceAlpha" operator="in" result="spec" />
            <feSpecularLighting in="h" surfaceScale="8" specularConstant="0.9" specularExponent="16" lightingColor="#58e6d2" result="s2">
              <fePointLight x="860" y="520" z="160" />
            </feSpecularLighting>
            <feComposite in="s2" in2="SourceAlpha" operator="in" result="back" />
            <feMorphology in="SourceAlpha" operator="erode" radius="7" result="er" />
            <feComposite in="SourceAlpha" in2="er" operator="out" result="band" />
            <feGaussianBlur in="band" stdDeviation="3.2" result="bandB" />
            <feComposite in="bandB" in2="SourceAlpha" operator="in" result="bandIn" />
            <feFlood floodColor="#c9fff6" floodOpacity="0.5" />
            <feComposite in2="bandIn" operator="in" result="rim" />
            <feMorphology in="SourceAlpha" operator="erode" radius="16" result="core" />
            <feGaussianBlur in="core" stdDeviation="9" result="coreB" />
            <feFlood floodColor="#021c1a" floodOpacity="0.4" />
            <feComposite in2="coreB" operator="in" result="depth" />
            <feMerge><feMergeNode in="depth" /><feMergeNode in="rim" /><feMergeNode in="back" /><feMergeNode in="spec" /></feMerge>
          </filter>
          <filter id="kgl-glow" x="-30%" y="-60%" width="160%" height="220%"><feGaussianBlur stdDeviation="18" /></filter>
          <filter id="kgl-shadow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>

          <clipPath id="kgl-clip"><T /></clipPath>
          <mask id="kgl-refl" maskUnits="userSpaceOnUse" x="0" y="262" width="1000" height="118">
            <rect x="0" y="262" width="1000" height="118" fill="url(#kgl-fade)" />
          </mask>
          <g id="kgl-scene">
            <ellipse cx="300" cy="130" rx="260" ry="150" fill="url(#kgl-a)" />
            <ellipse cx="700" cy="200" rx="300" ry="160" fill="url(#kgl-a)" />
            <ellipse cx="520" cy="90" rx="200" ry="110" fill="url(#kgl-b)" />
            <ellipse cx="180" cy="230" rx="140" ry="90" fill="url(#kgl-c)" />
            <ellipse cx="840" cy="110" rx="150" ry="90" fill="url(#kgl-c)" />
          </g>
          <g id="kgl-streaks">
            <rect x="80" y="150" width="840" height="12" fill="#bff7ef" opacity="0.4" />
            <rect x="80" y="96" width="840" height="5" fill="#fff" opacity="0.3" />
            <rect x="80" y="205" width="840" height="7" fill="#e9d3a0" opacity="0.25" />
          </g>
        </defs>

        {/* the light behind, faint outside the glass */}
        <use href="#kgl-scene" opacity="0.12" />

        {/* caustic light thrown on the floor, and a soft contact shadow */}
        <ellipse cx="500" cy="276" rx="360" ry="10" fill="#000" opacity="0.55" filter="url(#kgl-shadow)" />
        <g transform="translate(0 520) scale(1 -0.36) translate(0 -240)" opacity="0.5" filter="url(#kgl-glow)"><T fill="#3fe0ca" /></g>

        {/* glass: bent background, tinted body, thick bright edges, gloss, bottom glow */}
        <g className="kg-glass">
          <g clipPath="url(#kgl-clip)">
            <g filter="url(#kgl-refract)"><use href="#kgl-scene" /><use href="#kgl-streaks" /></g>
            <rect x="0" y="0" width="1000" height="380" fill="#032826" opacity="0.35" />
          </g>
          <T fill="url(#kgl-body)" />
          <g filter="url(#kgl-glass)"><T fill="#fff" /></g>
          <g clipPath="url(#kgl-clip)">
            <rect x="0" y="60" width="1000" height="70" fill="url(#kgl-gloss)" transform="skewY(-3)" opacity="0.5" />
            <rect className="kf-sheen" x="-1000" width="1000" height="380" fill="url(#kgl-sheen)" />
          </g>
        </g>

        {/* reflection on the floor */}
        <g mask="url(#kgl-refl)" opacity="0.5">
          <g transform="translate(0 532) scale(1 -1)"><T fill="url(#kgl-body)" /><g filter="url(#kgl-glass)"><T fill="#fff" /></g></g>
        </g>
      </svg>
      <p className="kf-sub"><span>Unlimited</span></p>
    </div>
  )
}
