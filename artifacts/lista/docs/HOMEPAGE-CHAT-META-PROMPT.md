# LISTA Public Chat — End-to-End Meta-Prompt

**Code:** `artifacts/api-server/src/lib/homepage-chat-meta-prompt.ts`  
**Knowledge:** `homepage-chat-knowledge.ts` + live catalog from `courses-catalog.ts` (same data as `GET /api/courses`)

## Pipeline

```
User message (public site)
  → POST /api/chat/homepage
  → fetchCoursesCatalog() (DB → cache → mock)
  → "List all courses" intent → deterministic numbered reply (no LLM)
  → Else buildKnowledgeBlock + Groq (temperature 0.3, max_tokens 1024)
  → sanitizeAssistantReply() (strip markdown; keeps hyphenated lines)
  → Plain-text reply in UI
```

## What the assistant must answer (grounded)

| User intent | Source | Example question |
|-------------|--------|------------------|
| Full course list | Deterministic `buildDeterministicCourseListReply` | "List all courses you offer" |
| One program | Catalog row + `/courses/{slug}` | "Tell me about Cookery NC II" |
| Sectors / agriculture / ICT | Catalog grouped by sector | "Do you have IT courses?" |
| TWSP / STEP / PESFA | Static scholarship block | "What is TWSP?" |
| Admission steps & documents | Static + `/admissions` | "What do I need to apply?" |
| Online enrollment | Static enrollment steps | "Paano mag-enroll?" |
| Career assessment | `/assessment` | "What is the skills assessment?" |
| Contact / location / hours | Static contact block | "Where is LISTA?" |
| About the school | Static identity | "What is LISTA?" |

## What it must not invent

- Exact tuition, slot counts, batch schedules
- Application/enrollment **status** (redirect `/login`)
- Staff/admin actions, guaranteed jobs
- Medical, legal, or financial advice

Redirect: `/login`, `/admissions`, `/courses`, `(088) 861-4200`, `admin@lorenzinternational.org`

## Language

| User writes | Assistant replies |
|-------------|-------------------|
| English | Direct professional English |
| Tagalog | Natural conversational Tagalog |
| Bisaya | Fluent Mindanao Cebuano |
| Taglish | Natural mix; paths stay English |

## Response format (UI)

- First sentence = direct answer
- No markdown (`*`, `#`, `` ` ``, bullets `•`)
- Numbered steps: `1.` `2.` `3.`
- Paths: `/courses`, `/courses/cookery-nc-ii`, `/login`
- Long lists allowed when user asks for all courses (~200 words max)

## Quick prompts (UI chips)

See `homepage-chat.tsx` — chips mirror common answerable intents.

## Environment

- `GROQ_API_KEY` — repo root `.env` (server only)
- `GROQ_MODEL` — optional override

## Updating knowledge

1. **Courses** — update DB / seed or `courses-mock.ts`; chat picks up on next request (60s cache).
2. **Scholarships, admissions, contact** — edit `buildStaticSiteKnowledge()` in `homepage-chat-knowledge.ts`.
3. **Behavior rules** — edit `homepage-chat-meta-prompt.ts` sections 3–6.
