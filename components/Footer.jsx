const Footer = () => {
  return (
    <footer className='border-t border-line'>
      <div className='max-w-6xl mx-auto flex flex-wrap justify-between gap-4 px-6 py-7 text-sm text-zinc-400'>
        <span>© {new Date().getFullYear()} Victor Villazón</span>
        <div className='flex gap-5'>
          <a href="https://github.com/victorvzn/" target='_blank' rel='noreferrer' className='hover:text-accent transition-colors'>GitHub</a>
          <a href="https://www.linkedin.com/in/victorvzn" target='_blank' rel='noreferrer' className='hover:text-accent transition-colors'>LinkedIn</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
