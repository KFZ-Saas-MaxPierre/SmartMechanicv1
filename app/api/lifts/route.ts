import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
});

export async function GET() {
  const lifts = await prisma.lift.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ lifts });
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

  const lift = await prisma.lift.create({ data: parsed.data });
  return NextResponse.json({ lift }, { status: 201 });
}
