import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Werkstattlotse",
  description: "Intelligente Terminplanung für KFZ-Reparaturwerkstätten",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
