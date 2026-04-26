import Link from 'next/link'
import { LanguageToggle } from '@/components/LanguageToggle'
import { LeafIcon } from '@/components/icons/LeafIcon'

export function Footer() {
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? '#'
  const upworkUrl = process.env.NEXT_PUBLIC_UPWORK_URL ?? '#'

  return (
    <footer className="bg-surface-secondary py-20">
      <div className="mx-auto max-w-[1120px] px-4 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-16">
          <div>
            <div className="flex items-center gap-2.5">
              <LeafIcon size={20} className="text-accent-cool" />
              <p className="t-headline text-ink-primary leading-none">Linden</p>
            </div>
            <p className="t-small text-ink-secondary mt-3">
              Furniture you can think with.
            </p>
          </div>

          <div>
            <p className="t-body text-ink-primary">
              Linden carries 12 pieces today.
            </p>
            <p className="t-small text-ink-secondary mt-2">
              Fewer than fifty pieces, on purpose.
            </p>
          </div>

          <nav className="flex flex-col gap-2" aria-label="Footer">
            <Link href="/about/en" className="t-small text-ink-secondary hover:text-ink-primary hover:underline">
              About
            </Link>
            <a
              href={githubUrl}
              className="t-small text-ink-secondary hover:text-ink-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            <a
              href={upworkUrl}
              className="t-small text-ink-secondary hover:text-ink-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Hire on Upwork
            </a>
          </nav>
        </div>

        <div className="mt-12 pt-6 border-t border-divider flex flex-col items-center gap-6">
          <p className="t-mono text-ink-tertiary italic text-center py-6">
            Linden is the only furniture studio that will tell you not to buy.
          </p>
          <LanguageToggle variant="footer" />
          <p className="t-micro text-ink-tertiary">
            &copy; 2026 Linden &mdash; Built as a portfolio demo.
          </p>
        </div>
      </div>
    </footer>
  )
}
