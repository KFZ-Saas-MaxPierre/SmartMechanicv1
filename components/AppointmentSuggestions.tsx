"use client";

import { useState } from "react";

interface WorkTypeOption {
  id: string;
  name: string;
  durationMinutes: number;
}

interface Suggestion {
  start: string;
  end: string;
  mechanicName: string;
  liftName: string | null;
}

/**
 * Formular für die automatische Terminberechnung: Arbeitsart + Wunschzeitraum
 * rein, das System schlägt passende freie Termine vor (Mechaniker +
 * Hebebühne + Arbeitsdauer werden dabei automatisch berücksichtigt).
 *
 * Das ist die V1a-Basis für den USP. Die geplante KI-Spracheingabe (V1b,
 * "Golf 7, Ölwechsel und Pickerl nächste Woche") setzt später genau hier an:
 * sie würde workTypeId + desiredFrom/desiredTo automatisch aus einem Satz
 * ableiten und an dieselbe /api/appointments/suggest-Route übergeben.
 */
export function AppointmentSuggestions({
  workTypes,
}: {
  workTypes: WorkTypeOption[];
}) {
  const [workTypeId, setWorkTypeId] = useState(workTypes[0]?.id ?? "");
  const [desiredFrom, setDesiredFrom] = useState("");
  const [desiredTo, setDesiredTo] = useState("");
  const [suggestions, setSuggestions] = useState<Suggestion[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuggestions(null);

    try {
      const res = await fetch("/api/appointments/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workTypeId, desiredFrom, desiredTo }),
      });
      if (!res.ok) throw new Error("Vorschläge konnten nicht berechnet werden.");
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5">
      <h2 className="mb-4 text-base font-semibold text-gray-900">
        Automatischen Termin vorschlagen lassen
      </h2>
      <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-4 sm:items-end">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-gray-500">
            Arbeitsart
          </label>
          <select
            value={workTypeId}
            onChange={(e) => setWorkTypeId(e.target.value)}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          >
            {workTypes.map((wt) => (
              <option key={wt.id} value={wt.id}>
                {wt.name} ({wt.durationMinutes} Min.)
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Von</label>
          <input
            type="date"
            value={desiredFrom}
            onChange={(e) => setDesiredFrom(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Bis</label>
          <input
            type="date"
            value={desiredTo}
            onChange={(e) => setDesiredTo(e.target.value)}
            required
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="sm:col-span-4">
          <button
            type="submit"
            disabled={loading || !workTypeId}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Berechne..." : "Termine vorschlagen"}
          </button>
        </div>
      </form>

      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {suggestions && (
        <div className="mt-5">
          {suggestions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Keine freien Termine im gewählten Zeitraum gefunden.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {suggestions.map((s, i) => (
                <li key={i} className="flex items-center justify-between py-2 text-sm">
                  <span>
                    {new Date(s.start).toLocaleString("de-AT", {
                      weekday: "short",
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    –{" "}
                    {new Date(s.end).toLocaleTimeString("de-AT", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-gray-500">
                    {s.mechanicName}
                    {s.liftName ? ` · ${s.liftName}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
