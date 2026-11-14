// KON Tempest footer wordmark: the three letters cut like a stone. A body that runs from white
// light through teal into vibrant champagne, faceted planes catching the light at golden-ratio
// breaks, a hairline edge, a slow sheen that crosses the word, and a faint reflection below.
// Pure SVG and CSS: sharp at any size, no WebGL, no images.
export function KonFooterMark() {
  return (
    <div className="kon-foot" dir="ltr">
      <svg viewBox="0 0 1000 330" role="img" aria-label="KON Unlimited">
        <defs>
          <linearGradient id="kf-body" gradientUnits="userSpaceOnUse" x1="0" y1="52" x2="0" y2="232">
            <stop offset="0" stopColor="#ffffff" />
            <stop offset="0.236" stopColor="#c9fbf3" />
            <stop offset="0.382" stopColor="#5fe3d2" />
            <stop offset="0.5" stopColor="#12a596" />
            <stop offset="0.618" stopColor="#0b6f6a" />
            <stop offset="0.764" stopColor="#06504c" />
            <stop offset="1" stopColor="#04403e" />
          </linearGradient>
          {/* Facet planes: hard-edged bands of light and shade across the letters. */}
          <linearGradient id="kf-facet" x1="0" y1="0" x2="1" y2="0.62">
            <stop offset="0" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.236" stopColor="#fff" stopOpacity="0.22" />
            <stop offset="0.236" stopColor="#000" stopOpacity="0.16" />
            <stop offset="0.382" stopColor="#000" stopOpacity="0.16" />
            <stop offset="0.382" stopColor="#fff" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.1" />
            <stop offset="0.5" stopColor="#000" stopOpacity="0.22" />
            <stop offset="0.618" stopColor="#000" stopOpacity="0.22" />
            <stop offset="0.618" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.764" stopColor="#fff" stopOpacity="0.16" />
            <stop offset="0.764" stopColor="#000" stopOpacity="0.1" />
            <stop offset="1" stopColor="#000" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="kf-sheen" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.45" stopColor="#fff" stopOpacity="0" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0.85" />
            <stop offset="0.55" stopColor="#fff" stopOpacity="0" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="kf-edge" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#e8fffb" stopOpacity="0.9" />
            <stop offset="0.618" stopColor="#5fe3d2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#d6c08f" stopOpacity="0.8" />
          </linearGradient>
          <linearGradient id="kf-fade" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#fff" stopOpacity="0.32" />
            <stop offset="0.5" stopColor="#fff" stopOpacity="0" />
          </linearGradient>
          <mask id="kf-text" maskUnits="userSpaceOnUse" x="0" y="0" width="1000" height="330">
            <text x="500" y="228" textAnchor="middle" className="kf-glyphs" fill="#fff">KON</text>
          </mask>
          <mask id="kf-refl" maskUnits="userSpaceOnUse" x="0" y="230" width="1000" height="100">
            <rect x="0" y="236" width="1000" height="94" fill="url(#kf-fade)" />
          </mask>
        </defs>
        <g className="kf-reflection" mask="url(#kf-refl)">
          <g transform="translate(0 472) scale(1 -1)">
            <text x="500" y="228" textAnchor="middle" className="kf-glyphs" fill="url(#kf-body)">KON</text>
          </g>
        </g>
        <g mask="url(#kf-text)">
          <rect width="1000" height="330" fill="url(#kf-body)" />
          <rect width="1000" height="330" fill="url(#kf-facet)" />
          <rect className="kf-sheen" x="-1000" width="1000" height="330" fill="url(#kf-sheen)" />
        </g>
        <text x="500" y="228" textAnchor="middle" className="kf-glyphs kf-edge" fill="none" stroke="url(#kf-edge)" strokeWidth="1.4">KON</text>
      </svg>
      <p className="kf-sub"><span>Unlimited</span></p>
    </div>
  )
}
