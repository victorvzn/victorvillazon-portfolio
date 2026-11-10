import { useState } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import { Link as LinkScroll } from 'react-scroll'

import Card from '../components/Card'
import { useLocale, useT } from '../locales'

const SITE_URL = 'https://victorvillazon.com'
const CULQI_DEMO_URL = 'https://afiliate.culqi.com/'

// Los textos traducibles son { es, en }; los que no cambian entre idiomas quedan como string
const tr = (value, locale) => (typeof value === 'object' ? value[locale] : value)

const cards = [
  {
    id: 12,
    type: 'vue',
    image: '/images/culqi-afiliate-card.webp', // recorte 16:9 de culqi-afiliacion-de-comercios.webp
    title: { es: 'Culqi · Afiliación de comercios', en: 'Culqi · Merchant onboarding' },
    content: {
      es: 'Plataforma de afiliación de comercios para los POS de Culqi, construida desde cero liderando su arquitectura frontend. Llevó la activación de 5 días a menos de 24 h y redujo ~35% la fricción del alta. 85% de cobertura de tests.',
      en: "Merchant onboarding platform for Culqi's POS terminals, built from scratch while leading its frontend architecture. Cut activation time from 5 days to under 24 h and reduced sign-up friction by ~35%. 85% test coverage."
    },
    tags: ['Vue.js 3', 'TypeScript', 'Pinia', 'Tailwind CSS', 'Vite', 'Zod', 'Jest', 'Node.js', 'AWS S3'],
    links: {
      live: CULQI_DEMO_URL
    },
    isVip: true,
    isLive: true,
    isHidden: false
  },
  {
    id: 1,
    type: 'next.js',
    image: '/images/fullstack-academy-pro.webp',
    title: 'Fullstack Academy',
    content: {
      es: 'Plataforma educativa con lecciones, retos con validación automática y seguimiento del progreso. La usan más de 300 alumnos; incluye login con GitHub, roles y un playground de código.',
      en: 'Learning platform with lessons, auto-graded challenges and progress tracking. Used by 300+ students; includes GitHub login, roles and a code playground.'
    },
    tags: ['Next.js', 'React', 'Typescript', 'Zustand', 'Shadcn', 'Drizzle', 'Turso', 'Vercel'],
    links: {
      live: 'https://fullstack-academy-pro.vercel.app/c/g99',
      repository: 'https://github.com/victorvzn/'
    },
    isVip: true,
    isHidden: false
  },
  {
    id: 2,
    type: 'react',
    image: '/images/api-box-app.webp',
    title: 'Api box',
    content: {
      es: 'Crea APIs mock en segundos para practicar métodos HTTP sin montar un backend. La comunidad ya ha creado más de 1 200 APIs. Código abierto.',
      en: 'Create mock APIs in seconds to practice HTTP methods without setting up a backend. The community has already created 1,200+ APIs. Open source.'
    },
    tags: ['React', 'Vite', 'Vercel', 'Turso'],
    links: {
      live: 'https://apibox.vercel.app/',
      repository: 'https://github.com/victorvzn/'
    },
    isVip: true,
    isHidden: false
  },
  {
    id: 3,
    type: 'react',
    image: '/images/coach-you-app.webp',
    title: 'CoachYou',
    content: {
      es: 'MVP de una plataforma de mentorías profesionales: los usuarios reservan sesiones uno a uno con expertos de su área.',
      en: 'MVP of a professional mentoring platform: users book one-on-one sessions with experts in their field.'
    },
    tags: ['React', 'Vite', 'Vercel', 'Supabase'],
    links: {
      live: 'https://coach-you-react.vercel.app',
      repository: 'https://github.com/victorvzn/coachYouReact'
    },
    isVip: false,
    isHidden: false
  },
  {
    id: 4,
    type: 'react',
    image: '/images/score-board-challenge-tdd.webp',
    title: 'World Cup Score Board',
    content: {
      es: 'Reto técnico resuelto con TDD: marcador de partidos del Mundial construido con principios SOLID y Clean Code, cubierto con tests unitarios y E2E.',
      en: 'Technical challenge solved with TDD: a World Cup match scoreboard built with SOLID principles and Clean Code, covered by unit and E2E tests.'
    },
    tags: ['React', 'TypeScript', 'Vite', 'Vitest', 'Jest', 'Testing Library', 'Cypress', 'ESLint', 'TDD', 'SOLID'],
    links: {
      live: 'https://github.com/victorvzn/tdd-score-board-react',
      repository: 'https://github.com/victorvzn/tdd-score-board-react'
    },
    isVip: true,
    isHidden: false
  },
  {
    id: 5,
    type: 'react',
    image: '/images/pokemon-list-react-router-redux.webp',
    title: 'PokemonList · React + Redux',
    content: {
      es: 'Listado de pokémon con estado global en Redux Toolkit y navegación entre vistas con React Router v6.',
      en: 'Pokémon list with global state in Redux Toolkit and navigation between views with React Router v6.'
    },
    tags: ['React', 'JavaScript', 'Vite', 'Redux Toolkit', 'React Router v6'],
    links: {
      live: 'https://victorvzn.github.io/pokemonList-react/',
      repository: 'https://github.com/victorvzn/pokemonList-react'
    },
    isVip: true,
    isHidden: false,
    collaborators: [{
      name: 'Sofia Villazón',
      link: 'https://www.linkedin.com/in/sofiavillazon/'
    }]
  },
  {
    id: 6,
    type: 'react',
    image: '/images/personal1.webp',
    title: 'victorvillazon.com',
    content: {
      es: 'Este portafolio: Next.js y Tailwind CSS, con fondo animado, filtros por tecnología y desplegado en Vercel.',
      en: 'This portfolio: Next.js and Tailwind CSS, with an animated background, technology filters and deployed on Vercel.'
    },
    tags: ['Next.js', 'React', 'Tailwind CSS', 'Vercel'],
    links: {
      live: 'https://victorvillazon.com',
      repository: 'https://github.com/victorvzn/victorvillazon-portfolio',
    },
  },
  {
    id: 7,
    type: 'react',
    image: '/images/memkards1.webp',
    title: 'Memkards',
    content: {
      es: 'App para estudiar con flashcards: crea y organiza tus tarjetas, con inicio de sesión vía GitHub.',
      en: 'Flashcard study app: create and organize your cards, with GitHub sign-in.'
    },
    tags: ['React', 'Firebase', 'Vercel'],
    links: {
      live: 'https://memkards.vercel.app',
      repository: 'https://gitlab.com/victorvzn/memkards-web'
    },
  },
  {
    id: 8,
    type: 'react',
    image: '/images/phone-book1.webp',
    title: 'Phone Book',
    content: {
      es: 'Reto técnico en React: agenda telefónica para gestionar contactos.',
      en: 'React technical challenge: a phone book to manage contacts.'
    },
    tags: ['React', 'Vite', 'Vercel'],
    links: {
      live: 'https://challenge-react-phone-book.vercel.app',
      repository: 'https://github.com/victorvzn/challenge-react-phone-book'
    }
  },
  {
    id: 9,
    type: 'vue',
    image: '/images/invoice-app.webp',
    title: 'Invoice app',
    content: {
      es: 'Reto de Frontend Mentor: app de facturas maquetada fiel al diseño original con Vue 3, Pinia y Tailwind.',
      en: 'Frontend Mentor challenge: an invoicing app built pixel-faithful to the original design with Vue 3, Pinia and Tailwind.'
    },
    tags: ['Vue 3', 'Vite', 'Pinia', 'Tailwind CSS'],
    links: {
      live: 'https://invoices-app-vue3.vercel.app',
      repository: 'https://github.com/victorvzn/invoices-app-vue3'
    },
  },
  {
    id: 10,
    type: 'vue',
    image: '/images/pokemon-challenge1.webp',
    title: { es: 'Pokémon favoritos', en: 'Favorite Pokémon' },
    content: {
      es: 'Reto técnico: gestión de pokémon favoritos con modales, consumiendo PokeAPI y con tests E2E en Cypress.',
      en: 'Technical challenge: managing favorite Pokémon with modals, consuming PokeAPI, with E2E tests in Cypress.'
    },
    tags: ['Vue 2', 'Vuex', 'Axios', 'Cypress', 'Vercel'],
    links: {
      live: 'https://pokemon-challenge-1.vercel.app',
      repository: 'https://github.com/victorvzn/pokemon-challenge-1',
    },
  },
  {
    id: 11,
    type: 'vue',
    image: '/images/vendedores-a-correr-1.webp',
    title: { es: 'Concurso de vendedores', en: 'Sales contest' },
    content: {
      es: 'Reto técnico: concurso de ventas para el equipo comercial de una empresa de imágenes, integrado con la API de Alegra.',
      en: "Technical challenge: a sales contest for an image company's sales team, integrated with the Alegra API."
    },
    tags: ['Vue 2', 'Vuex', 'Axios', 'i18n'],
    links: {
      live: 'https://challenge-vendedores-a-correr.vercel.app',
      repository: 'https://github.com/victorvzn/challenge-vendedores-a-correr'
    }
  }
]

