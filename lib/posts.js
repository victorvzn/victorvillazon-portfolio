import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeHighlight from 'rehype-highlight'
import rehypeStringify from 'rehype-stringify'

import remarkPlayground from './remarkPlayground'

const POSTS_DIR = path.join(process.cwd(), 'content', 'blog')

// Los borradores (`draft: true`) solo se listan en /blog con `npm run dev`.
// En producción se revisan desde la página oculta /blog/borradores (con noindex).
const SHOW_DRAFTS = process.env.NODE_ENV !== 'production'

const WORDS_PER_MINUTE = 200

const readingTime = (text) => Math.max(1, Math.round(text.trim().split(/\s+/).length / WORDS_PER_MINUTE))

const readPost = (slug) => {
  const file = fs.readFileSync(path.join(POSTS_DIR, `${slug}.md`), 'utf8')
  const { data, content } = matter(file)

  const meta = {
    slug,
    title: data.title,
    description: data.description ?? '',
    date: data.date instanceof Date ? data.date.toISOString().slice(0, 10) : String(data.date),
    series: data.series ?? null,
    tags: data.tags ?? [],
    youtube: data.youtube ?? null,
    draft: data.draft === true,
    // Orden de publicación previsto; solo lo usa /blog/borradores
    order: data.order ?? null,
    readingTime: data.readingTime ?? readingTime(content)
  }

  return { meta, content }
}

const getSlugs = () => {
  if (!fs.existsSync(POSTS_DIR)) return []
  return fs.readdirSync(POSTS_DIR)
    .filter(file => file.endsWith('.md'))
    .map(file => file.replace(/\.md$/, ''))
}

const allMeta = () => getSlugs().map(slug => readPost(slug).meta)

// Metadatos de los posts publicados (y los borradores en dev), del más reciente al más antiguo
export const getAllPosts = () => allMeta()
  .filter(meta => SHOW_DRAFTS || !meta.draft)
  .sort((a, b) => (a.date < b.date ? 1 : -1))

// Slugs de todos los posts, borradores incluidos: cada uno tiene su página (los borradores con noindex)
export const getAllSlugs = getSlugs

// Solo los borradores, en el orden previsto de publicación
export const getDrafts = () => allMeta()
  .filter(meta => meta.draft)
  .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || a.title.localeCompare(b.title))

// Post completo con su contenido convertido a HTML, o null si no existe
export const getPostBySlug = async (slug) => {
  if (!getSlugs().includes(slug)) return null

  const { meta, content } = readPost(slug)

  const html = await remark()
    .use(remarkGfm)
    .use(remarkPlayground)
    .use(remarkRehype)
    .use(rehypeHighlight, { detect: false })
    .use(rehypeStringify)
    .process(content)

  return { meta, html: String(html) }
}
