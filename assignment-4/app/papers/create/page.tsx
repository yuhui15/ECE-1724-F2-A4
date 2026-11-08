import Link from "next/link";
import CreatePaperForm from "@/components/CreatePaperForm";
import { buttonVariants } from "@/components/ui/button";
import type { Author } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function getAuthors(): Promise<Author[]> {
  // TODO: Fetch authors from Prisma, sorted by id ascending
}

export default async function CreatePaper() {
  const authors = await getAuthors();

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-10">
      <div className="flex items-center justify-between">
        {/* TODO: Style this heading using Tailwind CSS with `text-2xl font-bold` */}
        <h1>Create New Paper</h1>

        {/* TODO: Link to home page `/` */}
        <Link className={buttonVariants({ variant: "ghost" })}>Back</Link>
      </div>

      <section className="rounded-lg border bg-card p-6">
        <CreatePaperForm authors={authors} />
      </section>
    </main>
  );
}

export const dynamic = "force-dynamic";
