# Quality Scoring

**Lizenz:** CC BY-SA 4.0. Dieses Dokument definiert die öffentliche Qualitätsoberfläche des Benchmarks.

## Gates

| Gate | Score | Bedeutung |
|---|---:|---|
| Production | ≥ 92 | Für eine Produktionspipeline geeignet |
| Review | 78–<92 | Manuelle Prüfung erforderlich |
| Reject | <78 | Nicht produktionsbereit |

Der Score wird aus sechs normalisierten Metriken gebildet: Seam, Border, Artifact, Pattern, Fidelity und Consistency. Die exakten proprietären Gewichte und Schwellenwerte werden nicht in diesem Dokument veröffentlicht.

Jede Benchmark-Version muss Dataset-Version, Generator-Version, Ground-Truth-Version und Ausführungszeitpunkt speichern. Scene-QC prüft zusätzlich, dass alle Tiles in einer repräsentativen Testszene ohne sichtbare Naht oder unerwartete Artefakte funktionieren.
