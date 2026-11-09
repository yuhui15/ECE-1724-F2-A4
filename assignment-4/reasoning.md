## Q1: Before implementation, how do you plan to approach one core part of this assignment?

Choose one concrete part of the assignment.

Briefly describe your planned approach, a technical concern,
or an uncertainty you expect to work through.


I'll focus on the create paper flow:

| Part | Responsibility |
| :--- | :--- |
| **`app/papers/create/page.tsx`** | Fetch authors with Prisma (id ascending) |
| **`createPaper`** | Validate in order, then `prisma.paper.create` with `authors.connect` |
| **`CreatePaperForm`** | Show status, disable button, redirect after 3s |

Concern: new papers must appear on the home page, so I'll call `revalidatePath("/")`.


## Q2: Did you use AI?

- If YES:
  - Briefly describe the meaningful ways you used AI.
  - This may include conceptual questions, debugging assistance,
    or help with small parts of the implementation.
  - If AI directly influenced your code, identify the relevant
    file, component, function, or configuration where practical.

- If NO:
  - Write "No AI used."


- Yes. I used AI to break down the assignment's tasks and understand the project's file architecture. AI identified which files I needed to complete (`app/page.tsx`, `app/papers/create/page.tsx`, `app/authors/create/page.tsx`, `components/PaperCard.tsx`, `PaperList.tsx`, `PaperForm.tsx`, `CreatePaperForm.tsx`, `lib/actions.ts`, and `prisma/schema.prisma`). I also used AI to debug environment setup (Node.js, PostgreSQL, Playwright, shadcn/ui).


## Q3: (Only if you used AI)

Choose one specific AI interaction that meaningfully influenced your work.

Briefly explain:

- What the AI suggested, explained, or helped identify
- What you did with that input
- How you verified, modified, or rejected it


- **What the AI suggested:** Tests failed with `password authentication failed`; AI said my `.env` password didn't match PostgreSQL.
- **What I did with that input:** Ran `ALTER USER ... WITH PASSWORD` in psql, then `npx prisma migrate dev`.
- **How I verified:** Reran `npm test`; the password error was gone.