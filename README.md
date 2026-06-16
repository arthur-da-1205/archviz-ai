# ArchViz AI

AI-powered architectural and interior design visualization. Generate design concepts from text prompts using Pollinations, with a persistent personal gallery.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Copy environment file
cp .env.local.example .env.local

# 3. Add your Pollinations API key to .env.local
# POLLINATIONS_API_KEY=...

# 4. Start the dev server
npm run dev

# 5. Open http://localhost:3000
```

You need a Pollinations API key for image generation. Create one at https://enter.pollinations.ai/.

## Environment Variables

| Variable               | Required | Default             | Description                                  |
| ---------------------- | -------- | ------------------- | -------------------------------------------- |
| `DATABASE_URL`         | No       | `file:./gallery.db` | SQLite database path                         |
| `STORAGE_DIR`          | No       | `./storage`         | Directory for generated image files          |
| `POLLINATIONS_API_KEY` | Yes      | -                   | Pollinations API key used by `/api/generate` |
| `POLLINATIONS_MODEL`   | No       | `flux`              | Pollinations image generation model          |
| `AI_IMAGE_TIMEOUT_MS`  | No       | `90000`             | Timeout for upstream image generation        |

## How It Works

1. **Identify**: Enter a name before opening Playground or Gallery. This lightweight identity separates each user's saved images.
2. **Generate**: Type a prompt, pick a style, and click "Generate Design". The backend calls Pollinations, stores the generated image on disk, and saves metadata to SQLite under that name.
3. **Gallery**: Generated images persist in that user's gallery. Refresh the page - they're still there.
4. **Re-generate**: Hover over any image, click "Edit & Regenerate", tweak the prompt or style, and generate a new version.
5. **Delete**: Hover over an image and click "Delete" (click twice to confirm).

## Architecture

- **Frontend**: React 19 + Tailwind CSS, renders the prompt form and image gallery
- **Backend**: Next.js API Routes - handles Pollinations calls, image storage, and database operations
- **Database**: SQLite (better-sqlite3) with WAL mode for concurrent access and per-name gallery ownership
- **Image Storage**: Downloaded from Pollinations responses and saved to `storage/` directory, served via `/api/images/[filename]`
- **AI API**: Pollinations, defaults to the `flux` model

## Error Handling

The app handles three failure states visibly:

- **API Timeout**: If Pollinations takes too long or fails, the error is caught and shown in the UI
- **Invalid Prompt**: Empty or too-long prompts are rejected with a validation error
- **Broken Response**: If the API returns non-image data, the error is caught and displayed

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript (strict mode)
- Tailwind CSS 4
- better-sqlite3
- Pollinations API

## Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## Known Limitations

- **Single server**: SQLite doesn't scale horizontally. For multi-server deployment, switch to PostgreSQL.
- **No authentication**: All users share the same gallery. Add auth if user isolation is needed.
- **File-based storage**: Images are stored on the local filesystem. For cloud deployment (e.g., Vercel), use object storage (S3, R2) instead.
- **Generation speed**: Pollinations generation time depends on the selected model and current quota.
