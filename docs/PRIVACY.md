# Privacy & GDPR

**Status:** Arbeitsentwurf – vor produktivem Einsatz durch eine qualifizierte Datenschutzberatung prüfen.  
**Geltungsbereich:** Tilesmith Benchmark, öffentliche Repository-Artefakte und die beschriebene Scoring-API.

> Dieses Dokument beschreibt die technische Zielarchitektur und ersetzt keine Datenschutzerklärung, Auftragsverarbeitungsvereinbarung oder rechtliche Prüfung.

## Grundsatz

Der Benchmark ist nach **Datenminimierung**, Zweckbindung und Speicherbegrenzung gestaltet. Die EU-Kommission beschreibt personenbezogene Daten als Informationen über eine identifizierte oder identifizierbare lebende Person; auch pseudonymisierte oder verschlüsselte Daten können personenbezogen bleiben, wenn eine Re-Identifizierung möglich ist [1].

## Was wir nicht speichern

Tilesmith speichert in der öffentlichen Benchmark-Ausführung grundsätzlich keine Namen, E-Mail-Adressen, Kontaktdaten, Kontoinformationen, vollständigen IP-Adressen, Cookies, Werbekennungen, Upload-Dateien, Originalbilder oder freien Texteingaben. Rohdaten aus der Feldstudie werden nicht in das Repository übernommen. `field-study-01/raw-data/` ist deshalb gitignored.

| Datenkategorie | Öffentliche Speicherung | Zweck |
|---|---:|---|
| Tile-Dateien des synthetischen CC0-Datasets | Ja | Reproduzierbare Qualitätsprüfung |
| Ground Truth und aggregierte Scores | Ja | Benchmark-Auswertung |
| Bild- oder Upload-Inhalte von Nutzern | Nein | Nicht erforderlich für die öffentliche Fixture-Auswertung |
| Identifizierende Nutzerdaten | Nein | Kein Zweck im öffentlichen Benchmark |
| Technische Hashes | Nur falls ein separater Dienst sie aktiviert | Korrelation und Abuse-Erkennung, nicht Inhaltsrekonstruktion |

## Anonymisierte Telemetrie (Opt-in)

Die optionale Telemetrie ist standardmäßig deaktiviert und wird nur nach ausdrücklicher Einwilligung aktiviert. Sie verarbeitet ausschließlich technische Metadaten, abstrakte Metrikwerte, Pipeline-Parameter und eine kurzfristige Hash-/HMAC-Referenz. Es werden keine Bilder, Pixeldaten, Dateinamen, Pfade oder direkten Identifikatoren übertragen oder gespeichert. Der vollständige Datenkatalog, das Opt-in-Modell und die Aufbewahrungslogik stehen in [`TELEMETRY.md`](TELEMETRY.md); das maschinenlesbare Schema liegt unter [`../telemetry/schema.json`](../telemetry/schema.json).

Ein Hash ist **keine automatische Anonymisierung**. Ein stabiler oder mit Zusatzinformationen verknüpfbarer Hash kann weiterhin pseudonymisierte personenbezogene Information sein [1] [3]. Deshalb gelten für kurzfristige Telemetrie weiterhin Zweckbindung, Zugriffsbeschränkung, dokumentierte Löschfristen und Sicherheitskontrollen. Rohereignisse werden nicht unter `telemetry/private/` versioniert; der Ordner ist per `.gitignore` vollständig geschützt.

## Verantwortlichkeiten und Rechte

Der konkrete Betreiber eines deployten API-Dienstes muss Verantwortlicher, Rechtsgrundlage, Empfänger, Drittlandtransfers, Betroffenenrechte, Kontaktadresse und Beschwerdestelle in einer eigenen Datenschutzerklärung festlegen. Die DSGVO verlangt transparente Informationen unter anderem zu Zweck, Datenkategorien, Rechtsgrundlage, Speicherdauer und Rechten [2].

## Sicherheitsprinzipien

Die Referenzimplementierung trennt öffentliche Artefakte von proprietären Konfigurationen, speichert keine Uploads in den Fixtures und erzeugt nur aggregierte Resultate. Produktive Betreiber müssen zusätzlich Zugriffskontrollen, Verschlüsselung, Protokollierung, Löschjobs und eine dokumentierte Datenschutz-Folgenabschätzung prüfen, soweit das Risiko dies verlangt.

## Referenzen

[1]: https://commission.europa.eu/law/law-topic/data-protection/data-protection-explained_en "European Commission: Data protection explained"
[2]: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en "European Commission: Principles of personal data processing under the GDPR"
[3]: https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf "EDPB Guidelines 01/2025 on Pseudonymisation"
