# Productify - Project Setup

This document provides instructions for setting up and running the Productify development environment.

## Prerequisites

- Node.js 18+ and npm
- Git
- Stripe account (for payments)
- Google Cloud account (for TTS and Nano Banana)
- Whisper.cpp compiled locally (for captions)

## Initial Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Copy the example environment file and configure your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:
- Stripe keys (get from https://dashboard.stripe.com/apikeys)
- Google Cloud credentials
- Other service credentials

### 3. Set Up Whisper.cpp

Clone and compile Whisper.cpp for caption generation:

```bash
git clone https://github.com/ggerganov/whisper.cpp
cd whisper.cpp
make
./models/download-ggml-model.sh base
```

Update `WHISPER_CPP_PATH` in `.env.local` to point to your whisper.cpp directory.

### 4. Configure Storage

Choose either AWS S3 or Google Cloud Storage and configure the appropriate environment variables in `.env.local`.

## Development

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### Build for Production

```bash
npm run build
npm start
```

### Lint Code

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

## Project Structure

```
/app                    # Next.js App Router pages and routes
  /credits              # Credit management pages
  /generate             # Media generation pages  
  /products             # Product listing pages
  globals.css           # Global styles
  layout.tsx            # Root layout
  page.tsx              # Home page

/components             # Reusable UI components
  Button.tsx            # Button component
  Card.tsx              # Card components
  Footer.tsx            # Footer component
  Header.tsx            # Header component

/lib                    # External API integrations
  nano-banana.ts        # Google Nano Banana image enhancement
  stripe.ts             # Stripe payment integration
  tts.ts                # Google TTS voice-over generation
  whisper.ts            # Whisper.cpp caption generation

/services               # Business logic
  copy-generation.ts    # AI copywriting service
  credits.ts            # Credit management service
  image-enhancement.ts  # Image enhancement pipeline
  video-generation.ts   # Video generation pipeline

/templates              # Remotion video templates
  ProductShowcase.tsx   # Product showcase template
  Root.tsx              # Remotion root

/types                  # TypeScript type definitions
  index.ts              # Shared types

/public                 # Static assets
```

## Key Integrations

### Stripe
- Credit purchases and payments
- Webhook handling for payment events
- See `lib/stripe.ts`

### Google Cloud Services
- Text-to-Speech for voice-overs
- Nano Banana for image enhancement
- Requires service account credentials

### Whisper.cpp
- Local caption generation from audio
- Requires compiled binary and models
- See `lib/whisper.ts`

### Remotion
- Template-based video rendering
- See `/templates` directory

## Credit System

Operations consume credits:
- Image Enhancement: 5 credits
- Video Generation: 20 credits
- Copy Generation: 2 credits

Users purchase credits via Stripe integration.

## Development Guidelines

See `.github/copilot-instructions.md` for:
- Code style requirements
- Architecture patterns
- TypeScript conventions
- Testing priorities

## Database Setup

TODO: Add database setup instructions once database provider is chosen.

Options:
- PostgreSQL with Prisma
- MongoDB with Mongoose
- Supabase
- PlanetScale

## Deployment

TODO: Add deployment instructions for:
- Vercel
- AWS
- Google Cloud Platform

## Troubleshooting

### Whisper.cpp not found
Make sure `WHISPER_CPP_PATH` points to the correct directory and the binary is compiled.

### Stripe webhook errors
Use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`

### Image enhancement failing
Verify Google Cloud credentials and Nano Banana API access.

## Support

For questions or issues, please refer to the project documentation or contact the development team.
