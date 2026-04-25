'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Leaf, MessageSquare, XCircle } from 'lucide-react'
import { Reveal } from '@/components/Reveal'

const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? '#'
const UPWORK_URL = process.env.NEXT_PUBLIC_UPWORK_URL ?? '#'
const OPEN_CHAT_EVENT = 'linden:open-chat'

function handleOpenChat(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new CustomEvent(OPEN_CHAT_EVENT))
}

export default function AboutPagePT() {
  return (
    <>
      <Hero />
      <Problema />
      <ComoFunciona />
      <RefusalSurfaceSecao />
      <ExperimentaAgora />
      <SobreEstaDemo />
    </>
  )
}

function Hero() {
  return (
    <section
      id="about-hero"
      aria-label="Sobre a Linden"
      className="bg-surface-primary relative w-full min-h-[60vh] overflow-hidden"
    >
      <Image
        src="/lifestyle/about-hero.webp"
        alt="Um canto de quarto em tons de osso, com uma única cadeira e luz quente da tarde."
        fill
        priority
        sizes="100vw"
        className="object-cover"
      />
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(247,242,234,0) 50%, rgba(247,242,234,0.6) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-12 md:px-12 md:pb-16">
        <div className="flex max-w-[36ch] flex-col gap-4">
          <h1 className="t-hero text-ink-primary">Móveis, com cuidado.</h1>
          <p className="t-subhead text-ink-secondary max-w-[28ch]">
            Ou — uma conversa que cuida disso com você.
          </p>
        </div>
      </div>
    </section>
  )
}

function Problema() {
  return (
    <Reveal>
      <section
        id="about-problem"
        aria-label="O problema que a gente resolve"
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto grid max-w-[1120px] grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
          <div className="flex flex-col gap-5">
            <p className="t-micro text-ink-tertiary">O problema</p>
            <p className="t-display text-ink-primary">
              Você comprou o apartamento. Agora a sala depende de você.
            </p>
            <p className="t-body text-ink-primary max-w-[44ch]">
              Onze abas abertas. Três semanas comparando. Dezessete filtros que ainda
              não te dizem qual sofá cabe numa parede de 3,30 m. O catálogo promete
              escolha infinita e entrega indecisão infinita.
            </p>
            <p className="t-body text-ink-primary max-w-[44ch]">
              O que está te travando não é uma peça que falta. É uma pessoa que falta —
              o amigo que entende de móveis, que olha pro seu cômodo, faz uma boa
              pergunta e te diz o que cabe.
            </p>
          </div>
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md md:rounded-none">
            <Image
              src="/lifestyle/brand-anchors.webp"
              alt="Um canto composto com texturas neutras e luz quente da tarde."
              fill
              sizes="(min-width: 768px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </Reveal>
  )
}

interface Etapa {
  icon: typeof Leaf
  number: string
  title: string
  body: string
}

const ETAPAS: readonly Etapa[] = [
  {
    icon: Leaf,
    number: '01',
    title: 'Conta sobre o seu cômodo.',
    body: 'Uma pergunta abre a conversa: qual ambiente você está montando? Depois uma segunda: o tamanho, a direção da luz, como é a parede. Duas mensagens. Quarenta e cinco segundos.',
  },
  {
    icon: MessageSquare,
    number: '02',
    title: 'Recebe duas opções. Ambas servem.',
    body: 'A Linden devolve duas peças — às vezes três — com um motivo pra cada uma. Não é uma grade de quarenta. Não é um quiz com onze perguntas. Duas opções. O motivo é o produto.',
  },
  {
    icon: XCircle,
    number: '03',
    title: 'Ou ouve &ldquo;não compra.&rdquo; A gente fala sério.',
    body: 'Quando a conta não fecha, a Linden diz. &ldquo;Honestamente, não compre essa peça&rdquo; — a parede tá errada, a escala não bate, o orçamento é apertado. A gente aponta uma alternativa que cabe, ou sugere esperar até você ter mais informação sobre o cômodo.',
  },
]

function ComoFunciona() {
  return (
    <Reveal>
      <section
        id="about-how"
        aria-label="Como a Linden funciona"
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[1120px]">
          <p className="t-micro text-ink-tertiary mb-3">Como funciona</p>
          <p className="t-display text-ink-primary mb-16 max-w-[18ch]">
            Três passos. Sem filtros.
          </p>
          <ol className="grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-10">
            {ETAPAS.map(etapa => {
              const Icon = etapa.icon
              return (
                <li key={etapa.number} className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <span className="bg-surface-secondary text-accent-cool inline-flex h-10 w-10 items-center justify-center rounded-md">
                      <Icon size={20} strokeWidth={1.5} aria-hidden="true" />
                    </span>
                    <span className="t-mono text-ink-tertiary">{etapa.number}</span>
                  </div>
                  <h3
                    className="t-headline text-ink-primary"
                    dangerouslySetInnerHTML={{ __html: etapa.title }}
                  />
                  <p
                    className="t-body text-ink-secondary"
                    dangerouslySetInnerHTML={{ __html: etapa.body }}
                  />
                </li>
              )
            })}
          </ol>
        </div>
      </section>
    </Reveal>
  )
}

