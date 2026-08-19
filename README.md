# Sightline — Next.js App

Dein Klick-Dummy als echtes Next.js-Projekt. Design, Texte und alle Interaktionen
(Kanban-Drag&Drop, Free/Pro-Paywall, CV-Builder, AI-Chat, Ladesequenz) sind 1:1
übernommen — nur jetzt als React-Komponenten statt als eine große HTML-Datei.

## Was du jetzt tun musst

### 1. Node.js installieren (falls noch nicht vorhanden)
Lade Node.js (Version 18 oder neuer) von https://nodejs.org herunter und installiere es.
Prüfen im Terminal:
```
node -v
```

### 2. Projekt entpacken und ins Verzeichnis wechseln
```
cd sightline-app
```

### 3. Abhängigkeiten installieren
```
npm install
```
Das lädt Next.js und React herunter (dauert 1-2 Minuten).

### 4. Lokal starten
```
npm run dev
```
Dann im Browser öffnen: **http://localhost:3000**

Du solltest jetzt genau deine Landingpage sehen. Über "CV analysieren" oder
"Log in" kommst du in die App unter `/app`.

### 5. Am Code weiterarbeiten
- Jede Seite ist eine eigene Datei in `components/panels/` (z.B. `DashboardPanel.js`)
- Änderungen werden beim Speichern automatisch im Browser sichtbar (Hot Reload)
- Das komplette Design/CSS liegt in `app/globals.css` — genau wie im Prototyp
- Der gemeinsame App-Zustand (Plan, Kanban-Daten, CV-Texte, Chat) liegt in
  `context/AppContext.js` — das ist die Stelle, die in Schritt 3-5 (Datenbank,
  Login, echte KI) nach und nach durch echte Backend-Calls ersetzt wird

## Projektstruktur
```
app/
  page.js          → Landingpage (Route: /)
  app/page.js      → App-Einstieg (Route: /app)
  layout.js         → Grundgerüst, lädt die Schriften
  globals.css       → Komplettes Design-System (Farben, Karten, Buttons, etc.)
components/
  Sidebar.js, Topbar.js, AppShell.js
  panels/           → Eine Datei pro Bildschirm (Dashboard, Analyze, Pricing, ...)
context/
  AppContext.js     → Zentraler Zustand der App (bisher nur im Browser, noch ohne Datenbank)
```

## Nächste Schritte (aus unserem Plan)
Dieses Projekt deckt **Schritt 1 & 2** ab (Tech-Stack + Next.js-Projekt mit Design).
Als Nächstes:
- **Schritt 3-4**: Supabase-Projekt anlegen, Tabellen für users/profiles/applications
  erstellen, Login einbauen
- **Schritt 5**: die Werte aus `AppContext.js` (aktuell `useState`) durch echte
  Datenbank-Abfragen ersetzen
- **Schritt 6**: `runAnalysis()` in `AppContext.js` ruft aktuell nur eine
  Zeitverzögerung auf — hier kommt später der echte Call an die Claude API rein
