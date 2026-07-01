import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  phone: z.string().optional(),
  email: z.string().email().optional(),
});

export async function GET() {
  const customers = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ customers });
}

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = createSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const customer = await prisma.customer.create({ data: parsed.data });
  return NextResponse.json({ customer }, { status: 201 });
}
