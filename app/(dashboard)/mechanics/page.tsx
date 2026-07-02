import { PageHeader } from "@/components/PageHeader";
import { Table, Th, Td, EmptyState } from "@/components/Table";
import { prisma } from "@/lib/db";

const weekdayLabels = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

export default async function MechanicsPage() {
  const mechanics = await prisma.mechanic.findMany({
    include: { shifts: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Mechaniker" description="Mechaniker und ihre wöchentlichen Arbeitszeiten." />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Status</Th>
            <Th>Arbeitszeiten</Th>
          </tr>
        </thead>
        <tbody>
          {mechanics.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <EmptyState label="Noch keine Mechaniker angelegt." />
              </td>
            </tr>
          ) : (
            mechanics.map((m) => (
              <tr key={m.id}>
                <Td>{m.name}</Td>
                <Td>{m.active ? "Aktiv" : "Inaktiv"}</Td>
                <Td>
                  {m.shifts
                    .map((s) => `${weekdayLabels[s.weekday]} ${s.startTime}-${s.endTime}`)
                    .join(", ") || "–"}
                </Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
