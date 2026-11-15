# portfolio

Personal site for **Sebastián Uribe** — backend & systems engineer.

The page is built around Ágora: an interactive service map rendered from the same
architecture it describes. Hover, tab or tap a node to highlight real dependency
edges; the ambient cyan pulse traces the auth path.

- Next.js 16 (App Router) + React 19 + TypeScript
- Plain CSS Modules, no UI or animation libraries
- Canvas 2D contour field with a pointer-driven gravity well, masked and reduced-motion safe
- Static, single route, no analytics

## Run

```bash
pnpm install
pnpm dev     # http://localhost:3000
pnpm build
```

Set `NEXT_PUBLIC_SITE_URL` when deploying so the OG image resolves to the real
origin (defaults to the Vercel preview domain in `app/layout.tsx`).

## Structure

```
app/            layout, metadata, tokens, icons
components/     QuietInstrument (page), ArchitectureMap (SVG), ContourField (canvas)
lib/content.ts  service nodes, coordinates, capabilities, links
```

The map is the only portfolio piece shown on purpose. Everything it draws ships in
[agora-core](https://github.com/JuanseMeh/agora-core).

## Links

- GitHub — [@JuanseMeh](https://github.com/JuanseMeh)
- LinkedIn — [juansemeh](https://www.linkedin.com/in/juansemeh)
- Email — juansebastianuribelesmes@gmail.com
