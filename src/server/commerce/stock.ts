export interface AtomicInventoryStore {
  updateMany(input: {
    where: { id: string; stock: { gte: number } };
    data: { stock: { decrement: number } };
  }): Promise<{ count: number }>;
}

export class InventoryConflictError extends Error {}

export async function decrementStock(
  store: AtomicInventoryStore,
  id: string,
  quantity: number,
): Promise<void> {
  if (!Number.isSafeInteger(quantity) || quantity < 1) {
    throw new TypeError("Quantity must be a positive safe integer");
  }

  const result = await store.updateMany({
    where: { id, stock: { gte: quantity } },
    data: { stock: { decrement: quantity } },
  });

  if (result.count !== 1) {
    throw new InventoryConflictError(
      "Inventory is insufficient or changed concurrently",
    );
  }
}
