# Nikol — build status

## Blocked: the reference images are not images

The brief makes the screenshots in `public/images` the absolute visual source
of truth and requires a 1:1 recreation. That work cannot start yet.

The four files currently in `public/images` are **saved ChatGPT share pages
(HTML), not image files**:

| File | Page title |
| --- | --- |
| `m_6a9477035b0c8191b1c9c59a0382593a` | Hebrew Restaurant Discovery App UI |
| `m_6a94782a6cc8819190f433ebe831ec09` | Warm Hebrew Restaurant Assistant UI |
| `m_6a947844f78c8191937a2a089736334f` | Hebrew AI Waiter App Mockup |
| `m_6a947861e5ec81919d04ec1b9cf4e308` | Hebrew AI Waiter Restaurant App |

Each page references the real screenshot through an `og:image` URL on
`chatgpt.com`, which this environment's network policy blocks. The image bytes
are not embedded in the HTML, so they cannot be recovered from these files.

**To unblock:** export each screenshot as a real `.png` / `.jpg` and commit it
to `public/images/`, ideally named for its screen (`01-discovery.png`,
`02-restaurant-home.png`, `03-recommend-me.png`, `04-chat-sheet.png`).

The existing files have been left untouched, as instructed.

## What is built

Design-independent foundation only — everything below is dictated by the
written brief and carries no visual decisions.

- **Scaffold**: Next.js 15 (App Router), React 19, TypeScript, Tailwind v4.
- **RTL**: `lang="he" dir="rtl"` at the root layout.
- **Types** (`types/`): restaurant config, menu/dish, order/table session, AI.
- **Mock data**: Loama with 20 dishes across the 8 briefed categories, the four
  discovery restaurants, and the 4-question recommendation flow.
- **Services** (`services/`):
  - `ai/` — `NikolAIService` interface with a keyword-matching mock behind it.
    `services/ai/index.ts` is the single swap point for a real API.
  - `ordering/` — line totals, pre-order sanity check, bill splitting.
  - `kitchen/` — waiting-time estimate and the order status pipeline.
  - `service-requests/` — water / napkins / waiter asks.
- **Routes**: `/` (discovery), `/r/[restaurantId]/table/[tableId]` (QR entry),
  `/admin` (dashboard prototype).

`npx tsx scripts/verify-mock-ai.ts` exercises the mock engine end to end. The
demo table totals ₪268, matching the walkthrough in the brief.

## What is deliberately NOT built

No design tokens, no UI components, and no finished screens. The provisional
colors in `app/globals.css` come from the brief's prose, not from the
references, and are expected to be replaced. The three route files are plain
stubs that exist to verify wiring.

Screens 1–18, the design system, and the visual polish pass all start once the
reference images are readable.
