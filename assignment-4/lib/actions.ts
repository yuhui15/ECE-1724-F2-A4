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
}

export async function createAuthor(formData: FormData) {
  // TODO: Implement author creation with server-side validation
  // - Return "Name is required" if the name is empty or whitespace
  // - Create the author with Prisma, storing null for empty optional fields
  // - Return "Error creating author" if database creation fails
  // - Revalidate the paper creation page after successful creation
  // - Return { error: null } on success
}
