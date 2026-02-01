# CLAUDE.md - Project Summary

## Project Overview
**UIGen** - AI-powered UI generator built with Next.js. Users can describe UI components in natural language, and the AI generates React code with live preview.

## Tech Stack
- **Framework**: Next.js 15.3 with Turbopack
- **Language**: TypeScript
- **Database**: Prisma with SQLite
- **AI**: Anthropic Claude API (`@ai-sdk/anthropic`)
- **UI Components**: shadcn/ui (Radix UI + Tailwind CSS 4)
- **Code Editor**: Monaco Editor
- **Testing**: Vitest + React Testing Library
- **Auth**: Custom JWT (jose) + bcrypt

## Key Commands
```bash
npm run dev        # Start dev server with Turbopack
npm run build      # Production build
npm run test       # Run tests with Vitest
npm run lint       # ESLint
npm run setup      # Install deps + Prisma generate + migrate
npm run db:reset   # Reset database
```

## Project Structure
```
src/
├── app/                    # Next.js App Router
│   ├── api/chat/          # AI chat API endpoint
│   └── [projectId]/       # Dynamic project pages
├── components/
│   ├── ui/                # shadcn/ui components
│   ├── chat/              # Chat interface components
│   ├── auth/              # Authentication forms
│   ├── editor/            # Code editor & file tree
│   └── preview/           # Live preview frame
├── lib/
│   ├── contexts/          # React contexts (chat, file-system)
│   ├── tools/             # AI tools (file-manager, str-replace)
│   ├── transform/         # JSX transformer
│   └── prompts/           # AI prompt templates
├── actions/               # Server actions (create/get projects)
├── hooks/                 # Custom hooks (use-auth)
└── generated/prisma/      # Prisma client (auto-generated)
```

## Database Models
- **User**: id, email, password, projects[]
- **Project**: id, name, userId, messages (JSON), data (JSON)

## Architecture Patterns
- Server Components by default
- Server Actions for data mutations
- React Context for client state (chat, file-system)
- Resizable panels layout (react-resizable-panels)

## Important Files
- `src/app/api/chat/route.ts` - Main AI chat endpoint
- `src/lib/prompts/generation.tsx` - AI system prompts
- `src/lib/contexts/chat-context.tsx` - Chat state management
- `src/lib/contexts/file-system-context.tsx` - Virtual file system
- `src/middleware.ts` - Auth middleware

## Environment Variables
Required in `.env`:
- `ANTHROPIC_API_KEY` - Claude API key

## Code Style Rules
- Always add comments in code to explain logic and functionality
- Comments should be in the same language as the user's request
- Always refer to `prisma/schema.prisma` when you need to understand the database structure
