import Head from 'next/head'

export default function Blog() {
  return (
    <div>
      <Head>
        <title>Blog - Victor Villazón</title>
        <meta name="description" content="Victor Villazón personal page" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header>
        <a href="#hero">
          <span>{'{vv}'}</span>
        </a>
      </header>

      <main>
        <h1 className='text-3xl font-bold underline'>Blog</h1>
      </main>
    </div>
  )
}
