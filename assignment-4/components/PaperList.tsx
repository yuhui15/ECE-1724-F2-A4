import type { Paper } from "@/generated/prisma/client";
import PaperCard from "./PaperCard";

type PaperListProps = {
  papers: (Paper & { authors: { name: string }[] })[];
};

export default function PaperList({ papers }: PaperListProps) {
  // TODO: Show "No papers found" if there is no paper in the database
  // TODO: Implement list rendering with PaperCard
  //       Use <ul className="space-y-4" data-testid="paper-list"></ul>
  if (papers.length === 0) {
    return <p className="text-sm text-muted-foreground">No papers found</p>;
  }

  return (
    <ul className="space-y-4" data-testid="paper-list">
      {papers.map((paper) => (
        <PaperCard key={paper.id} paper={paper} />
      ))}
    </ul>
  );
}