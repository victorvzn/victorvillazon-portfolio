import Image from 'next/image'
import Link from 'next/link'

const Card = ({
  image = '/320x240.png',
  title = 'Default title',
  content = 'Default content',
  links = { live: '', repository: '', figma: '' },
  tags = ['JS', 'Jest'],
  type = 'default',
  isVip = false,
  collaborators = []
}) => {
  const types = {
    'default': ['border-amber-400', 'bg-amber-400'],
    'react': ['border-react', 'bg-react'],
    'vue': ['border-vue', 'bg-vue'],
  }
  const [ borderClass, bgClass ] = types[type]
  return (
    <article className={`flex flex-col border-8 rounded-lg ${borderClass} hover:duration-300 hover:shadow-md hover:scale-110-off duration-300 transition-all`}>
    
    <div className='flex-none w-auto h-60 relative'>
        {isVip && 
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-star  text-amber-400 fill-amber-400 absolute top-1 left-1 z-10" viewBox="0 0 24 24"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
        }
        <Link href={links.live} target='_blank' className='text-white'>
          <Image
            className='inset-0 w-full h-full object-cover'
            src={image}
            alt="Proyecto foto"
            width={700}
            height={240}
            priority={true}
          />
        </Link>
      </div>
      <div className={`flex-auto p-4 ${bgClass}`}>
        <div className="flex flex-col">
          <div className='flex justify-between items-center gap-5'>
            <div className="flex-auto text-2xl font-semibold text-slate-900">
              <span>{title}</span>
            </div>
            <div className='flex justify-between gap-3 text-lg font-semibold text-slate-600'>
            { links?.live &&
              <Link href={links.live} target='_blank' className='text-white'>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
                  <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 105.656 5.656l3-3a4 4 0 00-.225-5.865z" />
                </svg>
              </Link>
              }
              { links?.repository &&
                <Link href={links.repository} target='_blank' alt="Github">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} style={{fill:'#fff'}}><path fillRule="evenodd" d="M12.026 2c-5.509 0-9.974 4.465-9.974 9.974 0 4.406 2.857 8.145 6.821 9.465.499.09.679-.217.679-.481 0-.237-.008-.865-.011-1.696-2.775.602-3.361-1.338-3.361-1.338-.452-1.152-1.107-1.459-1.107-1.459-.905-.619.069-.605.069-.605 1.002.07 1.527 1.028 1.527 1.028.89 1.524 2.336 1.084 2.902.829.091-.645.351-1.085.635-1.334-2.214-.251-4.542-1.107-4.542-4.93 0-1.087.389-1.979 1.024-2.675-.101-.253-.446-1.268.099-2.64 0 0 .837-.269 2.742 1.021a9.582 9.582 0 0 1 2.496-.336 9.554 9.554 0 0 1 2.496.336c1.906-1.291 2.742-1.021 2.742-1.021.545 1.372.203 2.387.099 2.64.64.696 1.024 1.587 1.024 2.675 0 3.833-2.33 4.675-4.552 4.922.355.308.675.916.675 1.846 0 1.334-.012 2.41-.012 2.737 0 .267.178.577.687.479C19.146 20.115 22 16.379 22 11.974 22 6.465 17.535 2 12.026 2z" clipRule="evenodd"/></svg>
                </Link>
              }
              { links?.figma && 
                <Link href={links.figma} target='_blank' alt="Figma">
                  <svg xmlns="http://www.w3.org/2000/svg" width={24} height={24} style={{fill:'#fff'}} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="feather feather-figma"><path d="M5 5.5A3.5 3.5 0 0 1 8.5 2H12v7H8.5A3.5 3.5 0 0 1 5 5.5zM12 2h3.5a3.5 3.5 0 1 1 0 7H12V2z"/><path d="M12 12.5a3.5 3.5 0 1 1 7 0 3.5 3.5 0 1 1-7 0zM5 19.5A3.5 3.5 0 0 1 8.5 16H12v3.5a3.5 3.5 0 1 1-7 0zM5 12.5A3.5 3.5 0 0 1 8.5 9H12v7H8.5A3.5 3.5 0 0 1 5 12.5z"/></svg>
                </Link>
              }
            </div>
          </div>
          <div className="text-md font-semibold text-slate-600">{tags.join(', ')}</div>
          <div className="w-full flex flex-col text-md font-medium text-slate-700 mt-2">
            {content}
            {collaborators.length > 0 &&
              <div className='mt-4'>
                <strong className='font-semibold text-slate-900 mr-1'>Colaboradores:</strong>

                {collaborators.map(collaborator => <a key={collaborator.link} href={collaborator.link} target='_blank' className='underline underline-offset-2'>{collaborator.name}</a> )}
              </div>
            }
          </div>
        </div>
      </div>
    </article>
  )
}

export default Card