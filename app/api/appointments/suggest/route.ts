import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { suggestAppointmentSlots } from "@/lib/scheduling";

const suggestSchema = z.object({
  workTypeId: z.string().min(1),
  desiredFrom: z.string().min(1),
  desiredTo: z.string().min(1),
  mechanicId: z.string().optional(),
});

export async function POST(request: NextRequest) {
  const json = await request.json();
  const parsed = suggestSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Ungültige Eingabe.", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { workTypeId, desiredFrom, desiredTo, mechanicId } = parsed.data;

  const suggestions = await suggestAppointmentSlots({
    workTypeId,
    desiredFrom: new Date(desiredFrom),
    desiredTo: new Date(desiredTo),
    mechanicId,
  });

  return NextResponse.json({ suggestions });
}
