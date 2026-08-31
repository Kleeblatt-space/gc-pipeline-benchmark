# Scoring Internals

**Offenlegungsstufe:** Teil-offen; proprietär/NDA.

Dieses Dokument markiert bewusst die interne Grenze: Optimierungsbereiche, exakte Softmax-Gewichte, Candidate-Logik und die vollständige Loss-Funktion gehören zur geschlossenen Implementierung. Das öffentliche Repository enthält nur transparente Baseline-Formeln und reproduzierbare Fixture-Daten. Interne Parameter werden ausschließlich lokal unter `config/` erzeugt und sind per `.gitignore` ausgeschlossen.
