import { PageHeader } from "@/components/PageHeader";
import { Table, Th, Td, EmptyState } from "@/components/Table";
import { prisma } from "@/lib/db";

export default async function VehiclesPage() {
  const vehicles = await prisma.vehicle.findMany({
    include: { customer: true },
    orderBy: { make: "asc" },
  });

  return (
    <div>
      <PageHeader title="Fahrzeuge" description="Übersicht aller erfassten Fahrzeuge." />
      <Table>
        <thead>
          <tr>
            <Th>Kennzeichen</Th>
            <Th>Marke / Modell</Th>
            <Th>Kunde</Th>
          </tr>
        </thead>
        <tbody>
          {vehicles.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <EmptyState label="Noch keine Fahrzeuge angelegt." />
              </td>
            </tr>
          ) : (
            vehicles.map((v) => (
              <tr key={v.id}>
                <Td>{v.licensePlate}</Td>
                <Td>{v.make} {v.model}</Td>
                <Td>{v.customer.name}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
