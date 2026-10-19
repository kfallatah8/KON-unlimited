// Static stand-in for devices without WebGL or with constrained resources:
// the same eight-module system, drawn once as SVG, in the same palette.
import { FORMATIONS, LINKS } from '../three/formations'

export function SceneFallback() {
  const majors = FORMATIONS[4].majors // the aligned, "transformed" system
  const P = majors.map((m) => [m.p[0] * 60 + 200, -m.p[1] * 60 + 150] as const)
  return (
    <div className="stage stage-fallback" aria-hidden="true">
      <svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
        {LINKS.slice(0, 14).map(([a, b], i) => (
          <line key={i} x1={P[a][0]} y1={P[a][1]} x2={P[b][0]} y2={P[b][1]} />
        ))}
        {P.map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <rect x="-28" y="-14" width="56" height="28" rx="2" />
            <path d="M-22 0 H22" />
          </g>
        ))}
      </svg>
    </div>
  )
}
