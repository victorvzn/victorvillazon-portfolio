import Logo from '../components/Logo'
import { Link as LinkScroll } from 'react-scroll'
import Link from 'next/link'
import { useRouter } from 'next/router'

import { useLocale, useT } from '../locales'

const navLinkClass = 'hidden md:block cursor-pointer text-zinc-400 transition-colors hover:text-accent'

const LANGUAGES = [
  { value: 'es', label: 'ES' },
  { value: 'en', label: 'EN' }
]

const Navbar = () => {
  const router = useRouter()
  const locale = useLocale()
  const t = useT()

  const changeLanguage = (nextLocale) => {
    // proxy.js lee esta cookie: la elección manual gana sobre la geolocalización
    document.cookie = `NEXT_LOCALE=${nextLocale}; path=/; max-age=31536000; samesite=lax`
    router.push({ pathname: router.pathname, query: router.query }, router.asPath, { locale: nextLocale, scroll: false })
  }

  return (
    <header className='sticky top-0 z-20 border-b border-line bg-space/70 backdrop-blur'>
      <div className='max-w-6xl mx-auto flex justify-between items-center gap-4 px-6 py-4'>
        <Link href="/" aria-label={t.nav.home}><Logo /></Link>
        <nav aria-label={t.nav.main}>
          <ul className='flex items-center gap-7 text-sm'>
            <li>
              <LinkScroll className={navLinkClass} to="skills" smooth={true} offset={-72}>{t.nav.skills}</LinkScroll>
            </li>
            <li>
              <LinkScroll className={navLinkClass} to="projects" smooth={true} offset={-72}>{t.nav.projects}</LinkScroll>
            </li>
            <li>
              <LinkScroll
                className='inline-flex items-center min-h-[36px] px-3.5 rounded-lg border border-zinc-700 text-zinc-50 cursor-pointer transition-colors hover:border-accent hover:text-accent'
                to="contact"
                smooth={true}
                offset={-72}>{t.nav.contact}</LinkScroll>
            </li>
            <li>
              <div role="group" aria-label={t.nav.language} className='flex gap-0.5 rounded-lg border border-line bg-raised p-0.5'>
                {LANGUAGES.map(({ value, label }) => (
                  <button
                    key={value}
                    type="button"
                    lang={value}
                    aria-pressed={locale === value}
                    onClick={() => locale !== value && changeLanguage(value)}
                    className={`min-h-[30px] rounded-md px-2 font-mono text-xs font-medium transition-colors ${locale === value ? 'bg-zinc-50 text-ink' : 'text-zinc-400 hover:text-zinc-50'}`}>
                    {label}
                  </button>
                ))}
              </div>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
