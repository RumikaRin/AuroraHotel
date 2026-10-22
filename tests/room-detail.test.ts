import test from "node:test";
import assert from "node:assert/strict";

interface MockCategory {
  slug: string;
  name: string;
  isActive: boolean;
}

function resolveRoomCategory(slug: string, categories: MockCategory[]) {
  const match = categories.find((c) => c.slug === slug && c.isActive);
  if (!match) return { notFound: true };
  return { notFound: false, category: match };
}

test("Valid room slug returns category", () => {
  const categories: MockCategory[] = [
    { slug: "deluxe-ocean-king", name: "Deluxe Ocean King", isActive: true },
    { slug: "presidential-suite", name: "Presidential Suite", isActive: true },
  ];
  const res = resolveRoomCategory("presidential-suite", categories);
  assert.equal(res.notFound, false);
  assert.equal(res.category?.name, "Presidential Suite");
});

test("Invalid or inactive room slug triggers notFound", () => {
  const categories: MockCategory[] = [
    { slug: "deluxe-ocean-king", name: "Deluxe Ocean King", isActive: true },
    { slug: "archived-room", name: "Archived Room", isActive: false },
  ];
  assert.equal(resolveRoomCategory("non-existent-slug", categories).notFound, true);
  assert.equal(resolveRoomCategory("archived-room", categories).notFound, true);
});
