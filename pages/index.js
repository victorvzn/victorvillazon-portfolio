import { useState } from 'react'

import Head from 'next/head'
import Image from 'next/image'
import Link from 'next/link'

import Card from '../components/Card'

export default function Home() {
  const  [filter, setFilter] = useState('all')

  const [cards, setCards] = useState([
    {
      id: 1,
      type: 'react',
      image: '/images/personal1.png',
      title: 'victorvillazon.com',
      content: 'Página personal con mi portafolio y proyectos',
      tags: ['React', 'Tailwind CSS', 'Vite', 'Next.js'],
      links: {
        live: 'https://victorvillazon.com',
        repository: 'https://github.com/victorvzn/victorvillazon-portfolio',
      },
    },
    {
      id: 2,
      type: 'react',
      image: '/images/memkards1.png',
      title: 'Memkards',
      content: 'Aplicación para gestionar flashcards con autorización por Github',
      tags: [ 'React', 'Firebase', 'Vercel'],
      links: {
        live: 'https://memkards.vercel.app',
        repository: 'https://gitlab.com/victorvzn/memkards-web'
      },
    },
    {
      id: 6,
      type: 'react',
      image: '/images/phone-book1.png',
      title: 'Challenge: Phone Book',
      content: 'Reto técnico para demostrar conocimientos en react.js',
      tags: ['React', 'Vite', 'Vercel'],
      links: {
        live: 'https://challenge-react-phone-book.vercel.app',
        repository: 'https://github.com/victorvzn/challenge-react-phone-book'
      }
    },
    {
      id: 4,
      type: 'vue',
      image: '/images/invoice-app.png',
      title: 'Challenge: Invoice app',
      content: 'Reto de maquetación desde frontendmentor',
      tags: ['Vue3', 'Vite', 'Pinia'],
      links: {
        live: 'https://invoices-app-vue3.vercel.app',
        repository: 'https://github.com/victorvzn/invoices-app-vue3'
      },
    },
    {
      id: 3,
      type: 'vue',
      image: '/images/pokemon-challenge1.png',
      title: 'Challenge: Pokemon',
      content: 'Reto técnico para administrar pokemons favoritos y uso de modales usando https://pokeapi.co',
      tags: ['Vue2', 'Vuex', 'Axios', 'Cypress', 'Vercel'],
      links: {
        live: 'https://pokemon-challenge-1.vercel.app',
        repository: 'https://github.com/victorvzn/pokemon-challenge-1',
      },
    },
    {
      id: 5,
      type: 'vue',
      image: '/images/vendedores-a-correr-1.png',
      title: 'Challenge: Vendedores',
      content: 'Reto técnico sobre un concurso para los vendedores de una empresa de imágenes usando el api https://api.alegra.com',
      tags: ['Vue2', 'Vuex', 'Axios', 'i18n'],
      links: {
        live: 'https://challenge-vendedores-a-correr.vercel.app',
        repository: 'https://github.com/victorvzn/challenge-vendedores-a-correr'
      }
    }
  ])

  const handleFilter = (value) => setFilter(value)

  return (
    <>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Home - Victor Villazón</title>
        <meta name="description" content="Victor Villazón personal page" />
        <link rel="icon" href="/favicon.ico" />
      </Head> 

      <main className='h-max max-w-6xl mx-auto flex flex-col mt-10 md:mt-24'>
        <div className='flex flex-col md:flex-row'>
          <section className='w-full md:w-2/4 flex flex-col gap-10 order-last md:order-none'>
            <div className='flex flex-col pl-4 text-2xl gap-8 md:border-l-amber-400 md:border-l-8'>
              <div>
                <h2 className='text-5xl font-light'>Hola, soy</h2>
                <h1 className='text-7xl font-black'>Victor Villazón</h1>
              </div>

              <p className='font-ligth'>Desarrollador frontend especializado en Javascript, Vue.js y React.js</p>
      
              <div className='flex flex-col gap-4'>
                <span className='font-bold'>Habilidades tecnológicas:</span>
                
                <ul className='list-disc ml-7'>
                  <li className='mb-4'>
                    <strong>Competente:</strong><br />
                    GNU/Linux, HTML, CSS, Sass, Tailwind CSS, Javascript, ESNext, JWT, RWD, Jest, Cypress, Vue.js, Vuex, Pinia, React.js, Git.
                  </li>
                  <li>
                    <strong>Familiar:</strong><br />
                    Node.js, PHP, Zend Framework, Laravel, Python, Django, Docker, AWS, DO, CI/CD, SQL, PostgreSQL, MySQL.
                  </li>
                </ul>
              </div>

              <p>
                Para más información 😉, visita mi{' '}
                <Link
                  className='text-amber-400 font-semibold hover:duration-100 hover:ease-in-out hover:border-b-4 hover:border-amber-400'
                  href="https://github.com/victorvzn/"
                  target='_blank'>Github</Link>
                {' o '}
                <Link
                  className='text-amber-400 font-semibold hover:duration-100 hover:ease-in-out hover:border-b-4 hover:border-amber-400'
                  href="https://www.linkedin.com/in/victorvzn"
                  target='_blank'>Linkedin</Link>.
              </p>
            </div>
          </section>

          <section className='flex flex-col justify-start items-center w-full md:w-2/4 mb-5 md:items-end'>
            <div className='relative'>
              <Image
                className="rounded-full border-8 border-black border-opacity-10 hover:duration-300 hover:shadow-md"
                src="/me.jpg"
                alt="Victor Villazón Photo"
                width={480} height={480} />
              <div className='flex gap-5 justify-evenly items-center my-5 md:mt-16 md:mb-5 '>
                <svg className='animate-pulse' xmlns="http://www.w3.org/2000/svg" width="48" height="48" preserveAspectRatio="xMidYMid" viewBox="0 -17.5 256 256"><path fill="#41B883" d="M204.8 0H256L128 220.8 0 0h97.92L128 51.2 157.44 0h47.36Z"/><path fill="#41B883" d="m0 0 128 220.8L256 0h-51.2L128 132.48 50.56 0H0Z"/><path fill="#35495E" d="M50.56 0 128 133.12 204.8 0h-47.36L128 51.2 97.92 0H50.56Z"/></svg>
                <svg className='animate-pulse' xmlns="http://www.w3.org/2000/svg" width="48" height="48" preserveAspectRatio="xMidYMid" viewBox="-0.5 0 257 257"><defs><linearGradient id="a" x1="-.828%" x2="57.636%" y1="7.652%" y2="78.411%"><stop offset="0%" stop-color="#41D1FF"/><stop offset="100%" stop-color="#BD34FE"/></linearGradient><linearGradient id="b" x1="43.376%" x2="50.316%" y1="2.242%" y2="89.03%"><stop offset="0%" stop-color="#FFEA83"/><stop offset="8.333%" stop-color="#FFDD35"/><stop offset="100%" stop-color="#FFA800"/></linearGradient></defs><path fill="url(#a)" d="M255.153 37.938 134.897 252.976c-2.483 4.44-8.862 4.466-11.382.048L.875 37.958c-2.746-4.814 1.371-10.646 6.827-9.67l120.385 21.517a6.537 6.537 0 0 0 2.322-.004l117.867-21.483c5.438-.991 9.574 4.796 6.877 9.62Z"/><path fill="url(#b)" d="M185.432.063 96.44 17.501a3.268 3.268 0 0 0-2.634 3.014l-5.474 92.456a3.268 3.268 0 0 0 3.997 3.378l24.777-5.718c2.318-.535 4.413 1.507 3.936 3.838l-7.361 36.047c-.495 2.426 1.782 4.5 4.151 3.78l15.304-4.649c2.372-.72 4.652 1.36 4.15 3.788l-11.698 56.621c-.732 3.542 3.979 5.473 5.943 2.437l1.313-2.028 72.516-144.72c1.215-2.423-.88-5.186-3.54-4.672l-25.505 4.922c-2.396.462-4.435-1.77-3.759-4.114l16.646-57.705c.677-2.35-1.37-4.583-3.769-4.113Z"/></svg>
                <svg className='animate-pulse' xmlns="http://www.w3.org/2000/svg" width="48" height="48" preserveAspectRatio="xMidYMid" viewBox="0 -14 256 256"><path fill="#00D8FF" d="M210.483 73.824a171.49 171.49 0 0 0-8.24-2.597c.465-1.9.893-3.777 1.273-5.621 6.238-30.281 2.16-54.676-11.769-62.708-13.355-7.7-35.196.329-57.254 19.526a171.23 171.23 0 0 0-6.375 5.848 155.866 155.866 0 0 0-4.241-3.917C100.759 3.829 77.587-4.822 63.673 3.233 50.33 10.957 46.379 33.89 51.995 62.588a170.974 170.974 0 0 0 1.892 8.48c-3.28.932-6.445 1.924-9.474 2.98C17.309 83.498 0 98.307 0 113.668c0 15.865 18.582 31.778 46.812 41.427a145.52 145.52 0 0 0 6.921 2.165 167.467 167.467 0 0 0-2.01 9.138c-5.354 28.2-1.173 50.591 12.134 58.266 13.744 7.926 36.812-.22 59.273-19.855a145.567 145.567 0 0 0 5.342-4.923 168.064 168.064 0 0 0 6.92 6.314c21.758 18.722 43.246 26.282 56.54 18.586 13.731-7.949 18.194-32.003 12.4-61.268a145.016 145.016 0 0 0-1.535-6.842c1.62-.48 3.21-.974 4.76-1.488 29.348-9.723 48.443-25.443 48.443-41.52 0-15.417-17.868-30.326-45.517-39.844Zm-6.365 70.984c-1.4.463-2.836.91-4.3 1.345-3.24-10.257-7.612-21.163-12.963-32.432 5.106-11 9.31-21.767 12.459-31.957 2.619.758 5.16 1.557 7.61 2.4 23.69 8.156 38.14 20.213 38.14 29.504 0 9.896-15.606 22.743-40.946 31.14Zm-10.514 20.834c2.562 12.94 2.927 24.64 1.23 33.787-1.524 8.219-4.59 13.698-8.382 15.893-8.067 4.67-25.32-1.4-43.927-17.412a156.726 156.726 0 0 1-6.437-5.87c7.214-7.889 14.423-17.06 21.459-27.246 12.376-1.098 24.068-2.894 34.671-5.345.522 2.107.986 4.173 1.386 6.193ZM87.276 214.515c-7.882 2.783-14.16 2.863-17.955.675-8.075-4.657-11.432-22.636-6.853-46.752a156.923 156.923 0 0 1 1.869-8.499c10.486 2.32 22.093 3.988 34.498 4.994 7.084 9.967 14.501 19.128 21.976 27.15a134.668 134.668 0 0 1-4.877 4.492c-9.933 8.682-19.886 14.842-28.658 17.94ZM50.35 144.747c-12.483-4.267-22.792-9.812-29.858-15.863-6.35-5.437-9.555-10.836-9.555-15.216 0-9.322 13.897-21.212 37.076-29.293 2.813-.98 5.757-1.905 8.812-2.773 3.204 10.42 7.406 21.315 12.477 32.332-5.137 11.18-9.399 22.249-12.634 32.792a134.718 134.718 0 0 1-6.318-1.979Zm12.378-84.26c-4.811-24.587-1.616-43.134 6.425-47.789 8.564-4.958 27.502 2.111 47.463 19.835a144.318 144.318 0 0 1 3.841 3.545c-7.438 7.987-14.787 17.08-21.808 26.988-12.04 1.116-23.565 2.908-34.161 5.309a160.342 160.342 0 0 1-1.76-7.887Zm110.427 27.268a347.8 347.8 0 0 0-7.785-12.803c8.168 1.033 15.994 2.404 23.343 4.08-2.206 7.072-4.956 14.465-8.193 22.045a381.151 381.151 0 0 0-7.365-13.322Zm-45.032-43.861c5.044 5.465 10.096 11.566 15.065 18.186a322.04 322.04 0 0 0-30.257-.006c4.974-6.559 10.069-12.652 15.192-18.18ZM82.802 87.83a323.167 323.167 0 0 0-7.227 13.238c-3.184-7.553-5.909-14.98-8.134-22.152 7.304-1.634 15.093-2.97 23.209-3.984a321.524 321.524 0 0 0-7.848 12.897Zm8.081 65.352c-8.385-.936-16.291-2.203-23.593-3.793 2.26-7.3 5.045-14.885 8.298-22.6a321.187 321.187 0 0 0 7.257 13.246c2.594 4.48 5.28 8.868 8.038 13.147Zm37.542 31.03c-5.184-5.592-10.354-11.779-15.403-18.433 4.902.192 9.899.29 14.978.29 5.218 0 10.376-.117 15.453-.343-4.985 6.774-10.018 12.97-15.028 18.486Zm52.198-57.817c3.422 7.8 6.306 15.345 8.596 22.52-7.422 1.694-15.436 3.058-23.88 4.071a382.417 382.417 0 0 0 7.859-13.026 347.403 347.403 0 0 0 7.425-13.565Zm-16.898 8.101a358.557 358.557 0 0 1-12.281 19.815 329.4 329.4 0 0 1-23.444.823c-7.967 0-15.716-.248-23.178-.732a310.202 310.202 0 0 1-12.513-19.846h.001a307.41 307.41 0 0 1-10.923-20.627 310.278 310.278 0 0 1 10.89-20.637l-.001.001a307.318 307.318 0 0 1 12.413-19.761c7.613-.576 15.42-.876 23.31-.876H128c7.926 0 15.743.303 23.354.883a329.357 329.357 0 0 1 12.335 19.695 358.489 358.489 0 0 1 11.036 20.54 329.472 329.472 0 0 1-11 20.722Zm22.56-122.124c8.572 4.944 11.906 24.881 6.52 51.026-.344 1.668-.73 3.367-1.15 5.09-10.622-2.452-22.155-4.275-34.23-5.408-7.034-10.017-14.323-19.124-21.64-27.008a160.789 160.789 0 0 1 5.888-5.4c18.9-16.447 36.564-22.941 44.612-18.3ZM128 90.808c12.625 0 22.86 10.235 22.86 22.86s-10.235 22.86-22.86 22.86-22.86-10.235-22.86-22.86 10.235-22.86 22.86-22.86Z"/></svg>
              </div>
            </div>
          </section>
        </div>

        <div className='flex flex-col justify-center items-center mt-36'>
          <svg className='mb-1' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><path fill="currentColor" d="M16 2c1.103 0 2 .897 2 2v12c0 3.309-2.691 6-6 6s-6-2.691-6-6V4c0-1.103.897-2 2-2h8zm4 2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v12a8 8 0 0 0 16 0V4zm-7 1a1 1 0 1 0-2 0v4a1 1 0 1 0 2 0V5z"/></svg>
          <svg className='animate-bounce' xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none"><path fill="currentColor" d="M7.757 5.636 6.343 7.05 12 12.707l5.657-5.657-1.414-1.414L12 9.88 7.757 5.636Z"/><path fill="currentColor" d="m6.343 12.707 1.414-1.414L12 15.536l4.243-4.243 1.414 1.414L12 18.364l-5.657-5.657Z"/></svg>
        </div>
      </main>

      <section id="projects" className='h-max max-w-6xl mx-auto pt-32'>
        <div className='flex justify-center flex-col md:flex-row md:justify-between'>
          <h2 className='text-5xl font-light text-amber-400 text-center'>💡 Portafolio</h2>
          <div className='flex justify-center items-center gap-6 pt-10 md:pt-0 md:justify-end'>
            <span
              className={`cursor-pointer  ${filter === 'all' ? 'border-amber-400 border-b-8' : ''} font-semibold hover:duration-200 hover:ease-in-out hover:border-b-8 hover:border-yello-400`}
              onClick={() => handleFilter('all')}>Todos</span>
            <span
              className={`cursor-pointer ${filter === 'react' ? 'border-react border-b-8' : ''} font-semibold hover:duration-200 hover:ease-in-out hover:border-b-8 hover:border-react`}
              onClick={() => handleFilter('react')}>React.js</span>
            <span
              className={`cursor-pointer ${filter === 'vue' ? 'border-vue border-b-8' : ''} font-semibold hover:duration-200 hover:ease-in-out hover:border-b-8 hover:border-vue`}
              onClick={() => handleFilter('vue')}>Vue.js</span>
          </div>
        </div>

        <div className='grid grid-cols-1 gap-8 my-24 md:grid-cols-3'>
          {cards && cards
            .filter(card => filter == 'all' || card.type === filter)
            .map(card => {
              return (
                <Card
                  key={card.id}
                  type={card.type}
                  image={card.image}
                  title={card.title}
                  content={card.content}
                  tags={card.tags}
                  links={card.links}
                />
              )
          })}
        </div>
      </section>
    </>
  )
}
