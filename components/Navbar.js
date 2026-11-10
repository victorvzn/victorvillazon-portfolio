import Logo from '../components/Logo'
import { Link as LinkScroll } from 'react-scroll'
import Link from 'next/link'

const navLinkClass = 'hidden md:block cursor-pointer text-zinc-400 transition-colors hover:text-accent'

const Navbar = () => {
  return (
    <header className='sticky top-0 z-20 border-b border-line bg-space/70 backdrop-blur'>
      <div className='max-w-6xl mx-auto flex justify-between items-center gap-4 px-6 py-4'>
        <Link href="/" aria-label="Inicio - Victor Villazón"><Logo /></Link>
        <nav aria-label="Principal">
          <ul className='flex items-center gap-7 text-sm'>
            <li>
              <LinkScroll className={navLinkClass} to="skills" smooth={true} offset={-72}>Habilidades</LinkScroll>
            </li>
            <li>
              <LinkScroll className={navLinkClass} to="projects" smooth={true} offset={-72}>Proyectos</LinkScroll>
            </li>
            <li>
              <LinkScroll
                className='inline-flex items-center min-h-[36px] px-3.5 rounded-lg border border-zinc-700 text-zinc-50 cursor-pointer transition-colors hover:border-accent hover:text-accent'
                to="contact"
                smooth={true}
                offset={-72}>Contacto</LinkScroll>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

export default Navbar
