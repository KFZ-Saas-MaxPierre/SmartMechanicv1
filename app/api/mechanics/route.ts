import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const shiftSchema = z.object({
  weekday: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
});

const createSchema = z.object({
  name: z.string().min(1),
  active: z.boolean().optional(),
  shifts: z.array(shiftSchema).optional(),
});

export async function GET() {
  const mechanics = await prisma.mechanic.findMany({
    include: { shifts: true },
    orderBy: { name: "asc" },
  });
  return NextResponse.json({ mechanics });
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

  const { shifts, ...mechanicData } = parsed.data;

  const mechanic = await prisma.mechanic.create({
    data: {
      ...mechanicData,
      shifts: shifts ? { create: shifts } : undefined,
    },
    include: { shifts: true },
  });

  return NextResponse.json({ mechanic }, { status: 201 });
}
