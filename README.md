# Simple Whiteboard

A lightweight whiteboard built with React, TypeScript, Vite, and Tailwind CSS. Draw on a canvas, use the toolbar for tools/colors, undo/redo edits, and export your drawing.

## Tech stack

- React 18 + TypeScript
- Vite 6
- Tailwind CSS
- Radix UI + lucide-react icons

## Prerequisites

- Node.js 18 or newer
- pnpm 8+ (we installed pnpm globally; v10 works fine)

## Setup

```powershell
# Install dependencies
pnpm install

# pnpm v10+: approve build scripts (for esbuild binary)
pnpm approve-builds
# Select the prompted packages (press Space, then Enter)
```

## Run locally

```powershell
pnpm dev
```

- Open http://localhost:5173 in your browser.

## Build and preview

```powershell
# Production build
pnpm build

# Preview the built app
pnpm preview
```

The production bundle is emitted to `dist/`.

## Available scripts

- `pnpm dev` — starts Vite dev server
- `pnpm build` — type-checks and builds for production
- `pnpm preview` — serves the build from `dist/`
- `pnpm lint` — runs ESLint over the repo

Note: some scripts pre-run `pnpm install --prefer-offline` to ensure local dependencies are present.

## Troubleshooting

- If you see Vite errors about missing `/assets/index-*.js` in dev, ensure `index.html` uses the dev entry:

  ```html
  <script type="module" src="/src/main.tsx"></script>
  ```

- pnpm shows “Ignored build scripts: esbuild” on fresh installs. Run `pnpm approve-builds` and approve `esbuild`.

- Browserslist data may be out of date. It’s safe to refresh occasionally:

  ```powershell
  npx update-browserslist-db@latest
  ```

## Project structure

- `src/components` — UI components (Canvas, Toolbar, ErrorBoundary)
- `src/hooks` — drawing history, export, and mobile helpers
- `src/lib` — shared utilities
- `src/types` — canvas-related types

## License

MIT
