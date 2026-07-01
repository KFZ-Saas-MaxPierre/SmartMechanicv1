import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  name: z.string().min(1),
  durationMinutes: z.number().int().positive(),
  requiresLift: z.boolean().optional(),
});

export async function GET() {
  const workTypes = await prisma.workType.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json({ workTypes });
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

  const workType = await prisma.workType.create({ data: parsed.data });
  return NextResponse.json({ workType }, { status: 201 });
}
