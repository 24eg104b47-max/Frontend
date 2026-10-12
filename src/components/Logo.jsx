import { Link } from 'react-router-dom';

/**
 * Shared SmartOne brand mark: a crisp check in a gradient tile
 * (done tasks = the product) with an orbiting accent dot.
 * Used in the landing nav, auth pages, sidebar and topbar.
 */
export default function Logo({ to = '/', size = 28, showName = true, style }) {
  const s = size * 0.56;
  return (
    <Link to={to} className="brand" style={{ fontSize: Math.max(15, size * 0.68), ...style }}>
      <span className="logo-mark" aria-hidden="true" style={{ width: size, height: size }}>
        <svg viewBox="0 0 24 24" width={s} height={s} fill="none"
          stroke="#fff" strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4.5 12.6l5 5L19.5 6.8" />
        </svg>
        <span className="logo-orbit" />
      </span>
      {showName && (
        <span>Smart<span className="logo-one">One</span></span>
      )}
    </Link>
  );
}
