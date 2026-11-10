import { useRouter } from 'next/router'

import es from './es'
import en from './en'

const dictionaries = { es, en }

// Idioma activo según la URL (/ = es, /en = en)
export const useLocale = () => {
  const { locale } = useRouter()
  return dictionaries[locale] ? locale : 'es'
}

// Textos de la interfaz en el idioma activo
export const useT = () => dictionaries[useLocale()]
