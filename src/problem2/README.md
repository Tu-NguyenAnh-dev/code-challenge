<!-- @format -->

# Currency Swap

## Quick Start

Access this URL to use it immediately without installation.

https://code-challenge-eight-iota.vercel.app/

1. Install dependencies:

```bash
npm install
# or
yarn install
```

2. Start:

```bash
npm run dev
#or
yarn dev
```

### Icon Display

- Displays token icons from provided URLs
- Falls back to currency initials if:
  - URL is not provided
  - Image fails to load

### Click Outside

Uses a custom `useOutsideClick` hook to close the dropdown when clicking outside the component.
