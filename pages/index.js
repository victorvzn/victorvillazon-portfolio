import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'
import styles from '../styles/Home.module.css'

import Logo from '../components/Logo'

export default function Home() {
  return (
    <div className='h-screen bg-gray-600 text-slate-50 overflow-y-auto'>
      <Head>
        <title>Victor Villazón</title>
        <meta name="description" content="Victor Villazón personal page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className='sticky top-0 backdrop-blur-sm bg-slate/10'>
        <div  className='max-w-6xl mx-auto flex justify-between items-center py-4'>
          <a href="#hero"><Logo /></a>
          <nav className=''>
            <ul className='flex justify-center gap-10'>
              <li>
                <Link
                  className="hover:duration-100 hover:ease-in-out hover:border-b-4 hover:border-yellow-500"
                  href="#projects"
                  target='_blank'>Projects</Link>
              </li>
              <li>
                <Link
                  className="hover:duration-100 hover:ease-in-out hover:border-b-4 hover:border-yellow-500"
                  href="/blog"
                  target='_blank'>Blog</Link>
              </li>
              <li>
                <Link href="https://github.com/victorvzn">
                <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} style={{fill:'#fff'}}><path fill-rule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z" clip-rule="evenodd"/></svg>
                </Link>
              </li>
              <li>
                <Link href="https://www.linkedin.com/in/victorvzn">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" style={{fill:'#fff'}}><path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM8.339 18.337H5.667v-8.59h2.672v8.59zM7.003 8.574a1.548 1.548 0 1 1 0-3.096 1.548 1.548 0 0 1 0 3.096zm11.335 9.763h-2.669V14.16c0-.996-.018-2.277-1.388-2.277-1.39 0-1.601 1.086-1.601 2.207v4.248h-2.667v-8.59h2.56v1.174h.037c.355-.675 1.227-1.387 2.524-1.387 2.704 0 3.203 1.778 3.203 4.092v4.71z"/></svg>
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </header>

      <main className='max-w-6xl mx-auto flex mt-24'>
        <section className='w-full md:w-2/4 flex flex-col gap-10'>

          <div className='flex flex-col border-l-yellow-500 border-l-8 pl-4 text-2xl gap-8'>
            <div>
              <h1 className='text-5xl font-light'>Hola, soy</h1>
              <h2 className='text-7xl font-black'>Victor Villazón</h2>
            </div>

            <p className='font-ligth'>Desarrollador frontend especializado en Javascript, Vue.js y React.js</p>
    
            <div className='flex flex-col gap-4'>
              <span className='font-bold'>Habilidades tecnológicas:</span>
              
              <ul className='list-disc ml-7'>
                <li className='mb-4'>
                  <strong>Competente:</strong><br />
                  GNU/Linux, HTML, CSS, Javascript, ESNext, JWT, RWD, Jest, Cypress, Vue.js, React.js, Git.
                </li>
                <li>
                  <strong>Familiar:</strong><br />
                  Node.js, PHP, Zend Framework, Laravel, Python, Django, Docker, AWS, DO, CI/CD, SQL, PostgreSQL, MySQL.
                </li>
              </ul>
            </div>

            <p>
              Para más información, visita mi{' '}
              <Link
                className='text-yellow-500 font-semibold hover:duration-100 hover:ease-in-out hover:border-b-4 hover:border-yellow-500'
                href="https://github.com/victorvzn/"
                target='_blank'>Github</Link>
              {' o '}
              <Link
                className='text-yellow-500 font-semibold hover:duration-100 hover:ease-in-out hover:border-b-4 hover:border-yellow-500'
                href="https://www.linkedin.com/in/victorvzn"
                target='_blank'>Linkedin</Link>.
            </p>
          </div>
        </section>

        <section className='flex flex-col justify-center items-end w-full md:w-2/4'>
          <div>
            <Image
              className="rounded-full border-8 border-black border-opacity-10 hover:duration-300 hover:shadow-md"
              src="/me.jpg"
              alt="Victor Villazón Photo"
              width={480} height={480} />
            <div className='flex justify-center items-center'>
            </div>
            </div>
        </section>
      </main>

      <main className='max-w-6xl mx-auto mt-24'>

      </main>

      <footer className='max-w-6xl mx-auto flex mt-24 justify-center items-center'>
        Made with love by victorvzn at 2022 - Victor Villazón
      </footer>
    </div>
  )
}
// rounded-full border-8 border-black border-opacity-10 shadow-md w-64 md:w-10/12