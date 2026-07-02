import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Öffnungszeiten Mo-Fr 08:00-18:00, Sa 08:00-12:00
  await prisma.workshopHours.createMany({
    data: [
      { weekday: 0, openTime: "08:00", closeTime: "18:00" },
      { weekday: 1, openTime: "08:00", closeTime: "18:00" },
      { weekday: 2, openTime: "08:00", closeTime: "18:00" },
      { weekday: 3, openTime: "08:00", closeTime: "18:00" },
      { weekday: 4, openTime: "08:00", closeTime: "18:00" },
      { weekday: 5, openTime: "08:00", closeTime: "12:00" },
    ],
    skipDuplicates: true,
  });

  const [mechanikerAnna, mechanikerBen] = await Promise.all([
    prisma.mechanic.create({
      data: {
        name: "Anna Berger",
        shifts: {
          create: [0, 1, 2, 3, 4].map((weekday) => ({
            weekday,
            startTime: "08:00",
            endTime: "16:00",
          })),
        },
      },
    }),
    prisma.mechanic.create({
      data: {
        name: "Ben Hofer",
        shifts: {
          create: [1, 2, 3, 4, 5].map((weekday) => ({
            weekday,
            startTime: "10:00",
            endTime: weekday === 5 ? "12:00" : "18:00",
          })),
        },
      },
    }),
  ]);

  await prisma.lift.createMany({
    data: [{ name: "Bühne 1" }, { name: "Bühne 2" }],
  });

  await prisma.workType.createMany({
    data: [
      { name: "Ölwechsel", durationMinutes: 45, requiresLift: true },
      { name: "Bremsen (vorne)", durationMinutes: 90, requiresLift: true },
      { name: "Service klein", durationMinutes: 60, requiresLift: true },
      { name: "§57a Pickerl", durationMinutes: 40, requiresLift: true },
      { name: "Diagnose (ohne Hebebühne)", durationMinutes: 30, requiresLift: false },
    ],
  });

  const customer = await prisma.customer.create({
    data: {
      name: "Max Mustermann",
      phone: "+43 660 1234567",
      email: "max.mustermann@example.at",
      vehicles: {
        create: [{ make: "VW", model: "Golf 7", licensePlate: "S-123AB" }],
      },
    },
  });

  console.log("Seed abgeschlossen:", {
    mechaniker: [mechanikerAnna.name, mechanikerBen.name],
    kunde: customer.name,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
