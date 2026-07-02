import { PageHeader } from "@/components/PageHeader";
import { Table, Th, Td, EmptyState } from "@/components/Table";
import { prisma } from "@/lib/db";

export default async function WorkTypesPage() {
  const workTypes = await prisma.workType.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="Arbeitsarten" description="Arbeitsarten mit Standarddauer und Hebebühnen-Bedarf." />
      <Table>
        <thead>
          <tr>
            <Th>Name</Th>
            <Th>Dauer</Th>
            <Th>Hebebühne nötig</Th>
          </tr>
        </thead>
        <tbody>
          {workTypes.length === 0 ? (
            <tr>
              <td colSpan={3}>
                <EmptyState label="Noch keine Arbeitsarten angelegt." />
              </td>
            </tr>
          ) : (
            workTypes.map((w) => (
              <tr key={w.id}>
                <Td>{w.name}</Td>
                <Td>{w.durationMinutes} Min.</Td>
                <Td>{w.requiresLift ? "Ja" : "Nein"}</Td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
}
