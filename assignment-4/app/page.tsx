import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import PaperList from "@/components/PaperList";
import { buttonVariants } from "@/components/ui/button";
import type { Paper } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

async function getPapers(): Promise<{
  papers: (Paper & { authors: { name: string }[] })[];
  error: string | null;
}> {
  try {
    // TODO: Query papers directly using Prisma in this Server Component
    // - Include authors and sort papers by id ascending
    // - Ensure fresh data when returning to the home page
    // - Return { papers, error: null } on success
    const papers = await prisma.paper.findMany({
      include: { authors: true },
      orderBy: { id: "asc" },
    });
    return { papers, error: null };
  } catch {
    return { papers: [], error: "Error loading papers" };
  }
}

async function PapersSection() {
  await connection();
  const { papers, error } = await getPapers();

  // TODO: Render papers or an error message based on getPapers() result
  // - Use data-testid="papers-error" for the error message
  // - Use className="text-sm text-muted-foreground"
  if (error) {
    return (
      <p data-testid="papers-error" className="text-sm text-muted-foreground">
        {error}
      </p>
    );
  }

  return <PaperList papers={papers} />;
}

export default async function Home() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <header className="space-y-2">
        {/* TODO: Style this heading using Tailwind CSS with `text-3xl font-bold` */}
        <h1 className="text-3xl font-bold">Paper Management System</h1>
      </header>

      <div className="flex gap-3">
        {/* TODO: Set the correct navigation path */}
        <Link href="/papers/create" className={buttonVariants()}>
          Create New Paper
        </Link>

        {/* TODO: Set the correct navigation path */}
        <Link
          href="/authors/create"
          className={buttonVariants({ variant: "secondary" })}
        >
          Create New Author
        </Link>
      </div>

      <section className="border rounded-lg p-6 space-y-4 bg-card">
        {/* TODO: Style this subheading with `text-xl font-semibold` */}
        <h2 className="text-xl font-semibold">Papers</h2>

        {/* TODO: Wrap PapersSection in Suspense with a "Loading papers..." fallback */}
        <Suspense fallback={<p className="text-sm">Loading papers...</p>}>
          <PapersSection />
        </Suspense>
      </section>
    </main>
  );
}