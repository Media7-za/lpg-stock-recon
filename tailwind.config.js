/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        'surface-elevated': '#252525',
        'text-primary': '#f5f5f5',
        'text-secondary': '#a3a3a3',
        border: '#333333',
        // --- Added in Orders-Module migration Phase 3 ---
        // Required by the ported shadcn/ui primitives (components/ui/*), which
        // use these token names via Tailwind classes (bg-primary, text-muted-
        // foreground, etc.). `background` and `border` above are untouched and
        // keep their existing values/usages. `foreground` is newly defined here
        // for the first time — see migration notes: ~148 existing `text-
        // foreground` class usages elsewhere in this app were previously a
        // no-op (the token didn't exist), so this activates them; the value
        // below (matching existing text-primary) keeps that a no-op change in
        // practice, not a visual regression.
        foreground: '#f5f5f5',
        card: '#1a1a1a',
        'card-foreground': '#f5f5f5',
        popover: '#1a1a1a',
        'popover-foreground': '#f5f5f5',
        primary: '#f97316',
        'primary-foreground': '#ffffff',
        secondary: '#252525',
        'secondary-foreground': '#f5f5f5',
        muted: '#252525',
        'muted-foreground': '#a3a3a3',
        accent: '#252525',
        'accent-foreground': '#f5f5f5',
        destructive: '#dc2626',
        'destructive-foreground': '#ffffff',
        input: '#333333',
        ring: '#f97316',
        sidebar: '#1a1a1a',
        'sidebar-foreground': '#a3a3a3',
        'sidebar-primary': '#f97316',
        'sidebar-primary-foreground': '#ffffff',
        'sidebar-accent': '#252525',
        'sidebar-accent-foreground': '#f5f5f5',
        'sidebar-border': '#333333',
        'sidebar-ring': '#f97316',
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}

