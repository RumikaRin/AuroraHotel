import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { jsonApiError, toApiErrorResponse } from "@/lib/api-error";
import { productListQuerySchema } from "@/lib/validation";

// The route reads the live DB on every request; never prerender it at build.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const parsed = productListQuerySchema.safeParse({
      take: request.nextUrl.searchParams.get("take") ?? undefined,
    });
    if (!parsed.success) {
      return jsonApiError(
        request,
        400,
        "BAD_REQUEST",
        "Invalid query parameters",
        parsed.error.flatten().fieldErrors,
      );
    }

    const products = await db.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      take: parsed.data.take,
      select: {
        id: true,
        sku: true,
        slug: true,
        name: true,
        description: true,
        price: true,
        stock: true,
      },
    });

    return Response.json({ products });
  } catch (error) {
    return toApiErrorResponse(request, error);
  }
}
