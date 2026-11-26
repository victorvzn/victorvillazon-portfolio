import { useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'

import Link from 'next/link'
import { useRouter } from 'next/router'

import Seo from '../../components/Seo'
import { getAllPosts } from '../../lib/posts'
import { buildIndex, searchPosts } from '../../lib/search'
import { formatDate } from '../../lib/formatDate'
import { AUTHOR, SITE_URL, localeUrl, ogImageUrl } from '../../lib/site'
import { useLocale, useT } from '../../locales'

// Claves de t.blog.series (locales/*.js) en el orden de las pestañas; el frontmatter `series` usa estas mismas claves
const SERIES = ['html', 'css', 'javascript', 'ejercicios', 'frameworks', 'backend', 'carrera']

export const getStaticProps = async () => ({
  props: { posts: getAllPosts() }
})

export default function Blog({ posts }) {
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const searchRef = useRef(null)
  const router = useRouter()
  const t = useT()
  const locale = useLocale()

  // El índice normalizado se arma una sola vez; filtrar con la consulta "diferida" mantiene el input fluido
  const index = useMemo(() => buildIndex(posts, t.blog.series), [posts, t.blog.series])
  const deferredQuery = useDeferredValue(query)
  const searching = deferredQuery.trim() !== ''

  const visiblePosts = useMemo(
    () => searchPosts(index, deferredQuery).filter(post => filter === 'all' || post.series === filter),
    [index, deferredQuery, filter]
  )

  // Los borradores solo se ven en dev: no cuentan en el total
  const publishedCount = posts.filter(post => !post.draft).length

  // Solo se muestran las pestañas de series que ya tienen artículos
  const tabs = ['all', ...SERIES.filter(series => posts.some(post => post.series === series))]

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

  const clearSearch = () => {
    setQuery('')
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
        <section className='flex flex-wrap items-end justify-between gap-6 py-16 md:py-20'>
          <div className='flex flex-col gap-3'>
            <p className='font-mono text-[13px] tracking-[0.08em] text-accent'>
              {t.blog.label}
              <span className='text-zinc-500'> · {t.blog.postCount(publishedCount)}</span>
            </p>
            <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>{t.blog.title}</h1>
            <p className='max-w-xl text-lg leading-relaxed text-zinc-400'>{t.blog.subtitle}</p>
            {t.blog.spanishOnly && (
              <p className='self-start rounded-lg border border-line bg-raised px-3 py-1.5 text-sm text-zinc-300'>{t.blog.spanishOnly}</p>
            )}
          </div>
        </section>

        <section aria-label={t.blog.searchLabel} className='mb-8 flex flex-wrap items-center justify-between gap-4'>
          <div role="search" className='relative min-w-0 flex-[1_1_320px] md:max-w-md'>
            <label htmlFor="buscar-articulos" className='sr-only'>{t.blog.searchLabel}</label>
            <svg aria-hidden="true" className='pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500' width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 10a7 7 0 1 0 14 0a7 7 0 1 0 -14 0" /><path d="M21 21l-6 -6" /></svg>
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
              className='blog-search min-h-[48px] w-full rounded-[10px] border border-line bg-raised pl-11 pr-12 text-[15px] text-zinc-50 placeholder:text-zinc-500 transition-colors focus:border-accent focus:outline-none' />
            {query ? (
              <button
                type="button"
                onClick={clearSearch}
                aria-label={t.blog.clearSearch}
                className='absolute right-1 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md text-zinc-400 transition-colors hover:text-zinc-50'>
                <svg aria-hidden="true" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6l-12 12" /><path d="M6 6l12 12" /></svg>
              </button>
            ) : (
              <kbd aria-hidden="true" title={t.blog.searchShortcut} className='absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-zinc-700 px-1.5 font-mono text-xs text-zinc-500 md:block'>/</kbd>
            )}
          </div>
          {tabs.length > 2 && <div role="group" aria-label={t.blog.filterLabel} className='flex flex-wrap gap-1 rounded-[10px] border border-line bg-raised p-1'>
            {tabs.map(value => (
              <button
                key={value}
                type="button"
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
                className={`min-h-[36px] rounded-md px-3.5 text-sm font-medium transition-colors ${filter === value ? 'bg-zinc-50 text-ink' : 'text-zinc-400 hover:text-zinc-50'}`}>
                {value === 'all' ? t.blog.all : t.blog.series[value]}
              </button>
            ))}
          </div>}
          <p id="resultados-busqueda" role="status" className={searching ? 'w-full text-sm text-zinc-400' : 'sr-only'}>
            {searching ? t.blog.results(visiblePosts.length) : ''}
          </p>
        </section>

        {visiblePosts.length === 0 ? (
          searching ? (
            <div className='flex flex-col items-center gap-4 rounded-2xl border border-dashed border-line px-6 py-12 text-center'>
              <p className='text-lg text-zinc-50'>{t.blog.noResults(deferredQuery.trim())}</p>
              <p className='text-zinc-400'>{t.blog.noResultsHint}</p>
              <button
                type="button"
                onClick={clearSearch}
                className='inline-flex min-h-[44px] items-center rounded-[10px] border border-zinc-700 bg-raised px-4 text-sm font-medium text-zinc-50 transition-colors hover:border-accent hover:text-accent'>
                {t.blog.clearSearch}
              </button>
            </div>
          ) : (
            <p className='rounded-2xl border border-dashed border-line px-6 py-12 text-center text-zinc-400'>{t.blog.empty}</p>
          )
        ) : (
          <ul className='grid grid-cols-1 gap-6 md:grid-cols-2'>
            {visiblePosts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className='group flex h-full flex-col gap-4 rounded-2xl border border-line bg-surface p-6 transition-colors hover:border-zinc-600 md:p-7'>
                  <div className='flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-zinc-400'>
                    {post.series && <span className='text-accent'>{t.blog.series[post.series] ?? post.series}</span>}
                    <time dateTime={post.date}>{formatDate(post.date, t.blog.dateLocale)}</time>
                    <span>· {post.readingTime} {t.blog.minRead}</span>
                    {post.draft && <span className='rounded-full border border-zinc-600 px-2 py-0.5 text-zinc-300'>{t.blog.draft}</span>}
                  </div>
                  <h2 className='text-xl font-semibold leading-snug tracking-tight text-zinc-50 transition-colors group-hover:text-accent'>{post.title}</h2>
                  <p className='leading-relaxed text-zinc-400'>{post.description}</p>
                  {post.tags.length > 0 && (
                    <ul className='mt-auto flex flex-wrap gap-2 pt-2'>
                      {post.tags.map(tag => (
                        <li key={tag} className='rounded-lg border border-zinc-700 bg-raised px-2.5 py-1 text-xs text-zinc-300'>{tag}</li>
                      ))}
                    </ul>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
