import { Link } from '@tanstack/react-router'

export function DuckMark({ size = 42, inverse = false }) {
  return (
    <img
      src="/assets/duck-logo.png"
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      className={`ww-duck-mark${inverse ? ' inverse' : ''}`}
    />
  )
}

export default function Brand({ compact = false, link = true }) {
  const content = <span className="ww-brand"><DuckMark size={compact ? 34 : 48} /><span><strong>WattWhen</strong>{!compact && <small>your energy, at a better time.</small>}</span></span>
  return link ? <Link to="/" aria-label="WattWhen home">{content}</Link> : content
}
