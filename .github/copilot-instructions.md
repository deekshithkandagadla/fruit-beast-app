# Copilot Instructions for fruit-beast-app

## Project Overview
- **Framework:** React (with Vite)
- **Styling:** Tailwind CSS (see `tailwind.config.js`, `postcss.config.js`)
- **Linting:** ESLint (see `eslint.config.js`)
- **Build Tool:** Vite (see `vite.config.js`)
- **Firebase Integration:** Configured via `firebase.json`

## Key Files & Structure
- `src/` — Main source code
  - `App.jsx` — Root React component
  - `main.jsx` — Entry point, renders `App`
  - `assets/` — Static assets (SVGs, images)
  - `App.css`, `index.css` — App-level and global styles
- `public/` — Static files served as-is
- `index.html` — Main HTML template

## Developer Workflows
- **Install dependencies:** `npm install`
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Preview production build:** `npm run preview`
- **Lint:** `npm run lint`

## Patterns & Conventions
- Use functional React components and hooks (no class components)
- Use Tailwind utility classes for styling; avoid custom CSS unless necessary
- Keep all React components in `src/` (no `components/` folder by default)
- Asset imports use relative paths from `src/assets/`
- No TypeScript or test setup by default (add if needed)

## Integration Points
- **Firebase:** Project is set up for Firebase hosting; see `firebase.json` for rewrites and hosting config
- **Vite Plugins:** Uses official React plugin for HMR and fast refresh

## Examples
- To add a new page/component: create a `.jsx` file in `src/`, import and use it in `App.jsx`
- To add a new asset: place it in `src/assets/` and import using `import img from './assets/foo.svg'`
- To update Tailwind config: edit `tailwind.config.js` and restart dev server

## References
- See `README.md` for Vite/React basics
- See config files at project root for build/lint/styling setup

---

**For AI agents:**
- Follow the above conventions for new code
- Prefer minimal, idiomatic React + Tailwind patterns
- Reference existing files for import and usage patterns
- If adding new workflows or tools, update this file and `README.md`
