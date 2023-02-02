import Head from 'next/head'

export default function Blog() {
  return (
    <div>
      <Head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Blog - Victor Villazón</title>
        <meta name="description" content="Blog - Victor Villazón personal page" />
        <link rel="icon" href="/favicon.ico" />
      </Head> 

      <main className='h-max max-w-6xl mx-auto flex flex-col mt-10 md:mt-8'>
        <div className='flex flex-col md:flex-row'>
          <section className='w-full md:w-2/4 flex flex-col gap-10 order-last md:order-none'>
            <div className='flex flex-col pl-4 gap-8 md:border-l-amber-400 md:border-l-8 '>
        
              <h1 className='text-3xl font-bold underline'>Blog</h1>
        
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}
