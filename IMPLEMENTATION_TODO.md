# Umsetzung ToDo

Stand: 21.08.2026

## Aktueller Stand

- [x] Angular-21-Prototyp und vorhandenes Designsystem analysiert.
- [x] Produktions-Build mit `npm run build` erzeugt (`dist/app`).
- [x] Vorhandener Hauptablauf identifiziert: Dashboard, Personen, Teams, Konfiguration, Animation und Ergebnis.
- [x] Vorauswahl verfügbarer Personen und nicht voller Teams ist vorhanden.
- [x] Teamlöschung setzt bestehende Zuweisungen bereits zurück.
- [x] Das Ergebnis wird vor Beginn der Animation berechnet.
- [x] Lint ist sauber. Alle ESLint-Fehler sind behoben.

## P0: Fachliche Basis

### 1. Domänenmodell und Invarianten absichern

- [x] `Person`, `Team`, `Assignment`, `DrawPlan` und Draw-Status typsicher modellieren.
- [x] Name als Pflichtfeld, eindeutige IDs und positive ganzzahlige Teamkapazität validieren.
- [x] Nur existierende Team-IDs als Zuweisung akzeptieren.
- [x] Kapazitätsreduktion unter die aktuelle Belegung verhindern und im bestehenden Design erklären.
- [x] Abhängige Auswahl- und Ergebnisreferenzen bei Löschungen bereinigen.
- [x] Abgeleitete Kennzahlen korrigieren: Gesamtkapazität, belegte und tatsächlich freie Plätze.

Akzeptanz: Der Store kann keine doppelten IDs, verwaisten Zuweisungen, negativen Kapazitäten oder stillen Überbelegungen erzeugen.

### 2. Faire, deterministische Draw-Engine implementieren

- [x] Auslosungslogik als pure, UI-unabhängige Funktion extrahieren.
- [x] Personen mit Fisher-Yates statt `sort(() => Math.random() - 0.5)` mischen.
- [x] Seedbaren Zufallszahlengenerator verwenden und den Seed im Draw-Plan speichern.
- [x] Teams nach geringster aktueller Belegung gleichmäßig befüllen; Gleichstände zufällig und fair auflösen.
- [x] Bestehende Belegung und Restkapazität jedes Teams berücksichtigen.
- [x] Volle, gelöschte oder nicht ausgewählte Teams sicher ausschließen.
- [x] Zugewiesene, gelöschte oder nicht ausgewählte Personen sicher ausschließen.

Akzeptanz: Bei 10 Personen und 3 gleichwertigen Teams entsteht eine Verteilung 4/3/3; keine Person wird doppelt und kein Team über Kapazität zugewiesen. Gleicher Snapshot plus Seed liefert dasselbe Ergebnis.

### 3. Draw-Validierung und transaktionalen Ablauf einführen

- [x] Vor dem Start mindestens eine verfügbare Person und ein verfügbares Team verlangen.
- [x] Ausgewählte Personen gegen die freien Plätze der ausgewählten Teams prüfen.
- [x] Bei Überkapazität Start deaktivieren und einen verständlichen Hinweis im bestehenden Error-Stil zeigen.
- [x] Unveränderlichen `DrawPlan` mit Seed, Datenversion, Teilnehmern, Kapazitäten und Ergebnis erzeugen.
- [x] Plan vor dem Anwenden erneut validieren und Ergebnis atomar übernehmen.
- [x] Änderungen während der Animation sperren oder den Plan kontrolliert invalidieren.
- [x] Abbruch verwirft Plan und Timer vollständig, ohne Zuweisungen zu verändern.

Akzeptanz: Die Animation kann das fachliche Ergebnis nicht verändern; ungültige oder veraltete Pläne werden niemals angewendet.

### 4. Personen vollständig verwalten

- [x] Vorhandene Aktionen `ADD PERSON`, Edit und Hinzufügen-Karte mit einem designkonformen Formular verbinden.
- [x] Anlegen, Bearbeiten und Löschen inklusive Validierungs- und Bestätigungszuständen umsetzen.
- [x] Optionales Bild hinzufügen, ersetzen und entfernen können.
- [x] Dateityp und Dateigröße validieren; defekte Bilder auf den vorhandenen Fallback zurückführen.
- [x] Zugewiesen-/Nicht-zugewiesen-Status unmittelbar in allen Ansichten aktualisieren.
- [x] Löschen und manuelles Aufheben einer Zuweisung konsistent behandeln.

