import { useState } from 'react'

import Head from 'next/head'
import Link from 'next/link'

import { getAllPosts } from '../../lib/posts'
import { formatDate } from '../../lib/formatDate'
import { useT } from '../../locales'

const SITE_URL = 'https://victorvillazon.com'

// Claves de t.blog.series (locales/*.js) en el orden de las pestañas; el frontmatter `series` usa estas mismas claves
const SERIES = ['html', 'css', 'javascript', 'frameworks', 'backend', 'carrera']

export const getStaticProps = async () => ({
  props: { posts: getAllPosts() }
})

export default function Blog({ posts }) {
  const [filter, setFilter] = useState('all')
  const t = useT()

  const visiblePosts = posts.filter(post => filter === 'all' || post.series === filter)

  // Solo se muestran las pestañas de series que ya tienen artículos
  const tabs = ['all', ...SERIES.filter(series => posts.some(post => post.series === series))]

  return (
    <>
      <Head>
        <title>{t.blog.metaTitle}</title>
        <meta name="description" content={t.blog.metaDescription} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="alternate" hrefLang="es" href={`${SITE_URL}/blog`} />
        <link rel="alternate" hrefLang="en" href={`${SITE_URL}/en/blog`} />
        <link rel="alternate" hrefLang="x-default" href={`${SITE_URL}/blog`} />
      </Head>

      <main className='max-w-6xl mx-auto px-6 pb-24'>
        <section className='flex flex-wrap items-end justify-between gap-6 py-16 md:py-20'>
          <div className='flex flex-col gap-3'>
            <p className='font-mono text-[13px] tracking-[0.08em] text-accent'>{t.blog.label}</p>
            <h1 className='text-4xl font-bold tracking-tight md:text-5xl'>{t.blog.title}</h1>
            <p className='max-w-xl text-lg leading-relaxed text-zinc-400'>{t.blog.subtitle}</p>
            {t.blog.spanishOnly && (
              <p className='self-start rounded-lg border border-line bg-raised px-3 py-1.5 text-sm text-zinc-300'>{t.blog.spanishOnly}</p>
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
        </section>

        {visiblePosts.length === 0 ? (
          <p className='rounded-2xl border border-dashed border-line px-6 py-12 text-center text-zinc-400'>{t.blog.empty}</p>
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
