import Head from 'next/head'
import Link from 'next/link'

import { getDrafts } from '../../lib/posts'

// Página oculta (sin enlaces ni indexación) para revisar online los posts con `draft: true`.
// Para publicar uno, cambia `draft: false` y ajusta `date` al día de publicación.
export const getStaticProps = async () => ({
  props: { drafts: getDrafts() }
})

export default function Borradores({ drafts }) {
  return (
    <>
      <Head>
        <title>Borradores · Victor Villazón</title>
        <meta name="robots" content="noindex, nofollow" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className='mx-auto max-w-3xl px-6 pb-24'>
        <section className='flex flex-col gap-3 py-16'>
          <p className='font-mono text-[13px] tracking-[0.08em] text-accent'>BORRADORES</p>
          <h1 className='text-4xl font-bold tracking-tight'>Posts por revisar</h1>
          <p className='text-lg leading-relaxed text-zinc-400'>
            {drafts.length} borradores, en el orden en que se publicarían. Esta página no aparece en el menú ni en buscadores.
          </p>
        </section>

        {drafts.length === 0 ? (
          <p className='rounded-2xl border border-dashed border-line px-6 py-12 text-center text-zinc-400'>No hay borradores pendientes.</p>
        ) : (
          <ol className='flex flex-col gap-3'>
            {drafts.map(post => (
              <li key={post.slug}>
                <Link
                  href={`/blog/${post.slug}`}
                  className='group flex items-start gap-4 rounded-2xl border border-line bg-surface p-5 transition-colors hover:border-zinc-600'>
                  <span className='min-w-[2.5rem] font-mono text-sm text-zinc-500'>{post.order ?? '—'}</span>
                  <span className='flex flex-col gap-1'>
                    <span className='font-mono text-xs text-accent'>{post.series} · {post.readingTime} min</span>
                    <span className='font-semibold leading-snug text-zinc-50 transition-colors group-hover:text-accent'>{post.title}</span>
                    <span className='text-sm leading-relaxed text-zinc-400'>{post.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        )}
      </main>
    </>
  )
}
