import { ImageResponse } from 'next/og'

// Imagen de 1200x630 para compartir en LinkedIn, X, WhatsApp, etc.
// Uso: /api/og?title=...&subtitle=...
const MAX_TITLE = 110
const MAX_SUBTITLE = 60

const param = (value, fallback, max) => String(Array.isArray(value) ? value[0] : value || fallback).slice(0, max)

export default async function handler(req, res) {
  const title = param(req.query.title, 'Victor Villazón', MAX_TITLE)
  const subtitle = param(req.query.subtitle, 'Senior Frontend Developer', MAX_SUBTITLE)

  const image = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'radial-gradient(circle at 85% 10%, #2e1065 0%, #05050a 55%)',
          color: '#fafafa'
        }}>
        <div style={{ display: 'flex', fontSize: 28, letterSpacing: 2, color: '#fbbf24' }}>
          {subtitle.toUpperCase()}
        </div>
        <div style={{ display: 'flex', fontSize: title.length > 60 ? 60 : 76, fontWeight: 700, lineHeight: 1.1 }}>
          {title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 28, color: '#a1a1aa' }}>
          <span>Victor Villazón</span>
          <span>victorvillazon.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )

  res.setHeader('Content-Type', 'image/png')
  res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable')
  res.send(Buffer.from(await image.arrayBuffer()))
}
