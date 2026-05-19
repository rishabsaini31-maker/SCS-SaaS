# SCS Super Admin (Standalone)

This is a standalone Next.js App for the SCS Super Admin panel extracted from the main frontend.

Setup

1. Install dependencies:

```bash
cd scs-super-admin
npm install next react react-dom tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

2. Start dev server:

```bash
npm run dev
```

Notes
- The app uses the same global styles as the main frontend. If you use a different Tailwind setup, ensure `tailwind.config.cjs` content paths match.
- To integrate with your backend, implement API calls in the components under `src/components/scs-admin`.
