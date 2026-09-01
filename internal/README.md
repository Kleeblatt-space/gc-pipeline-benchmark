# TileSmith GC-Pipeline Benchmark – Internal Workspace

> **Wichtig:** Dieses Repository ist aktuell öffentlich. Der `internal/`-Bereich enthält deshalb absichtlich keine Secrets, Modelle, CNN-/ONNX-Gewichte, Rohdaten oder produktiven Tuning-Konfigurationen. Vertrauliche Inhalte dürfen erst nach Umstellung auf ein privates Repository oder nach Auskopplung in `tilesmith-core-internal` hinzugefügt werden.

## Zweck

Der Bereich reserviert die spätere Trennung zwischen öffentlichen Benchmark-Basics und proprietärer Core-Engine. Vorgesehene interne Bereiche sind `config/`, `docs/`, `runners/`, `field-study-01/` und `core-bridge/`.

## Empfohlener interner Workflow

| Schritt | Befehl/Aktion | Ergebnis |
|---|---|---|
| Benchmark erzeugen | `npm run generate` und `npm run ground-truth` | 60 öffentliche synthetische Fixtures |
| Runner A abstimmen | `npm run optimize:scoring` | lokale Scoring-Konfiguration, nicht versionieren |
| Runner B abstimmen | `npm run optimize:pipeline` | lokale Pipeline-Konfiguration, nicht versionieren |
| Qualität prüfen | `npm run benchmark` und `npm run validate` | `results.json` und Konsistenzprüfung |
| Public Export | `npm run export:public -- ../gc-pipeline-benchmark-public` | Allowlist-basierter Export ohne interne Pfade |

## Geheimhaltungsregeln

Die exakten Gewichte, proprietäre Loss-Details, Core-Bridge-Code, Modellgewichte, nicht anonymisierte Feldstudien-Rohdaten und echte Telemetrie-Entries gehören ausschließlich in ein privates Repository oder eine geschützte Datenbank. Vor jedem Export muss `scripts/export-public.sh` verwendet und der erzeugte Zielordner zusätzlich manuell geprüft werden.

## Sichtbarkeit

Die GitHub-Sichtbarkeit wird nicht automatisch durch dieses Repository geändert. Solange proprietäre Inhalte außerhalb dieses Repositories bleiben, kann der öffentliche Benchmark getrennt gepflegt werden. Vor dem Einfügen vertraulicher Inhalte muss ein Administrator die Sichtbarkeit auf **Private** stellen oder ein separates privates Core-Repository verwenden.
