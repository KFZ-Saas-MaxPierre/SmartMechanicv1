import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  customerId: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  licensePlate: z.string().min(1),
});

export async function GET() {
  const vehicles = await prisma.vehicle.findMany({
    include: { customer: true },
    orderBy: { make: "asc" },
  });
  return NextResponse.json({ vehicles });
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

  const vehicle = await prisma.vehicle.create({ data: parsed.data });
  return NextResponse.json({ vehicle }, { status: 201 });
}
