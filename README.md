# Tilesmith Benchmark

Tilesmith Benchmark ist ein reproduzierbares Test- und Optimierungsgerüst für die technische Qualität von Game-Ready-Tiles. Es trennt **Scoring** (Qualitätsmessung) und **Pipeline-Optimierung** (Verbesserung der Eingabedaten) und macht die öffentlichen Benchmark-Artefakte versionierbar.

## Schnellstart

```bash
npm install
npm run generate
npm run ground-truth
npm run benchmark
npm run validate
```

Ohne externe Assets erzeugt der Generator zehn deterministische SVG-Basistiles als lokale Fallback-Fixtures. Lizenzierte Base-Tiles können unter `assets/base/` abgelegt werden; der Generator verwendet sie automatisch, wenn sie vorhanden sind.

## Struktur

| Bereich | Zweck |
|---|---|
| `docs/` | Öffentliche Spezifikation und Feldstudie |
| `public/benchmark/` | Dataset, Ground Truth und veröffentlichte Resultate |
| `scripts/` | Deterministische Daten- und Validierungsskripte |
| `runners/` | Scoring- und Pipeline-Optimierer |
| `config/` | Proprietäre, lokal erzeugte Parameter |
| `field-study-01/` | Aggregierte Analyse ohne Rohbilder |

Die Bewertungsstufen sind **Production** ab 92, **Review** von 78 bis 91,99 und **Reject** unter 78. Das öffentliche Schema und die Lizenzgrenzen sind in [`docs/QUALITY_SCORING.md`](docs/QUALITY_SCORING.md), [`docs/API.md`](docs/API.md) und [`docs/SCORING_INTERNALS.md`](docs/SCORING_INTERNALS.md) beschrieben.
