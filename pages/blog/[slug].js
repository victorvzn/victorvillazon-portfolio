import Head from 'next/head'
import Link from 'next/link'

import { getAllSlugs, getPostBySlug } from '../../lib/posts'
import { formatDate } from '../../lib/formatDate'
import { useLocale, useT } from '../../locales'

const SITE_URL = 'https://victorvillazon.com'

export const getStaticPaths = async ({ locales }) => ({
  // Incluye los borradores para poder revisarlos online desde /blog/borradores
  paths: getAllSlugs().flatMap(slug => locales.map(locale => ({ params: { slug }, locale }))),
  // En dev, `next dev` cachea estas rutas y un .md nuevo daría 404 hasta reiniciar;
  // 'blocking' lo resuelve en la petición (getStaticProps devuelve notFound si no existe)
  fallback: process.env.NODE_ENV === 'development' ? 'blocking' : false
})

export const getStaticProps = async ({ params }) => {
  const post = await getPostBySlug(params.slug)
  if (!post) return { notFound: true }
  return { props: { post } }
}

export default function Post({ post }) {
  const { meta, html } = post
  const locale = useLocale()
  const t = useT()

  const url = `${SITE_URL}${locale === 'en' ? '/en' : ''}/blog/${meta.slug}`

  return (
    <>
      <Head>
        <title>{`${meta.title} · Victor Villazón`}</title>
        <meta name="description" content={meta.description} />
        <link rel="icon" href="/favicon.ico" />
        <link rel="canonical" href={`${SITE_URL}/blog/${meta.slug}`} />
        <meta property="og:type" content="article" />
        <meta property="og:title" content={meta.title} />
        <meta property="og:description" content={meta.description} />
        <meta property="og:url" content={url} />
        <meta property="article:published_time" content={meta.date} />
        {meta.draft && <meta name="robots" content="noindex, nofollow" />}
      </Head>

      <main className='mx-auto max-w-3xl px-6 pb-24'>
        <Link href={meta.draft ? '/blog/borradores' : '/blog'} className='mt-10 inline-flex min-h-[44px] items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-accent'>
          <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 18l-6-6 6-6" /></svg>
          {t.blog.back}
        </Link>

        <article lang="es">
          <header className='flex flex-col gap-5 border-b border-line pb-10 pt-6'>
            <div className='flex flex-wrap items-center gap-x-3 gap-y-2 font-mono text-xs text-zinc-400'>
              {meta.series && <span className='text-accent'>{t.blog.series[meta.series] ?? meta.series}</span>}
              <time dateTime={meta.date}>{formatDate(meta.date, t.blog.dateLocale)}</time>
              <span>· {meta.readingTime} {t.blog.minRead}</span>
              {meta.draft && <span className='rounded-full border border-zinc-600 px-2 py-0.5 text-zinc-300'>{t.blog.draft}</span>}
            </div>
            <h1 className='text-3xl font-bold leading-tight tracking-tight md:text-5xl'>{meta.title}</h1>
            {meta.description && <p className='text-lg leading-relaxed text-zinc-400'>{meta.description}</p>}
            {t.blog.spanishOnly && <p className='self-start rounded-lg border border-line bg-raised px-3 py-1.5 text-sm text-zinc-300' lang="en">{t.blog.spanishOnly}</p>}
          </header>

          {meta.youtube && (
            <figure className='mt-10 flex flex-col gap-3'>
              <div className='aspect-video overflow-hidden rounded-2xl border border-line bg-surface'>
                <iframe
                  className='h-full w-full'
                  src={`https://www.youtube-nocookie.com/embed/${meta.youtube}`}
                  title={meta.title}
                  loading="lazy"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen />
              </div>
              <figcaption className='text-sm text-zinc-400'>{t.blog.video}</figcaption>
            </figure>
          )}

          {/* El HTML sale de los .md del repo (contenido propio), generado en build */}
          <div className='prose-post pt-10' dangerouslySetInnerHTML={{ __html: html }} />
        </article>

        <aside className='mt-16 flex flex-col gap-5 rounded-[20px] border border-line bg-surface p-8'>
          <div className='flex flex-col gap-2'>
            <h2 className='text-2xl font-semibold tracking-tight'>{t.blog.ctaTitle}</h2>
            <p className='leading-relaxed text-zinc-400'>{t.blog.ctaText}</p>
          </div>
          <a
            href="https://www.linkedin.com/in/victorvzn"
            target='_blank'
            rel='noreferrer'
            className='inline-flex min-h-[48px] items-center self-start rounded-[10px] bg-accent px-5 text-[15px] font-semibold text-ink transition hover:brightness-110'>
            {t.blog.ctaButton}
          </a>
        </aside>
      </main>
    </>
  )
}
