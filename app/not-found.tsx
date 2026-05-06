import Image from 'next/image'
import Link from 'next/link'

export default function NotFoundPage() {
  return (
    <section
      id="not-found"
      aria-label="Page not found"
      className="mx-auto flex min-h-[calc(100vh-12rem)] max-w-[640px] flex-col items-center justify-center gap-10 px-4 py-12 text-center md:px-12 md:py-20"
    >
      <h1 className="t-display text-ink-primary">
        This isn’t a page. Want to talk to Linden?
      </h1>

      <div className="relative aspect-[4/3] w-full max-w-[400px]">
        <Image
          src="/lifestyle/404.webp"
          alt="An empty room with afternoon light through a single window."
          fill
          sizes="(min-width: 768px) 400px, 100vw"
          className="object-contain"
          priority
        />
      </div>

      <div className="flex flex-col items-center gap-4">
        <Link
          href="/"
          className="bg-accent-warm text-surface-primary t-small inline-flex items-center gap-2 rounded-sm px-5 py-3 font-medium hover:opacity-95"
        >
          Talk to Linden
        </Link>
        <Link
          href="/"
          className="t-small text-ink-secondary hover:text-ink-primary hover:underline"
        >
          Back to home
        </Link>
      </div>
    </section>
  )
}
