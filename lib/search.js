// Búsqueda de posts en el cliente: sin acentos ni mayúsculas, todas las palabras deben aparecer,
// y los resultados se ordenan por dónde aparecen (título > etiquetas > serie > descripción).

export const normalize = (text) => String(text ?? '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/\p{Diacritic}/gu, '')

const FIELD_WEIGHTS = { title: 4, tags: 3, series: 2, description: 1 }

// Se calcula una sola vez por lista de posts (useMemo en la página)
export const buildIndex = (posts, seriesNames = {}) => posts.map(post => ({
  post,
  fields: {
    title: normalize(post.title),
    tags: normalize(post.tags.join(' ')),
    series: normalize(seriesNames[post.series] ?? post.series),
    description: normalize(post.description)
  }
}))

export const searchPosts = (index, query) => {
  const terms = normalize(query).split(/\s+/).filter(Boolean)
  if (terms.length === 0) return index.map(entry => entry.post)

  return index
    .map(({ post, fields }) => {
      let score = 0
      for (const term of terms) {
        let termScore = 0
        for (const [field, weight] of Object.entries(FIELD_WEIGHTS)) {
          if (fields[field].includes(term)) termScore += weight
        }
        if (termScore === 0) return null // todas las palabras deben aparecer
        score += termScore
      }
      return { post, score }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score || (a.post.date < b.post.date ? 1 : -1))
    .map(result => result.post)
}
