import type { Paper } from "@/generated/prisma/client";

interface PaperCardProps {
  paper: Paper & { authors: { name: string }[] };
}

export default function PaperCard({ paper }: PaperCardProps) {
  // TODO: Implement paper display logic
  return (
    <li className="border rounded-lg p-4 bg-card space-y-2">
      <div className="space-y-1">
        {/* TODO: Display title */}
        <h3 className="text-lg font-semibold leading-snug">{paper.title}</h3>
        {/* TODO: Display publication venue */}
        <p className="text-sm text-muted-foreground">{paper.publishedIn}</p>
        {/* TODO: Display year */}
        <p className="text-sm text-muted-foreground">{paper.year}</p>
      </div>

      <p className="text-sm">
        <span className="font-medium">Authors:</span>{" "}
        <span className="text-muted-foreground">
          {/* TODO: Display authors (comma-separated) */}
          {paper.authors.map((author) => author.name).join(", ")}
        </span>
      </p>
    </li>
  );
}