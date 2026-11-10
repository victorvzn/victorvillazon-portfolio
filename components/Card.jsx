import Image from 'next/image'

const TYPES = {
  default: { label: 'Proyecto', dot: 'bg-accent' },
  react: { label: 'React', dot: 'bg-react' },
  vue: { label: 'Vue', dot: 'bg-vue' },
  'next.js': { label: 'Next.js', dot: 'bg-next' },
}

const linkClass = 'inline-flex items-center gap-1.5 min-h-[44px] px-3 text-sm font-medium transition-colors hover:text-accent'

const Card = ({
  image,
  title = 'Default title',
  content = 'Default content',
  links = {},
  tags = [],
  type = 'default',
  isVip = false,
  isLive = false,
  collaborators = []
}) => {
  // Un tipo desconocido cae en 'default' en lugar de romper el render
  const { label, dot } = TYPES[type] ?? TYPES.default
  const mainHref = links.live || links.repository

  const preview = (
    <>
      {image
        ? <Image
            className='h-full w-full object-cover'
            src={image}
            alt={`Captura de ${title}`}
            width={700}
            height={394}
          />
        : <div className='flex h-full w-full items-center justify-center p-6 text-center font-mono text-sm text-zinc-400'>{title}</div>
      }
      {(isVip || isLive) &&
        <div className='absolute left-3 top-3 flex flex-wrap gap-2'>
          {isVip &&
            <span className='rounded-full border border-zinc-700 bg-ink px-2.5 py-1 text-xs font-medium text-accent'>Destacado</span>
          }
          {isLive &&
            <span className='inline-flex items-center gap-1.5 rounded-full border border-zinc-700 bg-ink px-2.5 py-1 text-xs font-medium text-green-400'>
              <span className='h-1.5 w-1.5 rounded-full bg-green-400' aria-hidden="true"></span>
              En producción
            </span>
          }
        </div>
      }
    </>
  )

  const previewClass = 'relative block aspect-video border-b border-line bg-raised'

  return (
    <article className='flex flex-col overflow-hidden rounded-2xl border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-zinc-600'>
      {mainHref
        ? <a href={mainHref} target='_blank' rel='noreferrer' className={previewClass}>{preview}</a>
        : <div className={previewClass}>{preview}</div>
      }

      <div className='flex flex-1 flex-col gap-3 p-5'>
        <div className='flex items-center gap-2 font-mono text-xs text-zinc-400'>
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true"></span>
          {label}
        </div>
        <h3 className='text-lg font-semibold tracking-tight'>{title}</h3>
        <p className='flex-1 text-sm leading-relaxed text-zinc-400'>{content}</p>

        {collaborators.length > 0 &&
          <p className='text-sm text-zinc-400'>
            <span className='font-medium text-zinc-200'>Colaboradores: </span>
            {collaborators.map((collaborator, index) => (
              <span key={collaborator.link}>
                {index > 0 && ', '}
                <a href={collaborator.link} target='_blank' rel='noreferrer' className='underline underline-offset-2 hover:text-accent'>{collaborator.name}</a>
              </span>
            ))}
          </p>
        }

        <ul className='flex flex-wrap gap-1.5' aria-label="Tecnologías">
          {tags.map(tag => (
            <li key={tag} className='rounded-md bg-[#1f1f23] px-2 py-0.5 text-xs text-zinc-300'>{tag}</li>
          ))}
        </ul>

        {(links.live || links.repository || links.figma) &&
          <div className='mt-1 flex gap-2 border-t border-line pt-2'>
            {links.live &&
              <a href={links.live} target='_blank' rel='noreferrer' className={`${linkClass} text-zinc-50`}>
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 3h7v7M10 14 21 3M21 14v7H3V3h7" /></svg>
                Demo
              </a>
            }
            {links.repository &&
              <a href={links.repository} target='_blank' rel='noreferrer' className={`${linkClass} text-zinc-400`}>
                <svg aria-hidden="true" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m16 18 6-6-6-6M8 6l-6 6 6 6" /></svg>
                Código
              </a>
            }
            {links.figma &&
              <a href={links.figma} target='_blank' rel='noreferrer' className={`${linkClass} text-zinc-400`}>Figma</a>
            }
          </div>
        }
      </div>
    </article>
  )
}

export default Card
