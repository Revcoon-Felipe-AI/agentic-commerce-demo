import type { Locale } from '@/lib/i18n/types'

export type AboutStepIconKey = 'leaf' | 'messageSquare' | 'xCircle'

export interface AboutStep {
  iconKey: AboutStepIconKey
  number: string
  title: string
  body: string
}

export interface AboutHeroCopy {
  ariaLabel: string
  imageAlt: string
  headline: string
  lede: string
}

export interface AboutProblemCopy {
  ariaLabel: string
  eyebrow: string
  headline: string
  body: readonly [string, string]
  imageAlt: string
}

export interface AboutHowItWorksCopy {
  ariaLabel: string
  eyebrow: string
  headline: string
  steps: readonly AboutStep[]
}

export interface AboutRefusalCopy {
  ariaLabel: string
  eyebrow: string
  pullQuote: readonly [string, string]
  body: readonly [string, string]
}

export interface AboutTryItNowCopy {
  ariaLabel: string
  eyebrow: string
  headline: string
  ctaLabel: string
  helper: string
}

export interface AboutThisDemoCopy {
  ariaLabel: string
  eyebrow: string
  bodyLead: string
  bodyAuthor: string
  bodyTrail: string
  upworkLabel: string
  githubLabel: string
  licenseLabel: string
  otherLocaleLabel: string
}

export interface AboutCopy {
  hero: AboutHeroCopy
  problem: AboutProblemCopy
  howItWorks: AboutHowItWorksCopy
  refusalSurface: AboutRefusalCopy
  tryItNow: AboutTryItNowCopy
  aboutThisDemo: AboutThisDemoCopy
}

