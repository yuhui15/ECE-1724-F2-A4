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
        {/* TODO: Display publication venue */}
        {/* TODO: Display year */}
      </div>

      <p className="text-sm">
        <span className="font-medium">Authors:</span>{" "}
        <span className="text-muted-foreground">
          {/* TODO: Display authors (comma-separated) */}
        </span>
      </p>
    </li>
  );
}
