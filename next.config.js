// Datenmodell für Werkstattlotse V1a
// Siehe Vault: "Werkstattlotse - Konzept & Fahrplan.md" für den fachlichen Hintergrund.

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Customer {
  id        String    @id @default(cuid())
  name      String
  phone     String?
  email     String?
  vehicles  Vehicle[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}

model Vehicle {
  id           String        @id @default(cuid())
  customerId   String
  customer     Customer      @relation(fields: [customerId], references: [id], onDelete: Cascade)
  make         String
  model        String
  licensePlate String
  appointments Appointment[]
  createdAt    DateTime      @default(now())
}

model Mechanic {
  id           String          @id @default(cuid())
  name         String
  active       Boolean         @default(true)
  shifts       MechanicShift[]
  appointments Appointment[]
  createdAt    DateTime        @default(now())
}

// Wiederkehrende Wochenarbeitszeit eines Mechanikers.
// weekday: 0 = Montag ... 6 = Sonntag
model MechanicShift {
  id         String   @id @default(cuid())
  mechanicId String
  mechanic   Mechanic @relation(fields: [mechanicId], references: [id], onDelete: Cascade)
  weekday    Int
  startTime  String // Format "HH:MM", z. B. "08:00"
  endTime    String // Format "HH:MM", z. B. "17:00"
}

model Lift {
  id           String        @id @default(cuid())
  name         String
  active       Boolean       @default(true)
  appointments Appointment[]
  createdAt    DateTime      @default(now())
}

model WorkType {
  id              String        @id @default(cuid())
  name            String
  durationMinutes Int
  requiresLift    Boolean       @default(true)
  appointments    Appointment[]
  createdAt       DateTime      @default(now())
}

// Öffnungszeiten der Werkstatt. weekday: 0 = Montag ... 6 = Sonntag
model WorkshopHours {
  id        String @id @default(cuid())
  weekday   Int    @unique
  openTime  String // "08:00"
  closeTime String // "18:00"
}

model Appointment {
  id         String   @id @default(cuid())
  vehicleId  String
  vehicle    Vehicle  @relation(fields: [vehicleId], references: [id], onDelete: Cascade)
  workTypeId String
  workType   WorkType @relation(fields: [workTypeId], references: [id])
  mechanicId String
  mechanic   Mechanic @relation(fields: [mechanicId], references: [id])
  liftId     String?
  lift       Lift?    @relation(fields: [liftId], references: [id])
  startsAt   DateTime
  endsAt     DateTime
  notes      String?
  createdAt  DateTime @default(now())

  @@index([mechanicId, startsAt])
  @@index([liftId, startsAt])
}
