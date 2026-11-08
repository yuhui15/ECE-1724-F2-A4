"use client";

import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import type { Author } from "@/generated/prisma/client";
import { createPaper } from "@/lib/actions";
import { PaperForm } from "./PaperForm";

type CreatePaperFormProps = {
  authors: Author[];
};

export default function CreatePaperForm({ authors }: CreatePaperFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    setMessage(null);
    setSubmitting(true);

    try {
      // TODO: Call the createPaper Server Action
      // - On validation or creation failure:
      //   - Set message to the returned error
      //   - Reset submitting to false
      // - On success:
      //   - Set message to "Paper created successfully"
      //   - Navigate to "/" after 3 seconds
    } catch {
      // TODO: Set message to "Error creating paper"
      // - Reset submitting to false
    }
  }

  return (
    <div className="space-y-4">
      <PaperForm
        onSubmit={handleSubmit}
        authors={authors}
        submitting={submitting}
      />

      {/* TODO: Display the status message with the required Tailwind CSS classes */}
      {message && <p data-testid="status-message">{/* TODO */}</p>}
    </div>
  );
}
