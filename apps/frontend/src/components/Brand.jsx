import { Link } from '@tanstack/react-router'

export function DuckMark({ size = 42, inverse = false }) {
  const outline = inverse ? '#fff' : '#7cb40e'
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M14 35c0-9 7-16 16-16 2 0 4 .4 6 1.2C38 13 44 8 51 8c1 8-2 14-8 18 3 3 5 7 5 12 0 10-9 18-21 18S7 49 7 40c0-4 3-6 7-5Z" fill="#fee340" stroke={outline} strokeWidth="4" strokeLinejoin="round" />
      <path d="M45 19c6-1 10 0 13 3-3 4-7 6-13 6" fill="#fe821b" stroke={outline} strokeWidth="3" strokeLinejoin="round" />
      <circle cx="39" cy="17" r="2.5" fill={outline} />
      <path d="M19 36c5 6 13 7 20 2" stroke={outline} strokeWidth="4" strokeLinecap="round" />
      <path d="m21 55-4 5m14-5 4 5" stroke={outline} strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

export default function Brand({ compact = false, link = true }) {
  const content = <span className="ww-brand"><DuckMark size={compact ? 34 : 48} /><span><strong>WattWhen</strong>{!compact && <small>your energy, at a better time.</small>}</span></span>
  return link ? <Link to="/" aria-label="WattWhen home">{content}</Link> : content
}
