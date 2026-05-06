import { notFound } from 'next/navigation'
import { AboutThisDemo } from '@/components/about/AboutThisDemo'
import { Hero } from '@/components/about/Hero'
import { HowItWorks } from '@/components/about/HowItWorks'
import { ProblemSection } from '@/components/about/ProblemSection'
import { RefusalSurfaceSection } from '@/components/about/RefusalSurfaceSection'
import { TryItNow } from '@/components/about/TryItNow'
import { ABOUT_COPY } from '@/lib/i18n/about'
import { isLocale, LOCALES, type Locale } from '@/lib/i18n/types'

interface AboutPageProps {
  params: Promise<{ locale: string }>
}

export function generateStaticParams(): { locale: Locale }[] {
  return LOCALES.map(locale => ({ locale }))
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale: rawLocale } = await params
  if (!isLocale(rawLocale)) notFound()

  const locale: Locale = rawLocale
  const copy = ABOUT_COPY[locale]
  const otherLocale: Locale = locale === 'en' ? 'pt' : 'en'
  const otherLocaleHref = `/about/${otherLocale}`

  const upworkUrl = process.env.NEXT_PUBLIC_UPWORK_URL ?? '#'
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL ?? '#'

  return (
    <>
      <Hero copy={copy.hero} />
      <ProblemSection copy={copy.problem} />
      <HowItWorks copy={copy.howItWorks} />
      <RefusalSurfaceSection copy={copy.refusalSurface} />
      <TryItNow copy={copy.tryItNow} />
      <AboutThisDemo
        copy={copy.aboutThisDemo}
        otherLocaleHref={otherLocaleHref}
        upworkUrl={upworkUrl}
        githubUrl={githubUrl}
      />
    </>
  )
}
