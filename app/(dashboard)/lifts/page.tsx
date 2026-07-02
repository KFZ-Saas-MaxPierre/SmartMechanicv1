import { PageHeader } from "@/components/PageHeader";
import { Table, Th, Td, EmptyState } from "@/components/Table";
import { prisma } from "@/lib/db";

export default async function LiftsPage() {
  const lifts = await prisma.lift.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Hebebühnen" description="Übersicht aller Hebebühnen der Werkstatt." />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {lifts.length === 0 ? (
            <tr>
              <td colSpan={2}>
                <EmptyState label="Noch keine Hebebühnen angelegt." />
              </td>
            </tr>
          ) : (
            lifts.map((l) => (
              <tr key={l.id}>
                <Td>{l.name}</Td>
                <Td>{l.active ? "Aktiv" : "Inaktiv"}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
