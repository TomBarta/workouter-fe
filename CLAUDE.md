# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build/Test/Lint Commands
- `npm run dev` - Run development server with turbopack
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run test` - Run all Vitest tests
- `npm run test __tests__/actions.test.ts` - Run specific test file
- `npm run test -- -t "test name"` - Run tests matching pattern

## Code Style Guidelines
- **TypeScript**: Strict typing required, interfaces preferred over types
- **Imports**: Use absolute paths with `@/` prefix
- **Formatting**: Follow ESLint rules (based on Next.js defaults)
- **Naming**:
  - React components: PascalCase
  - Functions/variables: camelCase
  - Interfaces/types: PascalCase with "I" prefix optional
  - **Prisma models**: PascalCase for model names, camelCase for TypeScript fields
  - **Database tables/columns**: snake_case (use `@map` and `@@map` in Prisma schema)
- **Error Handling**: Use try/catch with specific error types
- **Testing**: Use Vitest with test.each for parameterized tests
- **Components**: Prefer functional components with hooks
- **Prisma Conventions**:
  - Always map Prisma models to snake_case table names using `@@map("table_name")`
  - Always map camelCase fields to snake_case columns using `@map("column_name")`
  - Use canonical PostgreSQL naming (e.g., `created_at`, `user_id`, not `createdAt`, `userId`)

## Project Architecture

### Tech Stack
- **Framework**: Next.js 15 with App Router
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS + DaisyUI with custom Workouter brand system
- **Testing**: Vitest + React Testing Library + JSDOM
- **Language**: TypeScript with strict mode

### Directory Structure
- `app/` - Next.js App Router pages and layouts
  - `landing/` - Landing page components with modular architecture
  - `lib/` - Server actions and utilities
- `__tests__/` - Test files mirroring app structure
- Custom brand design system in `tailwind.config.ts`

### Key Patterns
- **Server Actions**: Located in `app/lib/actions.ts`, handles workout creation API calls
- **Component Organization**: Landing components use barrel exports (`index.ts`)
- **Form Handling**: WorkoutFormData interface defines structured workout data
- **API Integration**: Communicates with external workout service at localhost:8080
- **Brand System**: Comprehensive Tailwind config with Workouter colors, gradients, and components

### Testing Setup
- Vitest configuration with jsdom environment
- React Testing Library with comprehensive cleanup
- Tests organized by feature area with setup in `__tests__/setup.ts`

Always run tests after code changes to ensure functionality is preserved.