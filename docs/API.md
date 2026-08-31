# Scoring API

**Lizenz:** MIT.

## `POST /v1/score`

Request:

```json
{"tile_url":"https://example.test/tile.png","metrics":{"seam":0.98,"border":0.95,"artifact":1,"pattern":0.9,"fidelity":0.96,"consistency":0.94}}
```

Response:

```json
{"score":95.6,"gate":"Production","benchmark_version":"0.1.0","expires_at":"2026-09-04T12:00:00Z"}
```

Scores sind nach der Erstellung 72 Stunden abrufbar. Authentifizierung, Rate Limits und Transportverschlüsselung müssen durch die deployende API-Schicht ergänzt werden.