Akzeptanz: Sämtliche CRUD-Aktionen funktionieren zuverlässig und spiegeln sich ohne Reload in Dashboard, Teams und Auslosung wider.

### 5. Teams vollständig verwalten

- [x] `CREATE NEW TEAM`, `INITIALIZE NEW TEAM` und `MANAGE` funktional anbinden.
- [x] Anlegen, Umbenennen, Kapazität bearbeiten und Löschen umsetzen.
- [x] Freie, teilweise belegte und volle Zustände aus einer gemeinsamen Domänenlogik ableiten.
- [x] Vor Teamlöschung Zahl der betroffenen Personen anzeigen.
- [x] Beim Löschen alle Mitglieder freigeben und abhängige Draw-Daten bereinigen.

Akzeptanz: Teamänderungen aktualisieren Kapazitätsanzeige, Auswahlzustand und Personenstatus unmittelbar; volle Teams sind nicht auswählbar.

## P1: Vollständiger Produktablauf

### 6. Auswahlseite vervollständigen

- [x] Standardmäßig alle unzugewiesenen Personen und alle nicht vollen Teams auswählen.
- [x] Einzel-, Alle- und Keine-Auswahl für beide Listen robust halten.
- [ ] Ausgewählt, nicht ausgewählt und gesperrt visuell sowie semantisch unterscheiden.
- [ ] Bei gesperrten Einträgen den Grund `ASSIGNED` beziehungsweise `FULL` anzeigen.
- [ ] Zusammenfassung für ausgewählte Personen, Teams, freie Plätze und Differenz ergänzen.
- [ ] Leere Listen und keine verfügbaren Personen/Teams im vorhandenen Designsystem darstellen.

Akzeptanz: Der Start-Button ist genau dann aktiv, wenn die Auswahl vollständig und kapazitätsseitig gültig ist.

### 7. Ergebnisgebundene Auslosungsanimation umsetzen

- [x] Phasen `Start -> Randomisierung -> Spannung -> Auflösung -> Ergebnis` explizit modellieren.
- [ ] Personen- und Teamwechsel ausschließlich aus dem vorberechneten Draw-Plan speisen.
- [ ] Zuordnungen kontrolliert und schrittweise enthüllen.
- [x] Deterministische Dauer und echten Fortschritt statt zufälliger Prozentwerte verwenden.
- [ ] Vorhandene Scanline-, Glow-, Scramble- und Terminal-Effekte beibehalten.
- [ ] Optionales Überspringen führt ohne Neuberechnung zum identischen Ergebnis.

Akzeptanz: Sichtbare Zuordnungen und finales Ergebnis stimmen in jedem Frame mit demselben Draw-Plan überein; Abbruch hinterlässt keine Zuweisungen.

### 8. Ergebnisansicht vervollständigen

- [x] Nur tatsächlich beteiligte Teams sicher darstellen.
- [ ] Neue und bereits bestehende Mitglieder entsprechend dem Design klar unterscheiden.
- [ ] Anzahl zugewiesener Personen, Teams und verbleibender Plätze anzeigen.
- [ ] Vollständige, partielle, leere, ungültige und abgebrochene Ergebnisse abbilden.
- [ ] Fehlende oder zwischenzeitlich gelöschte Entitäten ohne Laufzeitfehler behandeln.
- [ ] Aktionen für neue Auslosung und Rückkehr zur Übersicht ergänzen.

Akzeptanz: Für jede neue Person ist eindeutig erkennbar, welchem Team sie zugewiesen wurde; ohne gültiges Ergebnis wird kein Erfolg angezeigt.

### 9. Zustands- und Navigationsmodell absichern