export const ABOUT_COPY: Record<Locale, AboutCopy> = {
  en: {
    hero: {
      ariaLabel: 'About Linden',
      imageAlt: 'A bone-toned room corner with a single chair and warm afternoon light.',
      headline: 'Furniture, considered.',
      lede: 'Or — a chat that does the considering with you.',
    },
    problem: {
      ariaLabel: 'The problem we solve',
      eyebrow: 'The problem',
      headline: 'You bought the apartment. The room is up to you.',
      body: [
        'Eleven open tabs. Three weeks of comparing. Seventeen filter facets that still can’t tell you which sofa fits an 11-foot wall. The catalog promises infinite choice and delivers infinite second-guessing.',
        'The thing keeping you stuck isn’t a missing piece. It’s the missing person — the friend who happens to know furniture, who’ll look at your room, ask one good question, and tell you what fits.',
      ],
      imageAlt: 'A composed corner with neutral textures and afternoon light.',
    },
    howItWorks: {
      ariaLabel: 'How Linden works',
      eyebrow: 'How it works',
      headline: 'Three steps. No filters.',
      steps: [
        {
          iconKey: 'leaf',
          number: '01',
          title: 'Tell us about your room.',
          body: 'One question opens it: what room are you working on? Then a second: how big, where does the light come from, what’s the wall like. Two messages. Forty-five seconds.',
        },
        {
          iconKey: 'messageSquare',
          number: '02',
          title: 'Get two picks. Both fit.',
          body: 'Linden returns two pieces — sometimes three — with a one-line reason for each. Not a grid of forty. Not a quiz with eleven facets. Two picks. The reasoning is the product.',
        },
        {
          iconKey: 'xCircle',
          number: '03',
          title: 'Or hear “don’t buy.” We mean it.',
          body: 'When the math doesn’t work, Linden says so. “Honestly, don’t buy this one” — the wall’s wrong, the scale’s off, the budget’s a stretch. We point you at an alternative that fits, or suggest waiting until you have more information.',
        },
      ],
    },
    refusalSurface: {
      ariaLabel: 'The Refusal Surface',
      eyebrow: 'What makes Linden different',
      pullQuote: [
        'Most furniture sites are optimized to make a sale.',
        'We’re optimized to make one that doesn’t come back.',
      ],
      body: [
        'Every other site in this category is measured on conversion per session. To ship a feature where the agent says “don’t buy”, they’d have to rebuild their merchandising stack against their own incentives.',
        'Linden doesn’t have that constraint. The catalog is small enough that we know each piece well enough to make the call. The refusal is what makes the next recommendation worth listening to.',
      ],
    },
    tryItNow: {
      ariaLabel: 'Try it now',
      eyebrow: 'Try it',
      headline: 'One question. No email. No filters.',
      ctaLabel: 'Talk to Linden',
      helper: 'Opens the chat right where you are. Try mentioning a room you’re working on, or ask the agent to compare two pieces.',
    },
    aboutThisDemo: {
      ariaLabel: 'About this demo',
      eyebrow: 'About this demo',
      bodyLead: 'Linden is a portfolio piece by ',
      bodyAuthor: 'Felipe Moreira',
      bodyTrail: ' — built to show one pattern: AI as the merchandising surface of e-commerce, not a help widget pinned to a corner. The store is fictional. The pattern is real, and it ships in production today.',
      upworkLabel: 'Hire on Upwork',
      githubLabel: 'See the code',
      licenseLabel: 'Open source under MIT',
      otherLocaleLabel: 'Leia em português',
    },
  },
  pt: {
    hero: {
      ariaLabel: 'Sobre a Linden',
      imageAlt: 'Um canto de quarto em tons de osso, com uma única cadeira e luz quente da tarde.',
      headline: 'Móveis, com cuidado.',
      lede: 'Ou — uma conversa que cuida disso com você.',
    },
    problem: {
      ariaLabel: 'O problema que a gente resolve',
      eyebrow: 'O problema',
      headline: 'Você comprou o apartamento. Agora a sala depende de você.',
      body: [
        'Onze abas abertas. Três semanas comparando. Dezessete filtros que ainda não te dizem qual sofá cabe numa parede de 3,30 m. O catálogo promete escolha infinita e entrega indecisão infinita.',
        'O que está te travando não é uma peça que falta. É uma pessoa que falta — o amigo que entende de móveis, que olha pro seu cômodo, faz uma boa pergunta e te diz o que cabe.',
      ],
      imageAlt: 'Um canto composto com texturas neutras e luz quente da tarde.',
    },
    howItWorks: {
      ariaLabel: 'Como a Linden funciona',
      eyebrow: 'Como funciona',
      headline: 'Três passos. Sem filtros.',
      steps: [
        {
          iconKey: 'leaf',
          number: '01',
          title: 'Conta sobre o seu cômodo.',
          body: 'Uma pergunta abre a conversa: qual ambiente você está montando? Depois uma segunda: o tamanho, a direção da luz, como é a parede. Duas mensagens. Quarenta e cinco segundos.',
        },
        {
          iconKey: 'messageSquare',
          number: '02',
          title: 'Recebe duas opções. Ambas servem.',
          body: 'A Linden devolve duas peças — às vezes três — com um motivo pra cada uma. Não é uma grade de quarenta. Não é um quiz com onze perguntas. Duas opções. O motivo é o produto.',
        },
        {
          iconKey: 'xCircle',
          number: '03',
          title: 'Ou ouve “não compra.” A gente fala sério.',
          body: 'Quando a conta não fecha, a Linden diz. “Honestamente, não compre essa peça” — a parede tá errada, a escala não bate, o orçamento é apertado. A gente aponta uma alternativa que cabe, ou sugere esperar até você ter mais informação sobre o cômodo.',
        },
      ],
    },
    refusalSurface: {
      ariaLabel: 'O diferencial da recusa',
      eyebrow: 'O que diferencia a Linden',
      pullQuote: [
        'Quase todo site de móveis é otimizado pra fechar uma venda.',
        'A gente é otimizado pra fechar uma venda que não volta como devolução.',
      ],
      body: [
        'Todo concorrente nessa categoria é medido por conversão por sessão. Pra entregar uma feature em que o agente diz “não compra”, eles precisariam reconstruir toda a estrutura de merchandising contra os próprios incentivos.',
        'A Linden não tem essa restrição. O catálogo é pequeno o bastante pra gente conhecer cada peça e fazer essa avaliação. A recusa é o que faz a próxima recomendação valer a pena ouvir.',
      ],
    },
    tryItNow: {
      ariaLabel: 'Experimente agora',
      eyebrow: 'Experimente',
      headline: 'Uma pergunta. Sem e-mail. Sem filtros.',
      ctaLabel: 'Conversar com a Linden',
      helper: 'Abre o chat aqui mesmo. Tente mencionar um cômodo que você está montando, ou peça pro agente comparar duas peças.',
    },
    aboutThisDemo: {
      ariaLabel: 'Sobre esta demo',
      eyebrow: 'Sobre esta demo',
      bodyLead: 'A Linden é um projeto de portfólio do ',
      bodyAuthor: 'Felipe Moreira',
      bodyTrail: ' — construído pra mostrar um pattern: IA como superfície de merchandising do e-commerce, não como widget de ajuda no canto. A loja é fictícia. O pattern é real, e roda em produção hoje.',
      upworkLabel: 'Contrate no Upwork',
      githubLabel: 'Ver o código',
      licenseLabel: 'Código aberto sob licença MIT',
      otherLocaleLabel: 'Read in English',
    },
  },
}
