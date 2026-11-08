import "dotenv/config";
import { readFileSync, writeFileSync } from "node:fs";
import { expect, type Page, test } from "@playwright/test";
import pg from "pg";

// WARNING: Each test DELETES ALL papers and authors in DATABASE_URL.
// Run with --workers=1. Do not run multiple test suites concurrently.
const BASE_URL = "http://localhost:3000";
const HOME_PATH = "app/page.tsx";
const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });

test.describe.configure({ mode: "default" });
test.beforeEach(async () => {
  await pool.query('TRUNCATE TABLE "Paper", "Author" RESTART IDENTITY CASCADE');
});
test.afterAll(async () => {
  await pool.end();
});

async function author(
  name: string,
  email: string | null = null,
  affiliation: string | null = null,
) {
  const result = await pool.query<{ id: number }>(
    'INSERT INTO "Author" (name, email, affiliation, "createdAt", "updatedAt") VALUES ($1,$2,$3,NOW(),NOW()) RETURNING id',
    [name, email, affiliation],
  );
  return result.rows[0].id;
}

// Resolve the existing join table using its foreign keys.
// This supports named implicit relations.
let joinTable:
  | { table: string; authorColumn: string; paperColumn: string }
  | undefined;
const quote = (identifier: string) => `"${identifier.replaceAll('"', '""')}"`;

async function getJoinTable() {
  if (joinTable) return joinTable;
  const { rows } = await pool.query<{
    table_name: string;
    author_column: string;
    paper_column: string;
  }>(`
    SELECT junction.relname AS table_name,
           author_col.attname AS author_column,
           paper_col.attname AS paper_column
    FROM pg_constraint author_fk
    JOIN pg_constraint paper_fk
      ON paper_fk.conrelid = author_fk.conrelid
     AND paper_fk.oid <> author_fk.oid
    JOIN pg_class junction ON junction.oid = author_fk.conrelid
    JOIN pg_attribute author_col
      ON author_col.attrelid = junction.oid AND author_col.attnum = author_fk.conkey[1]
    JOIN pg_attribute paper_col
      ON paper_col.attrelid = junction.oid AND paper_col.attnum = paper_fk.conkey[1]
    WHERE author_fk.contype = 'f' AND paper_fk.contype = 'f'
      AND author_fk.confrelid = to_regclass('"Author"')
      AND paper_fk.confrelid = to_regclass('"Paper"')
      AND array_length(author_fk.conkey, 1) = 1
      AND array_length(paper_fk.conkey, 1) = 1
  `);
  if (rows.length !== 1) {
    throw new Error(
      `Expected one Author-Paper join table, found ${rows.length}`,
    );
  }
  joinTable = {
    table: quote(rows[0].table_name),
    authorColumn: quote(rows[0].author_column),
    paperColumn: quote(rows[0].paper_column),
  };
  return joinTable;
}

