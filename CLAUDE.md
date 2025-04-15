# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands
- Build: `npm run build`
- Dev: `npm run dev --turbopack`
- Start: `npm run start`
- Lint: `npm run lint`
- Type Check: `npx tsc --noEmit`

## Code Style
- **TypeScript**: Strict mode enabled
- **Imports**: Use absolute imports with `@/*` aliases
- **Formatting**: Follow Next.js conventions
- **Components**: Use React functional components with TypeScript types
- **Error Handling**: Proper try/catch in async functions
- **State Management**: React hooks (useState, useEffect)
- **Naming**: PascalCase for components, camelCase for variables/functions
- **CSS**: Using Tailwind CSS

## Project Structure
- Next.js 15 with App Router
- React 19
- TypeScript 5
- Tailwind CSS 4