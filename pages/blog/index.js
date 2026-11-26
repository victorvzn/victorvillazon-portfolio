import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import Seo from '../../components/Seo'
import { getAllPosts } from '../../lib/posts'
import { buildIndex, searchPosts } from '../../lib/search'
import { buildSections } from '../../lib/blogStructure'
import { AUTHOR, SITE_URL, localeUrl, ogImageUrl } from '../../lib/site'
import { useLocale, useT } from '../../locales'

// Claves de t.blog.series (locales/*.js) en el orden del índice; el frontmatter `series` usa estas mismas claves
const SERIES = ['html', 'css', 'javascript', 'ejercicios', 'frameworks', 'backend', 'carrera']

const LEVELS = ['basic', 'intermediate', 'advanced']

// Color de cada serie: punto, números y círculos de los módulos
const SERIES_COLORS = {
  html: { dot: 'bg-orange-400', text: 'text-orange-400', border: 'border-orange-400' },
  css: { dot: 'bg-blue-400', text: 'text-blue-400', border: 'border-blue-400' },
  javascript: { dot: 'bg-yellow-400', text: 'text-yellow-400', border: 'border-yellow-400' },
  ejercicios: { dot: 'bg-green-400', text: 'text-green-400', border: 'border-green-400' },
  default: { dot: 'bg-zinc-400', text: 'text-zinc-400', border: 'border-zinc-400' }
}

const colorsOf = (series) => SERIES_COLORS[series] ?? SERIES_COLORS.default

const sectionId = (series, moduleId) => (moduleId ? `serie-${series}-${moduleId}` : `serie-${series}`)

export const getStaticProps = async () => ({
  props: { posts: getAllPosts() }
})

