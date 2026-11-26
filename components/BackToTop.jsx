import { useEffect, useState } from 'react'

// Botón flotante "volver arriba": aparece cuando el usuario ya bajó un buen trozo de la página
const SHOW_AFTER = 600

export default function BackToTop({ label }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let frame = null
    const update = () => {
      frame = null
      setVisible(window.scrollY > SHOW_AFTER)
    }
    const onScroll = () => {
      if (frame === null) frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [])

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    // 'instant' y no 'auto': con 'auto' manda el scroll-behavior: smooth de globals.css
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'instant' : 'smooth' })
  }

  if (!visible) return null

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={label}
      title={label}
      className='fixed bottom-6 right-6 z-20 flex h-12 w-12 items-center justify-center rounded-full border border-zinc-700 bg-raised text-zinc-50 shadow-lg shadow-black/40 transition-colors hover:border-accent hover:text-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent md:bottom-8 md:right-8'>
      <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 19V5" /><path d="M6 11l6-6 6 6" /></svg>
    </button>
  )
}
