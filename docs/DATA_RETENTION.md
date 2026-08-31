# Data Retention & Hash-Only Telemetry

**Status:** Technische Referenz – produktive Fristen und Verantwortlichkeiten müssen vor Einsatz verbindlich festgelegt werden.

## Ziel

Die Telemetrie soll Missbrauchserkennung und aggregierte Betriebsmetriken ermöglichen, ohne Upload-Inhalte oder direkte Identifikatoren zu speichern. Die EU-Kommission nennt Datenminimierung und Speicherbegrenzung als zentrale GDPR-Prinzipien [1]. Ein Hash-Only-Design reduziert den Datenumfang, macht Hashes aber nicht automatisch anonym: Wenn ein Hash mit Zusatzinformationen verknüpft werden kann, bleibt er pseudonymisiert und damit datenschutzrechtlich relevant [2].

## Referenzfluss

```text
Request
  -> keine Speicherung des Upload-Bytes
  -> kanonische technische Metadaten
  -> HMAC-SHA-256 mit serverseitigem Secret
  -> kurzfristiges Ereignisprotokoll
  -> Aggregation
  -> Rohereignis löschen
  -> langfristig nur Aggregat ohne Token
```

Die HMAC-Variante ist der Referenz gegenüber einem ungesalzenen Hash vorzuziehen, weil ein geheimes, rotierbares Schlüsselmaterial einfache Offline-Wörterbuchangriffe erschwert. Das Secret darf niemals im Repository, in `results.json`, in Client-Code oder in Logs erscheinen. Die konkrete Sicherheitsbewertung bleibt vom Bedrohungsmodell und der Implementierung abhängig.

## Datenklassen und Fristen

| Datenklasse | Inhalt | Referenzfrist | Lösch-/Prüfmechanismus |
|---|---|---:|---|
| Request-Inhalt | Upload-Bytes, Bilddaten, freie Eingaben | 0 Minuten nach Verarbeitung | Streaming-Verarbeitung; kein persistenter Upload-Speicher |
| Kurzfristiges Ereignis | HMAC-Token, Zeitpunkt, Endpoint, Statuscode, Größenklasse | 72 Stunden | täglicher TTL-Job; Zugriff nur für Betriebssicherheit |
| Aggregat | Zählwerte nach Zeitfenster und Benchmark-Version | 90 Tage | periodische Aggregation; danach löschen oder neu begründen |
| Öffentliche Benchmark-Fixtures | synthetische Tiles, Ground Truth, aggregierte Ergebnisse | Versionsbezogen | Repository-Review und Lizenzprüfung |
| Zugangsdaten/Secrets | HMAC-Key und Infrastruktur-Secrets | bis Rotation/Widerruf | Secret Manager; sofortige Rotation bei Verdacht |

Die 72-Stunden-Frist entspricht dem im API-Entwurf beschriebenen Abruffenster für Scores, ist aber keine pauschale gesetzliche Vorgabe. Betreiber müssen Zweck, Rechtsgrundlage, Risiken und allfällige gesetzliche Aufbewahrungspflichten dokumentieren sowie Fristen regelmäßig überprüfen [1].

## Technischer Nachweis

Ein prüfbarer Implementierungsnachweis sollte pro Deployment dokumentieren: Secret-Version ohne Secret-Wert, HMAC-Algorithmus, Token-Schema, Felder des Ereignisses, TTL-Konfiguration, erfolgreiche Löschläufe, Zugriffskontrollen, Rotationstests und einen Beleg, dass keine Rohbytes in Logs oder Fehlerberichten auftauchen. Testdaten müssen künstlich sein und dürfen keine realen personenbezogenen Informationen enthalten.

## Grenzen und Betroffenenrechte

Hash-Only-Telemetrie ist kein Freibrief zur vollständigen Nichtbeachtung der DSGVO. Pseudonymisierte Daten können weiterhin personenbezogen sein; geeignete technische und organisatorische Maßnahmen, Transparenz und die Bearbeitung anwendbarer Betroffenenrechte bleiben erforderlich [2]. Eine echte Anonymisierung liegt erst vor, wenn eine Re-Identifizierung irreversibel ausgeschlossen ist [1].

## Referenzen

[1]: https://commission.europa.eu/law/law-topic/data-protection/information-business-and-organisations/principles-gdpr_en "European Commission: Principles of personal data processing under the GDPR"
[2]: https://www.edpb.europa.eu/system/files/2025-01/edpb_guidelines_202501_pseudonymisation_en.pdf "EDPB Guidelines 01/2025 on Pseudonymisation"