// `area` es una clave de t.skills.areas (locales/*.js)
const skillGroups = [
  { area: 'frontend', items: ['Vue.js 2/3', 'Pinia', 'React', 'Next.js', 'Zustand', 'TypeScript', 'JavaScript', 'HTML5', 'CSS3', 'Sass', 'Tailwind CSS'] },
  { area: 'architecture', items: ['Microfrontends', 'Design systems (Storybook)', { es: 'Migración de monolitos', en: 'Monolith migration' }, 'SOLID', 'APIs REST'] },
  { area: 'quality', items: ['Jest', 'Vitest', 'Testing Library', 'Cypress', 'TDD', 'ESLint', 'SonarQube'] },
  { area: 'performance', items: ['Core Web Vitals', { es: 'Accesibilidad (WCAG)', en: 'Accessibility (WCAG)' }, 'Responsive design', 'Figma'] },
  { area: 'devops', items: ['AWS', 'Vercel', 'Docker', 'CI/CD', 'Node.js', 'Laravel', 'PostgreSQL'] }
]

// `label` null = se usa t.projects.all
const filters = [
  { value: 'all', label: null },
  { value: 'react', label: 'React' },
  { value: 'vue', label: 'Vue' },
  { value: 'next.js', label: 'Next.js' }
]

const GithubIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" /></svg>
)