- [x] Workflow `idle -> configuring -> prepared -> animating -> completed|aborted|failed` einführen.
- [x] Ungültige direkte Navigation zur Animation oder zum Ergebnis verhindern.
- [x] Navigation während einer laufenden Animation sperren oder bestätigen lassen.
- [ ] Empty, Loading, Disabled, Hover, Focus, Selected, Deselected, Locked, Full, Assigned, Unassigned, Animation, Completed und Error State prüfen und ergänzen.
- [ ] Fehler global beziehungsweise in der aktuell sichtbaren Ansicht anzeigen, nicht in einer unerreichbaren Zielansicht.

Akzeptanz: Jeder erlaubte Übergang besitzt einen definierten UI-Zustand; Reload, Abbruch und Navigation erzeugen keine inkonsistenten Zwischenzustände.

### 10. Persistenz ergänzen

- [x] Persistenzstrategie festlegen: zunächst lokaler Repository-Adapter, später optional API.
- [x] Personen, Teams, Zuweisungen und letzte abgeschlossene Auslosung speichern.
- [x] Persistierte Daten beim Laden validieren und versionieren.
- [x] Lade- und Speicherfehler im bestehenden Design darstellen.
- [x] Draw-Ergebnis atomar persistieren.

Akzeptanz: Gültige Daten und Zuweisungen überleben einen Reload; beschädigte Daten führen zu einem kontrollierten Fehlerzustand.

## P2: Design Fidelity, Architektur und Qualität

### 11. Design-Fidelity systematisch abnehmen

- [ ] Referenz-Screenshots und Ziel-Viewports als verbindliche Abnahmebasis erfassen. Das Design zur Anwendung wurde im `design` Verzeichnis abgelegt.
- [ ] Bestehende Farben, Typografie, Icons, Abstände, Karten und visuelle Hierarchie unverändert übernehmen.
- [ ] Fehlende Typografie-Tokens (`text-*`) definieren und wirkungslose Utility-Klassen korrigieren.
- [ ] Harte Farbwerte nur dort belassen, wo sie Teil der Vorlage sind; ansonsten vorhandene Tokens verwenden.
- [ ] Desktop-Resize und bestehende Breakpoints für jede Ansicht prüfen.
- [ ] Alle Hauptansichten und relevanten Zustände manuell mit den Referenz-Screenshots vergleichen.

Akzeptanz: Die Hauptansichten stimmen an den definierten Viewports ohne unbeabsichtigte Layout-, Farb- oder Typografieabweichung mit den freigegebenen Referenzbildern überein.

### 12. Architektur bereinigen

- [ ] Stammdaten, Persistenz, Auswahl, Draw-Engine und Workflow-State trennen.
- [ ] Komponenten nur readonly Signals plus definierte Commands konsumieren lassen.
- [ ] Wiederholte Mitglieder-, Kapazitäts- und Statusberechnungen zentralisieren.
- [ ] Timer an den Angular-Lifecycle binden und zuverlässig aufräumen.
- [ ] Entscheidung für Router oder validierte interne State Machine dokumentieren und konsistent umsetzen.

Akzeptanz: Fachlogik ist unabhängig von Angular-Komponenten strukturiert; UI-Komponenten enthalten keine duplizierte Draw- oder Kapazitätslogik.

### 13. Codequalität und Build absichern

- [x] Aktuelle acht ESLint-Fehler beheben.
- [x] Produktions-Build nach größeren Umsetzungsschritten prüfen.
- [ ] Vollständigen Ablauf vor der Freigabe manuell durchspielen.

Akzeptanz: Lint und Produktions-Build laufen reproduzierbar ohne Fehler; der vollständige Hauptablauf funktioniert bei der manuellen Abnahme.

## Definition Of Done

- [ ] Die visuelle Vorlage ist ohne eigenständige Neugestaltung umgesetzt.
- [ ] Alle geforderten CRUD-, Auswahl-, Draw-, Animations- und Ergebnisabläufe funktionieren.
- [ ] Keine Überbelegung, Doppelzuordnung oder erneute Auswahl bereits zugewiesener Personen ist möglich.
- [ ] Alle geforderten Zustände und Edge Cases besitzen eine konsistente Darstellung.
- [ ] Änderungen werden unmittelbar und persistent in allen relevanten Bereichen reflektiert.
- [ ] Desktop-Build, Lint sowie funktionale und visuelle Abnahme sind erfolgreich.
