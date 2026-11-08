"use client";

import type { SubmitEvent } from "react";
import { Button } from "@/components/ui/button";
import type { Author } from "@/generated/prisma/client";
import { inputClass, selectClass } from "@/lib/ui";

type PaperFormProps = {
  onSubmit: (event: SubmitEvent<HTMLFormElement>) => void;
  authors: Author[];
  submitting: boolean;
};

export function PaperForm({ onSubmit, authors, submitting }: PaperFormProps) {
  return (
    <form onSubmit={onSubmit} noValidate className="space-y-4">
      <div className="space-y-1">
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        {/* TODO: Add a text input for the title, styled with `inputClass` */}
        <input type="text" name="title" id="title" className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="publishedIn" className="block text-sm font-medium">
          Published In
        </label>
        {/* TODO: Add a text input for the publication venue, styled with `inputClass` */}
        <input
          type="text"
          name="publishedIn"
          id="publishedIn"
          className={inputClass}
        />
      </div>

      <div className="space-y-1">
        <label htmlFor="year" className="block text-sm font-medium">
          Year
        </label>
        {/* TODO: Add a number input for the publication year, styled with `inputClass` */}
        <input type="number" name="year" id="year" className={inputClass} />
      </div>

      <div className="space-y-1">
        <label htmlFor="authorIds" className="block text-sm font-medium">
          Authors
        </label>
        {/* TODO: Add a multi-select dropdown using `authors` and `selectClass`
            - Use name="authorIds", id="authorIds", and data-testid="author-dropdown"
            - If no authors are available, show a disabled "No authors available" option
            - Otherwise, render an option for each author
        */}
        <select
          multiple
          name="authorIds"
          id="authorIds"
          data-testid="author-dropdown"
          className={selectClass}
        >
          {authors.length === 0 ? (
            <option disabled>No authors available</option>
          ) : (
            authors.map((author) => (
              <option key={author.id} value={author.id}>
                {author.name}
              </option>
            ))
          )}
        </select>
        <p className="text-xs text-muted-foreground">
          Use Ctrl+click (Windows/Linux) or Cmd+click (Mac) to select multiple
          authors.
        </p>
      </div>

      {/* TODO: Add a shadcn/ui Button labeled "Create Paper"
          - Use type="submit" and data-testid="create-paper-btn"
          - Disable the button while submitting
      */}
      <Button type="submit" data-testid="create-paper-btn" disabled={submitting}>
        Create Paper
      </Button>
    </form>
  );
}