const LinkedinIcon = () => (
  <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2zM4 6a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" /></svg>
)

const iconButtonClass = 'inline-flex h-12 w-12 items-center justify-center rounded-[10px] border border-zinc-700 transition-colors hover:border-accent hover:text-accent'

const SectionLabel = ({ children }) => (
  <p className='font-mono text-[13px] tracking-[0.08em] text-accent'>{children}</p>
)

export default function Home() {
  const [filter, setFilter] = useState('all')
  const locale = useLocale()
  const t = useT()

  const visibleCards = cards
    .filter(card => filter === 'all' || card.type === filter)
    .filter(card => card.isHidden !== true)

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>{t.meta.title}</title>
        <meta name="description" content={t.meta.description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/`} />
      </Head>

      <main className='max-w-6xl mx-auto px-6'>

        {/* Hero */}
        <section className='flex flex-col-reverse items-center gap-12 py-20 md:flex-row md:justify-between md:py-28'>
          <div className='flex flex-col gap-6 md:max-w-2xl'>
            <div className='inline-flex items-center gap-2 self-start rounded-full border border-line px-3 py-1.5 text-[13px] text-zinc-400'>
              <span className='h-2 w-2 rounded-full bg-green-400' aria-hidden="true"></span>
              {t.hero.location}
            </div>
            <p className='text-lg text-zinc-400'>{t.hero.greeting}</p>
            <h1 className='text-4xl font-bold leading-[1.05] tracking-tight md:text-6xl'>
              {t.hero.titleStart}<span className='text-accent'>{t.hero.titleHighlight}</span>
            </h1>
            <p className='max-w-xl text-lg leading-relaxed text-zinc-400'>
              {t.hero.intro}
            </p>
            <div className='flex flex-wrap gap-3 pt-2'>
              <LinkScroll
                to="projects"
                smooth={true}
                offset={-72}
                href="#projects"
                className='inline-flex min-h-[48px] cursor-pointer items-center gap-2 rounded-[10px] bg-accent px-5 text-[15px] font-semibold text-ink transition hover:brightness-110'>
                {t.hero.cta}
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </LinkScroll>
              <a href="https://github.com/victorvzn/" target='_blank' rel='noreferrer' aria-label="GitHub" className={iconButtonClass}><GithubIcon /></a>
              <a href="https://www.linkedin.com/in/victorvzn" target='_blank' rel='noreferrer' aria-label="LinkedIn" className={iconButtonClass}><LinkedinIcon /></a>
            </div>
          </div>

          <Image
            className='h-60 w-60 rounded-3xl border border-line object-cover shadow-[0_0_0_8px_rgba(24,24,27,0.8),0_0_80px_rgba(109,40,217,0.35)] md:h-[300px] md:w-[300px]'
            src="/me.webp"
            alt={t.hero.photoAlt}
            width={300}
            height={300}
            priority={true} />
        </section>

        {/* Habilidades */}
        <section id="skills" className='flex flex-col gap-12 border-t border-line py-[72px] md:flex-row'>
          <div className='flex flex-col gap-3 md:w-1/3'>
            <SectionLabel>{t.skills.label}</SectionLabel>
            <h2 className='text-3xl font-semibold tracking-tight'>{t.skills.title}</h2>
            <p className='leading-relaxed text-zinc-400'>{t.skills.english}</p>
          </div>
          <div className='flex flex-col gap-7 md:w-2/3'>
            {skillGroups.map(group => (
              <div key={group.area} className='flex flex-col gap-3'>
                <h3 className='text-sm font-medium text-zinc-400'>{t.skills.areas[group.area]}</h3>
                <ul className='flex flex-wrap gap-2'>
                  {group.items.map(item => {
                    const skill = tr(item, locale)
                    return <li key={skill} className='rounded-lg border border-zinc-700 bg-raised px-3 py-1.5 text-sm text-zinc-200'>{skill}</li>
                  })}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Proyectos */}
        <section id="projects" className='flex flex-col gap-10 border-t border-line pb-24 pt-[72px]'>
          <div className='flex flex-wrap items-end justify-between gap-6'>
            <div className='flex flex-col gap-3'>
              <SectionLabel>{t.projects.label}</SectionLabel>
              <h2 className='text-3xl font-semibold tracking-tight'>{t.projects.title}</h2>
              <p className='max-w-xl leading-relaxed text-zinc-400'>{t.projects.subtitle}</p>
            </div>
            <div role="group" aria-label={t.projects.filterLabel} className='flex flex-wrap gap-1 rounded-[10px] border border-line bg-raised p-1'>
              {filters.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={filter === value}
                  onClick={() => setFilter(value)}
                  className={`min-h-[36px] rounded-md px-3.5 text-sm font-medium transition-colors ${filter === value ? 'bg-zinc-50 text-ink' : 'text-zinc-400 hover:text-zinc-50'}`}>
                  {label ?? t.projects.all}
                </button>
              ))}
            </div>
          </div>

          <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3'>
            {visibleCards.map(card => (
              <Card
                key={card.id}
                type={card.type}
                image={card.image}
                title={tr(card.title, locale)}
                content={tr(card.content, locale)}
                tags={card.tags}
                links={card.links}
                isVip={card.isVip}
                isLive={card.isLive}
                collaborators={card.collaborators}
              />
            ))}
          </div>
        </section>

        {/* Contacto */}
        <section id="contact" className='mb-24 flex flex-wrap items-center justify-between gap-6 rounded-[20px] bg-accent p-8 text-ink md:p-12'>
          <div className='flex flex-col gap-2.5'>
            <h2 className='text-3xl font-bold leading-tight tracking-tight md:text-[40px]'>{t.contact.title}</h2>
            <p className='text-[17px] text-[#422006]'>{t.contact.subtitle}</p>
          </div>
          <div className='flex flex-wrap gap-2.5'>
            <a href="https://www.linkedin.com/in/victorvzn" target='_blank' rel='noreferrer' className='inline-flex min-h-[48px] items-center rounded-[10px] bg-ink px-5 text-[15px] font-semibold text-zinc-50 transition hover:bg-zinc-800'>LinkedIn</a>
            <a href="https://github.com/victorvzn/" target='_blank' rel='noreferrer' className='inline-flex min-h-[48px] items-center rounded-[10px] border border-ink px-5 text-[15px] font-semibold text-ink transition hover:bg-ink/10'>GitHub</a>
          </div>
        </section>
      </main>
    </>
  )
}
