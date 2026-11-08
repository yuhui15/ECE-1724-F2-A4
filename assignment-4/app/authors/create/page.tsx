"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SubmitEvent } from "react";
import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
import { createAuthor } from "@/lib/actions";
import { inputClass } from "@/lib/ui";

export default function CreateAuthor() {
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
      // TODO: Call the createAuthor Server Action
      // - On validation or creation failure:
      //   - Set message to the returned error
      //   - Reset submitting to false
      // - On success:
      //   - Set message to "Author created successfully"
      //   - Navigate to "/" after 3 seconds
      const result = await createAuthor(formData);
      if (result.error) {
        setMessage(result.error);
        setSubmitting(false);
        return;
      }

      setMessage("Author created successfully");
      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch {
      // TODO: Set message to "Error creating author"
      // - Reset submitting to false
      setMessage("Error creating author");
      setSubmitting(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <div className="flex items-center justify-between">
        {/* TODO: Style this heading using Tailwind CSS with `text-2xl font-bold` */}
        <h1 className="text-2xl font-bold">Create New Author</h1>

        {/* TODO: Link to home page `/` */}
        <Link href="/" className={buttonVariants({ variant: "ghost" })}>
          Back
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        noValidate
        className="border rounded-lg p-6 space-y-4 bg-card"
      >
        <div className="space-y-1">
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input type="text" name="name" id="name" className={inputClass} />
        </div>

        <div className="space-y-1">
          <label htmlFor="email" className="block text-sm font-medium">
            Email (optional)
          </label>
          {/* TODO: Add an email input styled with `inputClass` */}
          <input type="email" name="email" id="email" className={inputClass} />
        </div>

        <div className="space-y-1">
          <label htmlFor="affiliation" className="block text-sm font-medium">
            Affiliation (optional)
          </label>
          {/* TODO: Add a text input for the affiliation, styled with `inputClass` */}
          <input
            type="text"
            name="affiliation"
            id="affiliation"
            className={inputClass}
          />
        </div>

        <div className="flex items-center gap-3">
          {/* TODO: Disable the button while submitting */}
          <Button
            data-testid="create-author-btn"
            type="submit"
            disabled={submitting}
          >
            Create Author
          </Button>

          {/* TODO: Display the status message with the required Tailwind CSS classes */}
          {message && (
            <p
              data-testid="status-message"
              className={
                message === "Author created successfully"
                  ? "text-sm"
                  : "text-sm text-red-800"
              }
            >
              {message}
            </p>
          )}
        </div>
      </form>
    </main>
  );
}