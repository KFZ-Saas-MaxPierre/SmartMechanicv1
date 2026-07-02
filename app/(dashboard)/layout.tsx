import Link from "next/link";

const navItems = [
  { href: "/calendar", label: "Kalender" },
  { href: "/customers", label: "Kunden" },
  { href: "/vehicles", label: "Fahrzeuge" },
  { href: "/mechanics", label: "Mechaniker" },
  { href: "/lifts", label: "Hebebühnen" },
  { href: "/work-types", label: "Arbeitsarten" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-200 bg-white">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 px-4 py-3 text-sm">
          <Link href="/" className="font-semibold text-gray-900">
            Werkstattlotse
          </Link>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-gray-600 hover:text-brand-600">
              {item.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
