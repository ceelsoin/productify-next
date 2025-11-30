# Copilot Instructions for Productify

## Project Overview
Productify is a Next.js SaaS platform for AI-powered product media generation. Users upload product photos to generate enhanced images, promotional videos (Remotion), viral copy, captions (Whisper.cpp), and voice-overs (Google TTS). Operations consume credits purchasable via Stripe.

## Architecture & Stack
- **Framework:** Next.js App Router (prefer React Server Components)
- **Language:** TypeScript (strict mode, always type inputs/outputs)
- **Styling:** Tailwind CSS with dark SaaS theme
- **Payments:** Stripe for credit system
- **Media Processing:**
  - Google Nano Banana (image enhancement)
  - Remotion (video rendering from templates)
  - Whisper.cpp (caption generation)
  - Google TTS (voice-over synthesis)
- **Storage:** S3/GCS for media files

## Directory Structure
```
/app                 # Next.js routes and pages
/components          # Reusable UI components
/lib                 # API integrations (Stripe, TTS, Whisper, Nano Banana)
/services            # Business logic for media generation pipelines
/templates           # Remotion video templates
/types               # Shared TypeScript types
```

## Development Principles

### Code Style
- Use functional components and functional programming patterns
- ESLint config enforces:
  - `@typescript-eslint/no-unused-vars` with `^_` prefix for ignored args
  - `@typescript-eslint/no-explicit-any` as warning
  - React imports not required in JSX scope
  - Prop-types disabled (use TypeScript)
- Prettier settings: 2-space indent, single quotes, semi-colons, 80 char width, arrow parens avoided
- Keep components small, maintainable, and modular
- No magic values—use constants or enums

### TypeScript Requirements
- Strict typing required for all functions
- Always define input and output types explicitly
- Avoid `any`—use proper types or `unknown` with type guards

### Architecture Patterns
- **Media workflows must be resilient and retryable**—handle async failures gracefully
- **Credit consumption:** Deduct credits only after successful processing
- **File validation:** Sanitize and validate all uploaded files before processing
- **Modular pipelines:** Keep image enhancement, video generation, and text generation as separate services

### Security & Data Handling
- Never log sensitive user information
- Validate and sanitize all file uploads
- Follow Stripe PCI-compliance guidelines
- Ensure retry-safe asynchronous workflows

## Development Workflow

### Testing Priorities
1. Business logic (credit consumption, media generation)
2. API endpoints
3. Asynchronous workflows and retries

Mock external services (Stripe, Whisper, TTS, Nano Banana) when testing.

### Adding Features
Include:
1. Description and technical overview
2. UI changes (screenshots/descriptions)
3. Credit consumption rules if applicable
4. Tests for critical paths
5. Migration notes if schema changes

## Key Integration Points
- **Stripe:** Credit purchases and balance tracking
- **Remotion:** Template-based video assembly with scenes, transitions, enhanced images, text overlays, captions, and voice-overs
- **Google Nano Banana:** Image enhancement API for lighting, background, and sharpening
- **Whisper.cpp:** Local caption generation from video audio
- **Google TTS:** Voice-over generation for video narration

## UI Guidelines
- Follow existing dark SaaS theme patterns
- Keep Tailwind classes clean and organized
- Prioritize user clarity around credit consumption
- Key sections: "My Products", "Generate New", "My Credits"

## Reference Files
- See `README.md` for feature overview and tech stack
- See `CONTRIBUTING.md` for detailed code organization and PR process
- See `.copilot/CONTEXT.md` for additional project context
- ESLint/Prettier configs in root define code style standards
