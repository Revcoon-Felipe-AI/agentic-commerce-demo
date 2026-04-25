'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface LanguageToggleProps {
  variant: 'header' | 'footer'
}

const ABOUT_EN = '/about'
const ABOUT_PT = '/about/pt'

export function LanguageToggle({ variant }: LanguageToggleProps) {
  const pathname = usePathname()
  const isAboutRoute = pathname === ABOUT_EN || pathname === ABOUT_PT
  const isPtActive = pathname === ABOUT_PT

  if (variant === 'header' && !isAboutRoute) {
    return null
  }

  const linkBase = 't-micro transition-colors'
  const activeClass = 'text-ink-primary'
  const inactiveClass = 'text-ink-tertiary hover:text-ink-primary'

  const toggle = (
    <span className="inline-flex items-center gap-2">
      <Link
        href={ABOUT_EN}
        aria-current={!isPtActive ? 'true' : undefined}
        className={`${linkBase} ${!isPtActive ? activeClass : inactiveClass}`}
      >
        EN
      </Link>
      <span className="text-divider" aria-hidden="true">|</span>
      <Link
        href={ABOUT_PT}
        aria-current={isPtActive ? 'true' : undefined}
        className={`${linkBase} ${isPtActive ? activeClass : inactiveClass}`}
      >
        PT
      </Link>
    </span>
  )

  if (variant === 'footer') {
    return (
      <div className="flex items-center gap-3">
        <span className="t-small text-ink-tertiary">Read in</span>
        {toggle}
      </div>
    )
  }

  return <div className="hidden sm:flex items-center gap-2">{toggle}</div>
}
