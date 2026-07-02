import Link from "next/link";

const sections = [
  { href: "/calendar", label: "Kalender", description: "Automatische Terminvorschläge und nächste Termine" },
  { href: "/customers", label: "Kunden", description: "Kundenverwaltung" },
  { href: "/vehicles", label: "Fahrzeuge", description: "Fahrzeugverwaltung" },
  { href: "/mechanics", label: "Mechaniker", description: "Mechaniker und Arbeitszeiten" },
  { href: "/lifts", label: "Hebebühnen", description: "Hebebühnen-Verwaltung" },
  { href: "/work-types", label: "Arbeitsarten", description: "Arbeitsarten mit Standarddauer" },
];

export default function HomePage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-3xl font-semibold text-gray-900">Werkstattlotse</h1>
      <p className="mt-2 text-sm text-gray-500">
        Intelligente Terminplanung für KFZ-Reparaturwerkstätten.
      </p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-lg border border-gray-200 bg-white p-5 hover:border-brand-500"
          >
            <h2 className="text-base font-semibold text-gray-900">{s.label}</h2>
            <p className="mt-1 text-sm text-gray-500">{s.description}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
