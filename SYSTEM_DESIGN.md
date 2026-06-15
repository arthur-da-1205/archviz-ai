# System Design - ArchViz AI

## App Journey

1. User opens Home and sees the application purpose.
2. User clicks Playground or Gallery.
3. Frontend asks for a name as a lightweight identity.
4. Frontend stores the name in `localStorage`.
5. Frontend sends API requests with `x-archviz-user`.
6. Backend validates the user name and prompt.
7. Backend enhances the prompt with style and quality keywords.
8. Backend calls Pollinations from the server only.
9. Pollinations returns image data to the backend.
10. Backend stores the image in `storage/`.
11. Backend saves metadata to SQLite with `ownerName`, prompt, style, filename, and timestamp.
12. Frontend receives `/api/images/{filename}` and renders the result.
13. Gallery requests only return images for the active name.

## Tech Stack

| Layer | Technology | Why |
|---|---|---|
| Framework | Next.js 16 App Router | Frontend and backend route handlers in one project. |
| Frontend | React 19 + Tailwind CSS | Fast UI iteration and clear component boundaries. |
| Database | SQLite + better-sqlite3 | Simple persistent local storage with WAL mode for concurrent reads/writes. |
| Image storage | Local filesystem | Keeps generated images available after refresh and avoids external URL passthrough. |
| AI API | Pollinations | Real image API with server-side calls and simple image response handling. |

## Key Decisions

- AI calls never run in the browser. `/api/generate` is the only path to Pollinations.
- Images are stored server-side before the frontend sees them.
- Gallery ownership uses a lightweight name-based identity instead of full auth. This is enough for the assessment flow and keeps the app simple.
- SQLite uses WAL mode so reads and writes can happen concurrently.
- Image serving uses content type detection so JPEG/PNG/WebP outputs preview correctly.

## Failure Handling

- Invalid prompt: backend returns 400 for empty or too-long prompts.
- Broken response: backend rejects non-image responses from Pollinations.
- Missing image: image route returns 404 and the gallery shows an unavailable state.
- API/provider errors: backend returns a visible error message to the frontend.

## Build Process

1. Built the core generate API and server-side image storage.
2. Added SQLite persistence for gallery refresh survival.
3. Added re-generation from saved prompt/style.
4. Replaced provider experiments with a single Pollinations path once it worked reliably.
5. Added Home, Playground, and Gallery navigation.
6. Added lightweight identity so each reviewer has a separate personal gallery.
