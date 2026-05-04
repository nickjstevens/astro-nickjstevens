# nickjstevens.com

Personal website for Nick J Stevens, built with [Astro](https://astro.build/). The site is a self-owned publishing home for long-form articles, family adventure journals, engineering notes, and small interactive projects such as Priced In and the AI Tool Map.

## What is in here

- **Articles** — Markdown/MDX writing in `src/content/blog/`, published under `/blog/`.
- **Categories** — generated article tag/category pages under `/blog/tags/` and `/blog/tag/[tag]/`.
- **Adventures** — family travel journals in `src/content/adventures/`, with optimised media in `public/adventures/assets/`.
- **Priced In** — static interactive cost-of-living pages under `public/priced-in/`.
- **FEA, AI Tool Map, About, Now** — standalone Astro pages under `src/pages/`.

The site uses Astro content collections, RSS, sitemap generation, MDX support, and Sharp for image processing.

## Project structure

```text
.
├── public/                  # Static assets and generated adventure media
│   ├── adventures/assets/   # Optimised travel images/videos
│   └── priced-in/           # Static Priced In app pages
├── scripts/                 # Import/migration helpers
├── src/
│   ├── components/          # Shared Astro components
│   ├── content/             # Articles and adventures content collections
│   ├── layouts/             # Page and post layouts
│   ├── pages/               # Astro routes
│   └── styles/              # Global CSS
├── astro.config.mjs
├── DESIGN.md
├── PRODUCT.md
└── package.json
```

## Development

Install dependencies:

```sh
npm install
```

Start the local development server:

```sh
npm run dev
```

Build the production site:

```sh
npm run build
```

Preview the built site locally:

```sh
npm run preview
```

## Content workflows

### Articles

Articles live in `src/content/blog/`. Each post uses frontmatter for title, description, publication date, tags/categories, and layout metadata.

### Adventures

Adventure content is generated from the source travel archive using:

```sh
node scripts/migrate-adventures.mjs
npm run build
```

The migration script regenerates `src/content/adventures/`, copies and optimises media into `public/adventures/assets/`, assigns cover images, and cleans common Notion/Obsidian import artefacts.

After regenerating adventures, check:

```sh
rm -rf .astro
npm run build
git diff --check
```

## Deployment

Changes are committed to `master` and pushed to the `origin` GitHub remote. The production deployment is expected to build from the committed Astro project.

## Credits

The original site started from Astro's blog starter and the Bear Blog-inspired default styling, but has since been customised for Nick's personal site and projects.
