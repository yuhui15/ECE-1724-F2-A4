"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "./prisma";

export async function createPaper(formData: FormData) {
  // TODO: Implement paper creation with server-side validation
  // - Return appropriate error messages for:
  //   - "Title is required"
  //   - "Publication venue is required"
  //   - "Publication year is required"
  //   - "Valid year after 1900 is required"
  //   - "Please select at least one author"
  // - Create the paper with Prisma, connecting selected authors
  // - Return "Error creating paper" if database creation fails
  // - Revalidate the home page after successful creation
  // - Return { error: null } on success
  const title = String(formData.get("title") ?? "").trim();
  const publishedIn = String(formData.get("publishedIn") ?? "").trim();
  const yearRaw = String(formData.get("year") ?? "").trim();
  const authorIds = formData
    .getAll("authorIds")
    .map((id) => Number(id))
    .filter((id) => Number.isInteger(id) && id > 0);

  if (!title) return { error: "Title is required" };
  if (!publishedIn) return { error: "Publication venue is required" };
  if (!yearRaw) return { error: "Publication year is required" };

  const year = Number(yearRaw);
  if (!/^-?\d+$/.test(yearRaw) || !Number.isInteger(year) || year <= 1900) {
    return { error: "Valid year after 1900 is required" };
  }

  if (authorIds.length === 0) {
    return { error: "Please select at least one author" };
  }

  try {
    await prisma.paper.create({
      data: {
        title,
        publishedIn,
        year,
        authors: {
          connect: authorIds.map((id) => ({ id })),
        },
      },
    });
  } catch {
    return { error: "Error creating paper" };
  }

  revalidatePath("/");
  return { error: null };
}

export async function createAuthor(formData: FormData) {
  // TODO: Implement author creation with server-side validation
  // - Return "Name is required" if the name is empty or whitespace
  // - Create the author with Prisma, storing null for empty optional fields
  // - Return "Error creating author" if database creation fails
  // - Revalidate the paper creation page after successful creation
  // - Return { error: null } on success
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const affiliation = String(formData.get("affiliation") ?? "").trim();

  if (!name) return { error: "Name is required" };

  try {
    await prisma.author.create({
      data: {
        name,
        email: email || null,
        affiliation: affiliation || null,
      },
    });
  } catch {
    return { error: "Error creating author" };
  }

  revalidatePath("/papers/create");
  return { error: null };
}