function FilterGroup({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className='flex flex-wrap gap-1 rounded-[10px] border border-line bg-raised p-1'>
      {options.map(option => (
        <button
          key={option.value}
          type="button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
          className={`min-h-[36px] rounded-md px-3.5 text-sm font-medium transition-colors ${value === option.value ? 'bg-zinc-50 text-ink' : 'text-zinc-400 hover:text-zinc-50'}`}>
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default function Blog({ posts }) {
  const [filter, setFilter] = useState('all')
  const [level, setLevel] = useState('all')
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const router = useRouter()
  const t = useT()
  const locale = useLocale()

  // El índice normalizado se arma una sola vez; filtrar con la consulta "diferida" mantiene el input fluido
  const index = useMemo(() => buildIndex(posts, t.blog.series), [posts, t.blog.series])
  const deferredQuery = useDeferredValue(query)
  const searching = deferredQuery.trim() !== ''

  // Series → módulos → posts, en orden de lectura (lib/blogStructure.js)
  const allSections = useMemo(() => buildSections(posts, SERIES, locale), [posts, locale])

  const sections = useMemo(() => {
    const matching = new Set(searchPosts(index, deferredQuery).map(post => post.slug))
    return allSections
      .filter(section => filter === 'all' || section.series === filter)
      .map(section => ({
        ...section,
        modules: section.modules
          .filter(module => level === 'all' || module.level === level)
          .map(module => ({ ...module, posts: module.posts.filter(post => matching.has(post.slug)) }))
          .filter(module => module.posts.length)
      }))
      .filter(section => section.modules.length)
  }, [allSections, index, deferredQuery, filter, level])

  // Solo se muestran los filtros que tienen artículos
  const seriesOptions = [
    { value: 'all', label: t.blog.all },
    ...allSections.map(section => ({ value: section.series, label: t.blog.series[section.series] ?? section.series }))
  ]
  const levelOptions = [
    { value: 'all', label: t.blog.allLevels },
    ...LEVELS
      .filter(value => allSections.some(section => section.modules.some(module => module.level === value)))
      .map(value => ({ value, label: t.blog.levels[value] }))
  ]

  const filtering = searching || filter !== 'all' || level !== 'all'
  const statusText = searching
    ? t.blog.statusQuery(deferredQuery.trim())
    : filtering ? t.blog.statusFiltered : t.blog.statusAll

  // La búsqueda vive en la URL (?q=) para poder compartirla: se lee al cargar…
  useEffect(() => {
    if (router.isReady && typeof router.query.q === 'string') setQuery(router.query.q)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady])

  // …y se actualiza mientras escribes, sin recargar ni mover el scroll
  useEffect(() => {
    if (!router.isReady) return
    const timer = setTimeout(() => {
      const q = query.trim()
      if ((router.query.q ?? '') === q) return
      router.replace({ pathname: router.pathname, query: q ? { q } : {} }, undefined, { shallow: true, scroll: false })
    }, 300)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, router.isReady])

  // Atajo: "/" enfoca el buscador (salvo que ya estés escribiendo en otro campo)
  useEffect(() => {
    const onKeyDown = (event) => {
      const typing = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)
      if (event.key === '/' && !typing && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  const clearAll = () => {
    setQuery('')
    setFilter('all')
    setLevel('all')
    searchRef.current?.focus()
  }

  return (
    <>
      <Seo
        title={t.blog.metaTitle}
        description={t.blog.metaDescription}
        path="/blog"
        locale={locale}
        alternates
        image={ogImageUrl({ title: t.blog.title, subtitle: 'Blog' })}
        imageAlt={t.blog.title}
        jsonLd={{
          '@context': 'https://schema.org',
          '@type': 'Blog',
          '@id': `${SITE_URL}/blog#blog`,
          name: t.blog.title,
          description: t.blog.metaDescription,
          url: localeUrl('/blog', locale),
          inLanguage: 'es',
          author: { '@type': 'Person', name: AUTHOR.name, url: SITE_URL },
          blogPost: posts.filter(post => !post.draft).map(post => ({
            '@type': 'BlogPosting',
            headline: post.title,
            url: localeUrl(`/blog/${post.slug}`, 'es'),
            datePublished: post.date
          }))
        }} />

      <main className='max-w-6xl mx-auto px-6 pb-24'>
        <section className='flex flex-col gap-3 pt-16 pb-8 md:pt-20'>
          <p className='font-mono text-[13px] tracking-[0.08em] text-accent'>{t.blog.label}</p>
          <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>{t.blog.title}</h1>
          <p className='max-w-xl text-lg leading-relaxed text-zinc-400'>{t.blog.subtitle}</p>
          {t.blog.spanishOnly && (
            <p className='self-start rounded-lg border border-line bg-raised px-3 py-1.5 text-sm text-zinc-300'>{t.blog.spanishOnly}</p>
          )}
        </section>

        <section aria-label={t.blog.searchLabel} className='flex flex-col gap-4 pb-10'>
          <div role="search" className='relative'>
            <label htmlFor="buscar-articulos" className='sr-only'>{t.blog.searchLabel}</label>
            <svg aria-hidden="true" className='pointer-events-none absolute left-[18px] top-1/2 -translate-y-1/2 text-zinc-500' width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
            <input
              ref={searchRef}
              id="buscar-articulos"
              type="search"
              value={query}
              onChange={event => setQuery(event.target.value)}
              onKeyDown={event => { if (event.key === 'Escape' && query) { event.preventDefault(); setQuery('') } }}
              placeholder={t.blog.searchPlaceholder}
              autoComplete="off"
              spellCheck="false"
              aria-describedby="resultados-busqueda"
              className='blog-search min-h-[56px] w-full rounded-xl border border-line bg-raised pl-[52px] pr-14 text-[17px] text-zinc-50 placeholder:text-zinc-500 transition-colors focus:border-accent focus:outline-none' />
            {query ? (
              <button
                type="button"
                onClick={() => { setQuery(''); searchRef.current?.focus() }}
                aria-label={t.blog.clearSearch}
                className='absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-50'>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
              </button>
            ) : (
              <kbd aria-hidden="true" title={t.blog.searchShortcut} className='absolute right-4 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-700 px-2 font-mono text-xs text-zinc-500 md:block'>/</kbd>
            )}
          </div>

          <div className='flex flex-wrap items-center justify-between gap-3'>
            {seriesOptions.length > 2 && <FilterGroup label={t.blog.filterLabel} options={seriesOptions} value={filter} onChange={setFilter} />}
            {levelOptions.length > 2 && <FilterGroup label={t.blog.levelFilterLabel} options={levelOptions} value={level} onChange={setLevel} />}
          </div>

          <p id="resultados-busqueda" role="status" className='text-sm text-zinc-400'>{statusText}</p>
        </section>

        {sections.length === 0 ? (
          filtering ? (
            <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line px-6 py-12 text-center'>
              <p className='text-lg text-zinc-50'>{searching ? t.blog.noResults(deferredQuery.trim()) : t.blog.empty}</p>
              <p className='text-zinc-400'>{t.blog.noResultsHint}</p>
              <button
                type="button"
                onClick={clearAll}
                className='inline-flex min-h-[44px] items-center rounded-[10px] border border-zinc-700 bg-raised px-4 text-sm font-medium text-zinc-50 transition-colors hover:border-accent hover:text-accent'>
                {t.blog.clearSearch}
              </button>
            </div>
          ) : (
            <p className='rounded-2xl border border-dashed border-line px-6 py-12 text-center text-zinc-400'>{t.blog.empty}</p>
          )
        ) : (
          <div className='flex flex-wrap items-start gap-10'>
            {/* Índice: en escritorio acompaña al scroll; en móvil va arriba */}
            <nav aria-label={t.blog.indexLabel} className='flex flex-[1_1_240px] flex-col gap-6 rounded-2xl border border-line bg-surface p-5 md:sticky md:top-24 md:max-h-[calc(100vh-8rem)] md:max-w-[280px] md:overflow-y-auto'>
              <p className='font-mono text-xs tracking-[0.08em] text-zinc-400'>{t.blog.indexTitle}</p>
              {sections.map(section => {
                const colors = colorsOf(section.series)
                return (
                  <div key={section.series} className='flex flex-col gap-1.5'>
                    <a href={`#${sectionId(section.series)}`} className='flex min-h-[32px] items-center gap-2 text-[15px] font-semibold text-zinc-50 hover:text-accent'>
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${colors.dot}`} />
                      {t.blog.series[section.series] ?? section.series}
                    </a>
                    <ol className='flex flex-col'>
                      {section.modules.map((module, index) => (
                        <li key={module.id} className='flex gap-3'>
                          <span aria-hidden="true" className='flex w-6 flex-none flex-col items-center'>
                            <span className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] ${colors.border} ${colors.text}`}>{module.number}</span>
                            {index < section.modules.length - 1 && <span className='min-h-[12px] w-px flex-1 bg-line' />}
                          </span>
                          <a href={`#${sectionId(section.series, module.id)}`} className='flex min-h-[36px] min-w-0 flex-1 items-start pt-[3px] text-sm leading-snug text-zinc-400 hover:text-zinc-50'>
                            {module.name ?? t.blog.otherModule}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </div>
                )
              })}
            </nav>

            <div className='flex min-w-0 flex-[999_1_560px] flex-col gap-12'>
              {sections.map(section => {
                const colors = colorsOf(section.series)
                const name = t.blog.series[section.series] ?? section.series
                return (
                  <section key={section.series} id={sectionId(section.series)} aria-labelledby={`titulo-${section.series}`} className='flex scroll-mt-24 flex-col gap-5'>
                    <div className='flex flex-col gap-2'>
                      <h2 id={`titulo-${section.series}`} className='flex items-center gap-3 text-2xl font-semibold tracking-tight md:text-[28px]'>
                        <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
                        {name}
                      </h2>
                      {t.blog.seriesDescriptions[section.series] && (
                        <p className='max-w-2xl leading-relaxed text-zinc-400'>{t.blog.seriesDescriptions[section.series]}</p>
                      )}
                    </div>

                    {section.modules.map(module => (
                      <div key={module.id} id={sectionId(section.series, module.id)} className='scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-surface'>
                        <div className='flex items-center justify-between gap-3 border-b border-line px-5 py-3.5'>
                          <h3 className='flex items-center gap-3 font-semibold text-zinc-50'>
                            <span className={`flex h-7 w-7 flex-none items-center justify-center rounded-full border font-mono text-[11px] font-normal ${colors.border} ${colors.text}`}>
                              <span className='sr-only'>{t.blog.moduleLabel} </span>{module.number}
                            </span>
                            {module.name ?? t.blog.otherModule}
                          </h3>
                          {module.level && (
                            <span className='flex-none rounded-full border border-zinc-700 px-2.5 py-0.5 text-xs text-zinc-300'>{t.blog.levels[module.level]}</span>
                          )}
                        </div>
                        <ol className='px-5'>
                          {module.posts.map(post => (
                            <li key={post.slug} className='border-t border-[#1f1f23] first:border-t-0'>
                              <Link href={`/blog/${post.slug}`} className='group flex min-h-[52px] items-center gap-4 py-2.5'>
                                <span className={`w-7 flex-none font-mono text-[13px] ${colors.text}`}>{post.number}</span>
                                <span className='min-w-0 flex-1 text-[15px] leading-snug text-zinc-200 transition-colors group-hover:text-accent'>{post.title}</span>
                                {post.draft && <span className='flex-none rounded-full border border-zinc-600 px-2 py-0.5 font-mono text-xs text-zinc-300'>{t.blog.draft}</span>}
                                <span className='hidden flex-none font-mono text-xs text-zinc-400 sm:block'>{post.readingTime} {t.blog.minRead}</span>
                              </Link>
                            </li>
                          ))}
                        </ol>
                      </div>
                    ))}
                  </section>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