function RefusalSurfaceSecao() {
  return (
    <Reveal>
      <section
        id="about-refusal"
        aria-label="O diferencial da recusa"
        className="bg-surface-secondary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto max-w-[820px]">
          <p className="t-micro text-ink-tertiary mb-8 text-center">
            O que diferencia a Linden
          </p>
          <div className="relative">
            <span
              aria-hidden="true"
              className="text-accent-warm pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 select-none font-serif text-7xl leading-none opacity-30"
            >
              &ldquo;
            </span>
            <p className="t-display text-ink-primary text-center">
              Quase todo site de móveis é otimizado pra fechar uma venda.
              <br />
              A gente é otimizado pra fechar uma venda que não volta como devolução.
            </p>
            <div
              aria-hidden="true"
              className="bg-divider mx-auto mt-10 h-px w-12"
            />
          </div>
          <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
            <p className="t-body text-ink-primary max-w-[44ch]">
              Todo concorrente nessa categoria é medido por conversão por sessão. Pra
              entregar uma feature em que o agente diz <em>&ldquo;não compra&rdquo;</em>,
              eles precisariam reconstruir toda a estrutura de merchandising contra
              os próprios incentivos.
            </p>
            <p className="t-body text-ink-primary max-w-[44ch]">
              A Linden não tem essa restrição. O catálogo é pequeno o bastante pra
              gente conhecer cada peça e fazer essa avaliação. A recusa é o que faz
              a próxima recomendação valer a pena ouvir.
            </p>
          </div>
        </div>
      </section>
    </Reveal>
  )
}

function ExperimentaAgora() {
  return (
    <Reveal>
      <section
        id="about-try"
        aria-label="Experimente agora"
        className="bg-surface-primary px-4 py-24 md:px-12 md:py-32"
      >
        <div className="mx-auto flex max-w-[640px] flex-col items-center gap-8 text-center">
          <p className="t-micro text-ink-tertiary">Experimente</p>
          <p className="t-display text-ink-primary">
            Uma pergunta. Sem e-mail. Sem filtros.
          </p>
          <button
            type="button"
            onClick={handleOpenChat}
            className="bg-accent-warm text-surface-primary t-subhead inline-flex items-center gap-3 rounded-md px-8 py-4 font-medium shadow-[0_4px_12px_rgba(42,39,34,0.12)] transition-transform hover:scale-[1.02]"
          >
            <Leaf size={18} strokeWidth={1.5} aria-hidden="true" />
            Conversar com a Linden
          </button>
          <p className="t-small text-ink-tertiary max-w-[36ch]">
            Abre o chat aqui mesmo. Tente mencionar um cômodo que você está montando,
            ou peça pro agente comparar duas peças.
          </p>
        </div>
      </section>
    </Reveal>
  )
}

function SobreEstaDemo() {
  return (
    <Reveal>
      <section
        id="about-demo"
        aria-label="Sobre esta demo"
        className="bg-surface-secondary px-4 py-20 md:px-12 md:py-24"
      >
        <div className="mx-auto flex max-w-[640px] flex-col gap-6 text-center">
          <p className="t-micro text-ink-tertiary">Sobre esta demo</p>
          <p className="t-body text-ink-primary">
            A Linden é um projeto de portfólio do{' '}
            <strong className="text-ink-primary">Felipe Moreira</strong> — construído
            pra mostrar um pattern: IA como superfície de merchandising do e-commerce,
            não como widget de ajuda no canto. A loja é fictícia. O pattern é real, e
            roda em produção hoje.
          </p>
          <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-6">
            <Link
              href={UPWORK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-ink-primary text-surface-primary t-small inline-flex items-center justify-center rounded-md px-6 py-3 font-medium transition-opacity hover:opacity-90"
            >
              Contrate no Upwork
            </Link>
            <Link
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="border-ink-primary text-ink-primary t-small inline-flex items-center justify-center rounded-md border px-6 py-3 font-medium transition-colors hover:bg-surface-primary"
            >
              Ver o código
            </Link>
          </div>
          <p className="t-small text-ink-tertiary mt-6">
            Código aberto sob licença MIT &middot;{' '}
            <Link href="/about" className="hover:text-ink-primary underline">
              Read in English
            </Link>
          </p>
        </div>
      </section>
    </Reveal>
  )
}
