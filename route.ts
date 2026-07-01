# Werkstattlotse

Intelligente Terminplanung für KFZ-Reparaturwerkstätten. Berücksichtigt
Mechaniker-Verfügbarkeit, Hebebühnen und Arbeitsdauer automatisch bei der
Terminvergabe – siehe den vollständigen fachlichen Hintergrund im
Obsidian-Vault, Dokument **"Werkstattlotse - Konzept & Fahrplan"**.

## Wichtiger Hinweis zu diesem Stand

Dieses Projekt wurde von Claude in einer Cloud-Umgebung **ohne Zugriff auf
das npm-Registry** geschrieben (Netzwerk-Policy blockiert `registry.npmjs.org`)
und konnte deshalb **nicht** mit `npm install` / `npm run build` getestet
werden. Der Code wurde stattdessen manuell sorgfältig geschrieben und alle
TypeScript/TSX-Dateien wurden auf Syntaxfehler geprüft (23/23 Dateien ohne
Syntaxfehler) – eine echte Typprüfung mit den tatsächlichen Paketversionen
steht aber noch aus. **Bitte nach dem ersten `npm install` einmal
`npm run build` laufen lassen** und kleinere Fehler (z. B. bei Typen) bei
Bedarf selbst nachbessern oder mich in einer Session mit Repo-Zugriff
korrigieren lassen.

## Tech-Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- Zod für Validierung

## Setup

```bash
npm install
cp .env.example .env
# .env anpassen: DATABASE_URL auf eure Postgres-Instanz (z. B. Supabase) setzen

npx prisma migrate dev --name init
npm run prisma:seed   # legt Beispieldaten an (2 Mechaniker, 2 Hebebühnen, 5 Arbeitsarten, 1 Testkunde)

npm run dev            # startet auf http://localhost:3000
```

## Projektstruktur

```
app/
├── page.tsx                     # Startseite
├── (dashboard)/                 # Bereich mit Navigation
│   ├── calendar/                # Kalender + automatische Terminvorschläge (Kern-USP)
│   ├── customers/                # Kundenverwaltung
│   ├── vehicles/                 # Fahrzeugverwaltung
│   ├── mechanics/                # Mechaniker + Arbeitszeiten
│   ├── lifts/                    # Hebebühnen
│   └── work-types/               # Arbeitsarten mit Standarddauer
└── api/                          # API-Routen (CRUD + /appointments/suggest)
components/                       # UI-Komponenten
lib/
├── db.ts                         # Prisma-Client
└── scheduling.ts                 # Die automatische Terminlogik (Kern-USP)
prisma/
├── schema.prisma                 # Datenmodell
└── seed.ts                       # Beispieldaten
```

## Was ist schon drin (V1a laut Vault-Konzept)

- Kunden-, Fahrzeug-, Mechaniker-, Hebebühnen- und Arbeitsarten-Verwaltung (Listenansichten + API)
- Werkstatt-Öffnungszeiten und Mechaniker-Wochenarbeitszeiten im Datenmodell
- **Automatische Terminberechnung** (`lib/scheduling.ts`): Arbeitsart + Wunschzeitraum rein,
  das System schlägt freie Termine vor, die Mechaniker-Verfügbarkeit, Hebebühnen-Verfügbarkeit
  und Arbeitsdauer gleichzeitig berücksichtigen
- Kalenderseite mit Formular für diese Vorschläge plus Liste der nächsten Termine
- Konflikt-Check beim tatsächlichen Anlegen eines Termins (`POST /api/appointments`)

## Was bewusst noch fehlt

- **Login/Auth** – noch nicht implementiert (Supabase Auth oder Clerk laut Plan, siehe `.env.example`)
- **UI zum Anlegen** von Kunden/Fahrzeugen/Mechanikern/Hebebühnen/Arbeitsarten (aktuell nur über die API bzw. den Seed-Datensatz, keine Formulare)
- **UI, um einen Terminvorschlag tatsächlich zu bestätigen** (die Suggest-API liefert Vorschläge, das Bestätigen über `POST /api/appointments` ist als Route fertig, aber noch nicht an die Oberfläche angebunden)
- **V1b – KI-Spracheingabe**: laut Vault-Konzept der nächste Schritt direkt nach diesem Kern. Ein Freitextfeld, aus dem ein Sprachmodell Fahrzeug + Arbeitsart + Zeitraum extrahiert und an dieselbe `/api/appointments/suggest`-Route übergibt. Bewusst noch nicht gebaut, siehe Backlog-Dokument im Vault.
- Alles aus "Werkstattlotse - Ideen für spätere Versionen.md" im Vault (Online-Buchung, Erinnerungen, KI-Telefonassistent, ...)

## Ins Repo einspielen (manuell, da ich hier keinen Repo-Zugriff hatte)

Bestätigtes Ziel-Repo (Stand 2026-07-01, von Pierre bestätigt):
**https://github.com/KFZ-Saas-MaxPierre/SmartMechanic**

```bash
git clone https://github.com/KFZ-Saas-MaxPierre/SmartMechanic.git
# Inhalt dieses Ordners (werkstattlotse/) in den geklonten Ordner kopieren
cd SmartMechanic
git add .
git commit -m "Initial scaffold: Werkstattlotse V1a (Next.js + Prisma)"
git push origin main
```

## Danach

Sobald das im Repo liegt und jemand mit GitHub-Zugriff (z. B. Maximilian in seiner
eigenen Session) daran weiterarbeiten kann, sollte Vercel mit dem Repo verbunden
werden, damit jeder Push automatisch eine Live-Vorschau erzeugt.
