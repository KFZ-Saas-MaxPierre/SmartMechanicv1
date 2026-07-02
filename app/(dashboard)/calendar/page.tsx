import { PageHeader } from "@/components/PageHeader";
import { AppointmentSuggestions } from "@/components/AppointmentSuggestions";
import { Table, Th, Td, EmptyState } from "@/components/Table";
import { prisma } from "@/lib/db";

export default async function CalendarPage() {
  const [workTypes, appointments] = await Promise.all([
    prisma.workType.findMany({ orderBy: { name: "asc" } }),
    prisma.appointment.findMany({
      where: { startsAt: { gte: new Date() } },
      include: { vehicle: { include: { customer: true } }, workType: true, mechanic: true, lift: true },
      orderBy: { startsAt: "asc" },
      take: 20,
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Kalender"
        description="Automatische Terminvorschläge und die nächsten anstehenden Termine."
      />
      <AppointmentSuggestions workTypes={workTypes} />

      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-gray-900">Nächste Termine</h2>
        <Table>
          <thead>
            <tr>
              <Th>Zeit</Th>
              <Th>Kunde / Fahrzeug</Th>
              <Th>Arbeitsart</Th>
              <Th>Mechaniker</Th>
              <Th>Hebebühne</Th>
            </tr>
          </thead>
          <tbody>
            {appointments.length === 0 ? (
              <tr>
                <td colSpan={5}>
                  <EmptyState label="Keine anstehenden Termine." />
                </td>
              </tr>
            ) : (
              appointments.map((a) => (
                <tr key={a.id}>
                  <Td>
                    {new Date(a.startsAt).toLocaleString("de-AT", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Td>
                  <Td>
                    {a.vehicle.customer.name} · {a.vehicle.make} {a.vehicle.model}
                  </Td>
                  <Td>{a.workType.name}</Td>
                  <Td>{a.mechanic.name}</Td>
                  <Td>{a.lift?.name ?? "–"}</Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </div>
    </div>
  );
}
