import PropTypes from 'prop-types'

export function ChevronIcon({ size = 16, className = '', direction = 'right' }) {
  const rotations = {
    right: 0,
    down: 90,
    left: 180,
    up: 270
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ transform: `rotate(${rotations[direction]}deg)` }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

ChevronIcon.propTypes = {
  size: PropTypes.number,
  className: PropTypes.string,
  direction: PropTypes.oneOf(['up', 'down', 'left', 'right'])
}
