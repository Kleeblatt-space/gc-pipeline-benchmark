# Telemetry Directory

Dieses Verzeichnis enthält die technische Telemetrie-Schnittstelle des Benchmarks. Das Konzept ist eine **Parameter-Outcome-Beziehung**: gespeichert werden numerische Scores, Pipeline-Parameter, Step Order und technische Laufzeitdaten, niemals Bildinhalte.

| Pfad | Zweck | Lizenz/Status |
|---|---|---|
| `schema.json` | JSON-Schema für einzelne Opt-in-Einträge | MIT |
| `optimization-entry.example.json` | Schema-konformes Beispiel ohne reale Bild- oder Nutzerdaten | MIT |
| `aggregated/` | Öffentlich veröffentlichte, aggregierte Statistiken | CC0; nur nach Disclosure-Review |
| `private/` | Lokaler oder verschlüsselter Speicher für Roh-Entries | nicht versioniert |
| `../docs/TELEMETRY.md` | Opt-in, Zweck, Aufbewahrung und Rechte | CC BY-SA 4.0 |

Die Telemetrie ist **off by default**. Vor einer produktiven Erfassung müssen Einwilligungsdialog, Widerruf, Löschjob, Zugriffskontrolle, Secret-Rotation und eine Betreiber-Datenschutzerklärung implementiert und geprüft werden. Die Aggregatdateien in diesem Repository sind bewusst leere, maschinenlesbare Ausgangsdateien und dürfen nicht als reale Nutzungsstatistik interpretiert werden.

## Datenschutzgrenze

Ein Hash oder HMAC ist keine automatische Anonymisierung. `run_id` und gegebenenfalls `api_key_hash` dürfen nur für den dokumentierten Zweck und innerhalb der festgelegten TTL verarbeitet werden. Roh-Entries gehören in `private/raw-entries/` oder eine geschützte Datenbank, niemals in Git.
