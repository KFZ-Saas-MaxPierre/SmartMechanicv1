import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";

const createSchema = z.object({
  vehicleId: z.string().min(1),
  workTypeId: z.string().min(1),
  mechanicId: z.string().min(1),
  liftId: z.string().optional(),
  startsAt: z.string().min(1),
  notes: z.string().optional(),
});

export async function GET() {
  const appointments = await prisma.appointment.findMany({
    include: { vehicle: { include: { customer: true } }, workType: true, mechanic: true, lift: true },
    orderBy: { startsAt: "asc" },
  });
  return NextResponse.json({ appointments });
}

/**
 * Legt einen Termin fest an - üblicherweise auf Basis eines Vorschlags aus
 * /api/appointments/suggest. Prüft zur Sicherheit nochmal auf Überschneidungen,
 * falls sich zwischen Vorschlag und Bestätigung etwas geändert hat.
 */
export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = createSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { workTypeId, mechanicId, liftId, startsAt, ...rest } = parsed.data;

  const workType = await prisma.workType.findUniqueOrThrow({ where: { id: workTypeId } });
  const start = new Date(startsAt);
  const end = new Date(start.getTime() + workType.durationMinutes * 60_000);

  const conflict = await prisma.appointment.findFirst({
    where: {
      startsAt: { lt: end },
      endsAt: { gt: start },
      OR: [{ mechanicId }, ...(liftId ? [{ liftId }] : [])],
    },
  });

  if (conflict) {
    return NextResponse.json(
      { error: "Der gewählte Zeitraum ist inzwischen belegt. Bitte neue Vorschläge abrufen." },
      { status: 409 }
    );
  }

  const appointment = await prisma.appointment.create({
    data: {
      ...rest,
      workTypeId,
      mechanicId,
      liftId,
      startsAt: start,
      endsAt: end,
    },
  });

  return NextResponse.json({ appointment }, { status: 201 });
}
