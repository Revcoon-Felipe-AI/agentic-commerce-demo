import type { SVGProps } from 'react'

interface LeafIconProps extends SVGProps<SVGSVGElement> {
  /** Pixel size; sets both width and height. Defaults to 16px. */
  size?: number
}

/**
 * Linden brand mark — a single leaf, used in chat triggers, teaser, footer,
 * and the chat avatar (via `LeafAvatar`, which wraps this in a circle).
 *
 * Stroke uses `currentColor`, so colour follows `text-*` Tailwind utilities
 * applied to the parent or directly via `className`.
 */
export function LeafIcon({ size = 16, className, ...props }: LeafIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96a1 1 0 0 1 1.5.5c.06.18.18.86.18 1.54a18.94 18.94 0 0 1-3.43 11.13C15.6 19.18 13 20 11 20Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6" />
    </svg>
  )
}
