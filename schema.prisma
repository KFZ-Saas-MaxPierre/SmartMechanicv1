import { prisma } from "./db";

/**
 * Kern der automatischen Terminlogik (siehe USP in
 * "Werkstattlotse - Konzept & Fahrplan.md" im Vault):
 * Berechnet anhand von Mechaniker-Verfügbarkeit, Hebebühnen-Verfügbarkeit,
 * Werkstatt-Öffnungszeiten und Arbeitsdauer automatisch passende freie
 * Terminvorschläge - statt dass ein Mitarbeiter das manuell abgleicht.
 *
 * Dies ist eine erste, funktionsfähige Basisversion (V1a). Sie deckt den
 * Kernfall ab (ein Mechaniker, optional eine Hebebühne, ein Arbeitstyp).
 * Erweiterungen für später: mehrere Arbeitsarten pro Termin, Prioritäten,
 * Qualifikationen pro Mechaniker.
 */

export interface SuggestSlotsInput {
  workTypeId: string;
  desiredFrom: Date;
  desiredTo: Date;
  /** Optional: nur Vorschläge für einen bestimmten Mechaniker. */
  mechanicId?: string;
  /** Anzahl der gewünschten Vorschläge, Standard 10. */
  limit?: number;
}

export interface SuggestedSlot {
  start: Date;
  end: Date;
  mechanicId: string;
  mechanicName: string;
  liftId: string | null;
  liftName: string | null;
}

interface TimeWindow {
  start: Date;
  end: Date;
}

const SLOT_GRANULARITY_MINUTES = 15;

function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

function atMinutesOfDay(day: Date, minutesOfDay: number): Date {
  const result = new Date(day);
  result.setHours(0, 0, 0, 0);
  result.setMinutes(minutesOfDay);
  return result;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && bStart < aEnd;
}

/**
 * Schneidet die gebuchten Intervalle eines Tages aus einem
 * Verfügbarkeitsfenster heraus und liefert die verbleibenden freien
 * Teilintervalle zurück.
 */
function subtractBusyIntervals(
  window: TimeWindow,
  busy: TimeWindow[]
): TimeWindow[] {
  const sorted = [...busy].sort((a, b) => a.start.getTime() - b.start.getTime());
  const free: TimeWindow[] = [];
  let cursor = window.start;

  for (const interval of sorted) {
    if (interval.end <= cursor || interval.start >= window.end) continue;
    if (interval.start > cursor) {
      free.push({ start: cursor, end: interval.start < window.end ? interval.start : window.end });
    }
    if (interval.end > cursor) cursor = interval.end;
    if (cursor >= window.end) break;
  }

  if (cursor < window.end) {
    free.push({ start: cursor, end: window.end });
  }

  return free.filter((f) => f.end.getTime() - f.start.getTime() > 0);
}

export async function suggestAppointmentSlots(
  input: SuggestSlotsInput
): Promise<SuggestedSlot[]> {
  const limit = input.limit ?? 10;

  const workType = await prisma.workType.findUniqueOrThrow({
    where: { id: input.workTypeId },
  });

  const [workshopHours, mechanics, lifts, existingAppointments] = await Promise.all([
    prisma.workshopHours.findMany(),
    prisma.mechanic.findMany({
      where: {
        active: true,
        ...(input.mechanicId ? { id: input.mechanicId } : {}),
      },
      include: { shifts: true },
    }),
    workType.requiresLift ? prisma.lift.findMany({ where: { active: true } }) : Promise.resolve([]),
    prisma.appointment.findMany({
      where: {
        startsAt: { lt: input.desiredTo },
        endsAt: { gt: input.desiredFrom },
      },
    }),
  ]);

  const workshopHoursByWeekday = new Map(workshopHours.map((h) => [h.weekday, h]));
  const suggestions: SuggestedSlot[] = [];

  const dayCursor = new Date(input.desiredFrom);
  dayCursor.setHours(0, 0, 0, 0);

  dayLoop: while (dayCursor <= input.desiredTo) {
    // JS getDay(): 0 = Sonntag ... 6 = Samstag. Wir nutzen 0 = Montag ... 6 = Sonntag.
    const jsWeekday = dayCursor.getDay();
    const weekday = jsWeekday === 0 ? 6 : jsWeekday - 1;

    const hoursToday = workshopHoursByWeekday.get(weekday);
    if (!hoursToday) {
      dayCursor.setDate(dayCursor.getDate() + 1);
      continue;
    }

    const workshopWindow: TimeWindow = {
      start: atMinutesOfDay(dayCursor, parseTimeToMinutes(hoursToday.openTime)),
      end: atMinutesOfDay(dayCursor, parseTimeToMinutes(hoursToday.closeTime)),
    };

    for (const mechanic of mechanics) {
      const shiftToday = mechanic.shifts.find((s) => s.weekday === weekday);
      if (!shiftToday) continue;

      const shiftWindow: TimeWindow = {
        start: atMinutesOfDay(dayCursor, parseTimeToMinutes(shiftToday.startTime)),
        end: atMinutesOfDay(dayCursor, parseTimeToMinutes(shiftToday.endTime)),
      };

      const availableWindow: TimeWindow = {
        start: shiftWindow.start > workshopWindow.start ? shiftWindow.start : workshopWindow.start,
        end: shiftWindow.end < workshopWindow.end ? shiftWindow.end : workshopWindow.end,
      };
      if (availableWindow.start >= availableWindow.end) continue;

      const mechanicBusy = existingAppointments
        .filter((a) => a.mechanicId === mechanic.id)
        .map((a) => ({ start: a.startsAt, end: a.endsAt }));

      const freeWindows = subtractBusyIntervals(availableWindow, mechanicBusy);

      for (const free of freeWindows) {
        let candidateStart = new Date(
          Math.max(free.start.getTime(), input.desiredFrom.getTime())
        );
        // Auf das nächste Raster (z. B. 15 Minuten) aufrunden.
        const remainder = candidateStart.getMinutes() % SLOT_GRANULARITY_MINUTES;
        if (remainder !== 0) {
          candidateStart = new Date(
            candidateStart.getTime() + (SLOT_GRANULARITY_MINUTES - remainder) * 60_000
          );
        }

        while (
          candidateStart.getTime() + workType.durationMinutes * 60_000 <=
          free.end.getTime()
        ) {
          const candidateEnd = new Date(
            candidateStart.getTime() + workType.durationMinutes * 60_000
          );

          let chosenLift: { id: string; name: string } | null = null;
          if (workType.requiresLift) {
            const freeLift = lifts.find(
              (lift) =>
                !existingAppointments.some(
                  (a) =>
                    a.liftId === lift.id &&
                    overlaps(candidateStart, candidateEnd, a.startsAt, a.endsAt)
                )
            );
            if (!freeLift) {
              candidateStart = new Date(
                candidateStart.getTime() + SLOT_GRANULARITY_MINUTES * 60_000
              );
              continue;
            }
            chosenLift = { id: freeLift.id, name: freeLift.name };
          }

          suggestions.push({
            start: candidateStart,
            end: candidateEnd,
            mechanicId: mechanic.id,
            mechanicName: mechanic.name,
            liftId: chosenLift?.id ?? null,
            liftName: chosenLift?.name ?? null,
          });

          if (suggestions.length >= limit) break dayLoop;

          candidateStart = new Date(
            candidateStart.getTime() + SLOT_GRANULARITY_MINUTES * 60_000
          );
        }
      }
    }

    dayCursor.setDate(dayCursor.getDate() + 1);
  }

  suggestions.sort((a, b) => a.start.getTime() - b.start.getTime());
  return suggestions.slice(0, limit);
}
