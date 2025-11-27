# Downloaded File Structure

When you download the files from the Management UI, you'll get a ZIP archive containing the following structure:

```
sikh_areas_map/
│
├── client/                          # Frontend React application
│   ├── public/
│   │   ├── .gitkeep
│   │   └── gurdwara_data.json       # ⭐ Map data (cities & gurdwaras)
│   │
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx             # ⭐ Main map page component
│   │   │   ├── Home.test.tsx        # Data validation tests
│   │   │   └── NotFound.tsx         # 404 page
│   │   │
│   │   ├── components/
│   │   │   ├── Map.tsx              # ⭐ Google Maps integration
│   │   │   ├── ErrorBoundary.tsx
│   │   │   ├── ManusDialog.tsx
│   │   │   └── ui/                  # shadcn/ui components
│   │   │       ├── card.tsx
│   │   │       ├── badge.tsx
│   │   │       ├── input.tsx
│   │   │       ├── tabs.tsx
│   │   │       └── ... (40+ UI components)
│   │   │
│   │   ├── contexts/
│   │   │   └── ThemeContext.tsx     # Dark/light theme provider
│   │   │
│   │   ├── hooks/
│   │   │   ├── usePersistFn.ts
│   │   │   ├── useComposition.ts
│   │   │   └── useMobile.tsx
│   │   │
│   │   ├── lib/
│   │   │   └── utils.ts             # Utility functions
│   │   │
│   │   ├── App.tsx                  # ⭐ Main app routing & theme setup
│   │   ├── main.tsx                 # React entry point
│   │   ├── index.css                # ⭐ Global styles & Tailwind
│   │   └── const.ts                 # App constants
│   │
│   └── index.html                   # HTML entry point
│
├── server/                          # Placeholder (not used in static build)
│   └── (empty)
│
├── shared/                          # Placeholder (not used in static build)
│   └── (empty)
│
├── patches/                         # NPM package patches
│   └── (internal patches)
│
├── .gitignore                       # Git ignore rules
├── .prettierrc                      # Code formatting config
├── .prettierignore
├── components.json                  # shadcn/ui config
├── package.json                     # ⭐ Dependencies & scripts
├── pnpm-lock.yaml                   # Locked dependency versions
├── tsconfig.json                    # TypeScript config
├── tsconfig.node.json
├── vite.config.ts                   # ⭐ Build config
├── tailwind.config.ts               # ⭐ Tailwind CSS config
│
├── gurdwara_data.json               # Copy of map data (root level)
├── LOCAL_SETUP.md                   # Setup instructions
├── FILE_STRUCTURE.md                # This file
├── todo.md                          # Project task list
│
└── dist/                            # (Generated after `pnpm build`)
    ├── index.html
    ├── assets/
    │   ├── index-*.js
    │   └── index-*.css
    └── gurdwara_data.json

```

## Key Files to Know

### Essential Files (You'll interact with these)

| File | Purpose |
|------|---------|
| `client/src/pages/Home.tsx` | Main map page - edit here to change layout/features |
| `client/public/gurdwara_data.json` | Map data - edit to add/remove cities or gurdwaras |
| `package.json` | Dependencies and build scripts |
| `vite.config.ts` | Build configuration |
| `tailwind.config.ts` | Tailwind CSS customization |
| `client/src/index.css` | Global styles and theme variables |

### Important Directories

| Directory | Purpose |
|-----------|---------|
| `client/src/components/ui/` | Pre-built UI components (Card, Badge, Input, etc.) |
| `client/src/components/` | Custom components (Map, ErrorBoundary) |
| `client/public/` | Static assets served as-is |
| `dist/` | Production build output (created after `pnpm build`) |

## What You DON'T Need to Download

When downloading, you can safely ignore:

- `node_modules/` - Generated after `pnpm install`
- `dist/` - Generated after `pnpm build`
- `.git/` - Version control (unless you want git history)
- `pnpm-lock.yaml` - Regenerated after `pnpm install`

## Setup After Download

1. **Extract the ZIP** to your desired location
2. **Open terminal** in the `sikh_areas_map/` directory
3. **Run**: `pnpm install` (installs all dependencies)
4. **Run**: `pnpm dev` (starts development server)
5. **Open**: `http://localhost:5173/` in your browser

## Important Notes

- The `client/public/gurdwara_data.json` file is crucial - it contains all the map data
- The `package.json` lists all dependencies needed
- You'll need to create a `.env.local` file for Google Maps API configuration (see LOCAL_SETUP.md)
- The `dist/` folder is only created after running `pnpm build`

## File Size Reference

- Total project size (without node_modules): ~2-3 MB
- After `pnpm install`: ~500 MB (node_modules)
- After `pnpm build`: ~200 KB (dist folder - this is what gets deployed)

## Common Tasks

**To modify the map data:**
```
Edit: client/public/gurdwara_data.json
```

**To change the page layout:**
```
Edit: client/src/pages/Home.tsx
```

**To customize colors/theme:**
```
Edit: client/src/index.css
```

**To add new UI components:**
```
Use existing ones from: client/src/components/ui/
Or add new ones to: client/src/components/
```

**To deploy:**
```
1. Run: pnpm build
2. Upload: dist/ folder to your hosting
```
