// Fondo animado tipo universo: nebulosas, estrellas que parpadean y estrellas fugaces.
// Las estrellas se generan con un PRNG con semilla fija para que el HTML del
// servidor y el del cliente coincidan (sin errores de hidratación).

const SKY_SIZE = 2600

function starField(count, size, color, seed) {
  let s = seed
  const random = () => {
    s = (s * 16807) % 2147483647
    return s / 2147483647
  }
  const points = []
  for (let i = 0; i < count; i++) {
    points.push(`${Math.round(random() * SKY_SIZE)}px ${Math.round(random() * SKY_SIZE)}px ${color}`)
  }
  return { width: size, height: size, boxShadow: points.join(', ') }
}

const smallStars = starField(500, 1, 'rgba(255,255,255,0.8)', 7)
const brightStars = starField(180, 2, 'rgba(199,210,254,0.9)', 41)
const faintStars = starField(260, 1, 'rgba(255,255,255,0.4)', 97)

const shootingStars = [
  { top: '12%', left: '82%', delay: '1s' },
  { top: '6%', left: '55%', delay: '5s' },
  { top: '24%', left: '98%', delay: '8.5s' },
]

const StarField = () => {
  return (
    <div aria-hidden="true" className='pointer-events-none fixed inset-0 z-0 overflow-hidden bg-space'>
      <div className='nebula-a absolute -left-[10%] -top-[20%] h-[90%] w-[70%] rounded-full bg-[radial-gradient(closest-side,rgba(109,40,217,0.28),transparent)] blur-[40px]' />
      <div className='nebula-b absolute -right-[15%] top-[10%] h-[85%] w-[65%] rounded-full bg-[radial-gradient(closest-side,rgba(29,78,216,0.24),transparent)] blur-[50px]' />
      <div className='nebula-a absolute -bottom-[30%] left-[35%] h-[60%] w-[45%] rounded-full bg-[radial-gradient(closest-side,rgba(251,191,36,0.10),transparent)] blur-[60px]' />

      <div className='sky'>
        <div className='star twinkle-a' style={smallStars} />
        <div className='star twinkle-b' style={brightStars} />
        <div className='star' style={faintStars} />
      </div>

      {shootingStars.map(star => (
        <span
          key={star.delay}
          className='shooting-star'
          style={{ top: star.top, left: star.left, animationDelay: star.delay }}
        />
      ))}
    </div>
  )
}

export default StarField
