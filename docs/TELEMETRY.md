# TileSmith Telemetry & Optimization Dataset

**Version:** 1.0.0  
**Last Updated:** 2026-09-01  
**Status:** Active  
**License:** Dieses Dokument steht unter CC BY-SA 4.0; das Telemetrie-Schema steht unter MIT. Rohe Telemetrieeinträge sind proprietär.

> Dieses Dokument ist eine technische Referenz und ersetzt keine individuell geprüfte Datenschutzerklärung oder Rechtsberatung.

## 1. Zweck und Grenzen

TileSmith sammelt über die Telemetrie **keine Bilder, Pixeldaten oder direkt identifizierenden personenbezogenen Daten**. Mit ausdrücklicher Einwilligung kann ein rein numerischer Datensatz aus Pipeline-Parametern und messbaren Qualitätsergebnissen erhoben werden. Gespeichert werden Instrumentenwerte, nicht die Bildinhalte.

| Datenpunkt | Beispiel | Behandlung |
|---|---|---|
| HMAC-/Hash-Referenz | `sha256:a3f8c2...` | keine Bildrekonstruktion; maximale TTL 72 Stunden |
| Bildabmessungen und Format | `512x512`, `png` | technische Metadaten |
| Sechs Metriken vor/nachher | `seam: 62` | abstrakte Zahlen |
| Pipeline-Parameter und Step Order | `crop.margin_px: 2` | Konfigurationswerte |
| Verarbeitungszeit und Pipeline-Version | `342ms`, `2.5.0` | technische Metadaten |

Es werden niemals Originalbilder, Thumbnails, Pixelarrays, Farbhistogramme, Feature-Vektoren, Dateinamen, Pfade, Namen, E-Mail-Adressen, IP-Adressen oder Account-IDs als Telemetrieinhalt gespeichert.

## 2. Opt-in-Modell

Telemetrie ist standardmäßig deaktiviert. Nutzer müssen sie aktiv einschalten, können die Einwilligung jederzeit widerrufen und erhalten einen Link auf dieses Dokument. Für eine API kann die Aktivierung beispielsweise über `POST /v1/keys/{key_id}/telemetry` mit `{ "enabled": true }` erfolgen. Der Widerruf erfolgt über die Anwendung, `DELETE /v1/keys/{key_id}/telemetry` oder `privacy@tilesmith.kleeblatt.space`.

Ein Widerruf löst die Löschung zuordenbarer kurzfristiger Einträge innerhalb von 30 Tagen aus. Der konkrete Betreiber muss dafür eine belastbare Zuordnung, Löschroutine und Ausführungskontrolle bereitstellen.

## 3. Optimierungszyklus

Opt-in-Ereignisse werden zunächst kurzfristig gespeichert, anschließend aggregiert und ohne Rohereignisse zur Verbesserung von Runner B verwendet. Veröffentlicht werden ausschließlich Schwellenwert- und Aggregatstatistiken, etwa Parameterkorrelationen, erfolgreiche Step Orders und Fehlerverteilungen. Kleine Gruppen dürfen nicht veröffentlicht werden, wenn eine Zuordnung einzelner Runs dadurch erleichtert würde.

## 4. Aggregierte öffentliche Daten

Öffentliche Aggregate werden erst nach Disclosure- und Re-Identifikationsprüfung veröffentlicht. Die vorgesehenen Ausgabepfade sind [`param-correlations.json`](../telemetry/aggregated/param-correlations.json), [`best-step-orders.json`](../telemetry/aggregated/best-step-orders.json) und [`profile-benchmarks.json`](../telemetry/aggregated/profile-benchmarks.json). Aktuell enthalten diese Dateien nur leere Fixtures und keine reale Nutzungsstatistik.

## 5. Aufbewahrung und Infrastruktur

| Datenart | Speicher | Frist |
|---|---|---:|
| Hash-/HMAC-Referenz | EU-Datenbank | 72 Stunden |
| Metriken, Parameter, Step Order | EU-Datenbank | 24 Monate, sofern Zweck und Rechtsgrundlage fortbestehen |
| Aggregierte Korrelationen | öffentlich | versionsbezogen/permanent |

Die tatsächliche Infrastruktur, Verschlüsselung, Zugriffskontrolle, Secret-Rotation, Drittlandtransfers und Löschjobs müssen vom jeweiligen Betreiber verbindlich dokumentiert werden. Siehe [`DATA_RETENTION.md`](DATA_RETENTION.md).

## 6. Hypothetisches Revenue-Share-Modell

Ein mögliches Revenue-Share-Programm ist **nicht aktiv und keine Zusage**. Eine spätere Lizenzierung aggregierter Datensätze, mögliche Beitragsquoten, Mindestzahlungen, Schwellenwerte und Verteilungslogik würden nur nach separater vertraglicher Regelung, transparenter Einwilligung und rechtlicher Prüfung gelten. Bis dahin gibt es weder eine Vergütungspflicht noch einen Anspruch auf künftige Einnahmen.

## 7. Rechtsgrundlage und Kontakt

Für die geplante freiwillige Produktverbesserung ist **Einwilligung nach Art. 6 Abs. 1 lit. a DSGVO** vorgesehen. Zweckbindung, Datenminimierung, Transparenz, Widerruf und Löschung sind in der produktiven Datenschutzerklärung des Betreibers zu konkretisieren. Datenschutzanfragen: `privacy@tilesmith.kleeblatt.space`; technische Fragen: GitHub Issue.

## Referenzen

[1]: https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en "European Commission: Data protection explained"
[2]: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en "European Commission: Principles of personal data processing under the GDPR"
[3]: https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf "EDPB Guidelines 01/2025 on Pseudonymisation"
