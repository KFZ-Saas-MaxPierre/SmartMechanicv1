import { PageHeader } from "@/components/PageHeader";
import { Table, Th, Td, EmptyState } from "@/components/Table";
import { prisma } from "@/lib/db";

export default async function CustomersPage() {
  const customers = await prisma.customer.findMany({
    include: { vehicles: true },
    orderBy: { name: "asc" },
  });

  return (
    <div>
      <PageHeader title="Kunden" description="Übersicht aller Kunden und ihrer Fahrzeuge." />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Telefon</Th>
            <Th>E-Mail</Th>
            <Th>Fahrzeuge</Th>
          </tr>
        </thead>
        <tbody>
          {customers.length === 0 ? (
            <tr>
              <td colSpan={4}>
                <EmptyState label="Noch keine Kunden angelegt." />
              </td>
            </tr>
          ) : (
            customers.map((c) => (
              <tr key={c.id}>
                <Td>{c.name}</Td>
                <Td>{c.phone ?? "–"}</Td>
                <Td>{c.email ?? "–"}</Td>
                <Td>{c.vehicles.map((v) => `${v.make} ${v.model}`).join(", ") || "–"}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
