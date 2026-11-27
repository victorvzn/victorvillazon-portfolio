This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

## Publicación automática del blog

Cada día a las 8:00 (hora de Lima) el workflow `.github/workflows/publicar-borradores.yml` publica los siguientes 8 borradores (`draft: true` → `draft: false`, con la fecha del día), hace commit en `main` y Vercel despliega. Para cambiar cuántos salen al día, edita `POSTS_POR_DIA` al principio del workflow. El orden lo decide `scripts/publicar-borradores.mjs`: alterna series y sigue el orden de lectura de `lib/blogStructure.js`.

| Quiero… | Cómo |
| --- | --- |
| Ver qué saldrá mañana | `node scripts/publicar-borradores.mjs --simular` |
| Pausarlo | Actions → "Publicar borradores" → **Disable workflow**, o `gh workflow disable publicar-borradores.yml`, o la variable de repositorio `PUBLICACION_ACTIVA=false` |
| Reactivarlo | **Enable workflow** o `gh workflow enable publicar-borradores.yml` (sigue donde iba) |
| Publicar ahora / más un día concreto | Actions → **Run workflow** con la cantidad |
| Que un post no salga todavía | Ponerle `draft: hold` |
| Deshacer una publicación | `git revert` del commit del bot |
| Quitarlo | Borrar el workflow y el script |

Cuando no quedan borradores, el workflow se desactiva solo. Haz `git pull` antes de trabajar en local: el bot hace commits en `main`.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