async function paper(
  title: string,
  publishedIn: string,
  year: number,
  authorIds: number[],
) {
  const join = await getJoinTable();
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query<{ id: number }>(
      'INSERT INTO "Paper" (title, "publishedIn", year, "createdAt", "updatedAt") VALUES ($1,$2,$3,NOW(),NOW()) RETURNING id',
      [title, publishedIn, year],
    );
    const id = result.rows[0].id;
    for (const authorId of authorIds) {
      await client.query(
        `INSERT INTO ${join.table} (${join.authorColumn}, ${join.paperColumn}) VALUES ($1,$2)`,
        [authorId, id],
      );
    }
    await client.query("COMMIT");
    return id;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function fillPaper(
  page: Page,
  title: string,
  publishedIn: string,
  year: string,
  ids: number[],
) {
  await page.goto(`${BASE_URL}/papers/create`);
  await page.locator('input[name="title"]').fill(title);
  await page.locator('input[name="publishedIn"]').fill(publishedIn);
  await page.locator('input[name="year"]').fill(year);
  if (ids.length)
    await page.getByTestId("author-dropdown").selectOption(ids.map(String));
}

async function submitPaper(page: Page) {
  await page.getByTestId("create-paper-btn").click();
}

async function assertPaperMessage(page: Page, message: string) {
  await expect(page.getByTestId("status-message")).toHaveText(message);
}

async function checkPaperSaved(
  title: string,
  venue: string,
  year: number,
  names: string[],
) {
  const join = await getJoinTable();
  const result = await pool.query<{
    title: string;
    publishedIn: string;
    year: number;
    name: string | null;
  }>(
    `SELECT p.title, p."publishedIn", p.year, a.name
     FROM "Paper" p
     LEFT JOIN ${join.table} j ON j.${join.paperColumn} = p.id
     LEFT JOIN "Author" a ON a.id = j.${join.authorColumn}
     WHERE p.title = $1 ORDER BY a.id`,
    [title],
  );
  expect(result.rows.length).toBe(names.length);
  expect(result.rows[0]).toMatchObject({ title, publishedIn: venue, year });
  expect(result.rows.map((r) => r.name)).toEqual(names);
}

test.describe("Assignment 4 sample", () => {
  // Home route
  test("Home Route: Page Layout and Links", async ({ page }) => {
    await page.goto(BASE_URL);
    const main = page.getByRole("heading", { name: "Paper Management System" });
    const section = page.getByRole("heading", { name: "Papers", exact: true });
    const createPaper = page.getByRole("link", { name: "Create New Paper" });
    const createAuthor = page.getByRole("link", { name: "Create New Author" });
    await expect(main).toBeVisible();
    await expect(section).toBeVisible();
    await expect(main).toHaveClass(/text-3xl/);
    await expect(main).toHaveClass(/font-bold/);
    await expect(section).toHaveClass(/text-xl/);
    await expect(section).toHaveClass(/font-semibold/);
    await expect(createPaper).toBeVisible();
    await expect(createAuthor).toBeVisible();
    for (const link of [createPaper, createAuthor]) {
      await expect(link).toHaveClass(/\binline-flex\b/);
      await expect(link).toHaveClass(/\bitems-center\b/);
      await expect(link).toHaveClass(/\bjustify-center\b/);
    }
    await createPaper.click();
    await expect(page).toHaveURL(`${BASE_URL}/papers/create`);
    await page.goto(BASE_URL);
    await createAuthor.click();
    await expect(page).toHaveURL(`${BASE_URL}/authors/create`);
  });

  test("Home Route: Empty State shows 'No papers found' when database is empty", async ({
    page,
  }) => {
    await page.goto(BASE_URL);
    await expect(
      page.getByText("No papers found", { exact: true }),
    ).toBeVisible();
  });

  test("Home Route: Paper Rendering for Three Papers in ID Order", async ({
    page,
  }) => {
    const a1 = await author("Author One");
    const a2 = await author("Author Two");
    const a3 = await author("Author Three");

    // Titles deliberately differ from ID order.
    await paper("Zebra Paper", "ICSE", 2024, [a1, a2, a3]);
    await paper("Apple Paper", "SIGMOD", 2025, [a2, a3]);
    await paper("Middle Paper", "NeurIPS", 2023, [a1]);

    await page.goto(BASE_URL);
    const cards = page.locator("main li");
    await expect(cards).toHaveCount(3);
    await expect(cards.locator("h3")).toHaveText([
      "Zebra Paper",
      "Apple Paper",
      "Middle Paper",
    ]);

    await expect(cards.nth(0)).toContainText("ICSE");
    await expect(cards.nth(0)).toContainText("2024");
    await expect(cards.nth(0)).toContainText(
      /Author One, Author Two, Author Three|Author One, Author Three, Author Two|Author Two, Author One, Author Three|Author Two, Author Three, Author One|Author Three, Author One, Author Two|Author Three, Author Two, Author One/,
    );
    await expect(cards.nth(1)).toContainText("SIGMOD");
    await expect(cards.nth(1)).toContainText("2025");
    await expect(cards.nth(1)).toContainText(
      /Author Two, Author Three|Author Three, Author Two/,
    );
    await expect(cards.nth(2)).toContainText("NeurIPS");
    await expect(cards.nth(2)).toContainText("2023");
    await expect(cards.nth(2)).toContainText("Author One");
  });

  // If this test fails, check whether you followed the starter code's
  // hint to place the Prisma query in getPapers() in app/page.tsx.
  test("Home Route: Prisma Query Error State", async ({ page }) => {
    test.setTimeout(60000); // Allow time for Next.js dev-server recompilation.
    const original = readFileSync(HOME_PATH, "utf8");
    const patched = original.replace(
      /prisma\.paper\.findMany\s*\(/,
      '((..._args: unknown[]) => Promise.reject(new Error("Simulated query failure")))(',
    );
    expect(patched).not.toBe(original);

    try {
      writeFileSync(HOME_PATH, patched);
      await expect(async () => {
        await page.goto(BASE_URL);
        await expect(page.getByTestId("papers-error")).toHaveText(
          "Error loading papers",
        );
      }).toPass({ timeout: 30000 });
    } finally {
      writeFileSync(HOME_PATH, original);
      await expect(async () => {
        await page.goto(BASE_URL);
        await expect(
          page.getByText("No papers found", { exact: true }),
        ).toBeVisible();
      }).toPass({ timeout: 30000 });
    }
  });

  // Create Paper route
  test("Create Paper Route: Author dropdown shows 'No authors available' if empty", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/papers/create`);
    const options = page.getByTestId("author-dropdown").locator("option");
    await expect(options).toHaveText(["No authors available"]);
    await expect(options.first()).toBeDisabled();
  });

  test("Create Paper Route: Validation - Title is required for empty string", async ({
    page,
  }) => {
    const id = await author("Author 1");
    await fillPaper(page, "", "IEEE", "2024", [id]);
    await submitPaper(page);
    await assertPaperMessage(page, "Title is required");
    await expect(page.getByTestId("status-message")).toHaveClass(/text-sm/);
    await expect(page.getByTestId("status-message")).toHaveClass(
      /text-red-800/,
    );
  });

  test("Create Paper Route: Successful creation with one author", async ({
    page,
  }) => {
    const id = await author("Single Author");
    await fillPaper(page, "Created One", "IEEE", "2025", [id]);
    await submitPaper(page);
    await assertPaperMessage(page, "Paper created successfully");
    await expect(page.getByTestId("status-message")).toHaveClass(/text-sm/);
    await checkPaperSaved("Created One", "IEEE", 2025, ["Single Author"]);
    await expect(page).toHaveURL(`${BASE_URL}/`, { timeout: 6000 });
  });

  test("Create Paper Route: Successful creation with two authors", async ({
    page,
  }) => {
    const a1 = await author("Multi Author 1");
    const a2 = await author("Multi Author 2");
    await fillPaper(page, "Created Two", "SIGMOD", "2024", [a1, a2]);
    await submitPaper(page);
    await assertPaperMessage(page, "Paper created successfully");
    await checkPaperSaved("Created Two", "SIGMOD", 2024, [
      "Multi Author 1",
      "Multi Author 2",
    ]);
    await expect(page).toHaveURL(`${BASE_URL}/`, { timeout: 6000 });
  });

  // Create Author route
  test("Create Author Route: Page Rendering", async ({ page }) => {
    await page.goto(`${BASE_URL}/authors/create`);
    await expect(
      page.getByRole("heading", { name: "Create New Author" }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Back" })).toBeVisible();
    for (const field of ["name", "email", "affiliation"]) {
      await expect(page.locator(`input[name="${field}"]`)).toBeVisible();
    }
    await expect(page.getByTestId("create-author-btn")).toBeVisible();
    await page.getByRole("link", { name: "Back" }).click();
    await expect(page).toHaveURL(`${BASE_URL}/`);
  });

  test("Create Author Route: Validation - Name is required for empty string", async ({
    page,
  }) => {
    await page.goto(`${BASE_URL}/authors/create`);
    await page.locator('input[name="name"]').fill("");
    await page.getByTestId("create-author-btn").click();
    await expect(page.getByTestId("status-message")).toHaveText(
      "Name is required",
    );
    await expect(page.getByTestId("status-message")).toHaveClass(/text-sm/);
    await expect(page.getByTestId("status-message")).toHaveClass(
      /text-red-800/,
    );
  });

  test("Create Author Route: Successful creation", async ({ page }) => {
    await page.goto(`${BASE_URL}/authors/create`);
    await page.locator('input[name="name"]').fill("Created Author");
    await page.locator('input[name="email"]').fill("created@example.com");
    await page.locator('input[name="affiliation"]').fill("UofT");
    await page.getByTestId("create-author-btn").click();
    await expect(page.getByTestId("status-message")).toHaveText(
      "Author created successfully",
    );
    await expect(page.getByTestId("status-message")).toHaveClass(/text-sm/);
    const saved = await pool.query(
      'SELECT name, email, affiliation FROM "Author" WHERE name=$1',
      ["Created Author"],
    );
    expect(saved.rows).toEqual([
      {
        name: "Created Author",
        email: "created@example.com",
        affiliation: "UofT",
      },
    ]);
    await expect(page).toHaveURL(`${BASE_URL}/`, { timeout: 6000 });
  });
});
