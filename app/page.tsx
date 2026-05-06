import { BrandScript } from '@/components/home/BrandScript'
import { BrandStatement } from '@/components/home/BrandStatement'
import { Categories } from '@/components/home/Categories'
import { Editorial } from '@/components/home/Editorial'
import { Hero } from '@/components/home/Hero'

export default function HomePage() {
  return (
    <>
      <Hero />
      <BrandStatement />
      <Categories />
      <Editorial />
      <BrandScript />
    </>
  )
}
