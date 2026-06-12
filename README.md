# Zusammen

Euer gemeinsamer Alltag an einem Ort. Eine installierbare PWA für zwei Personen mit Einkaufsliste, Terminen, To Dos, Essensplan, Date Ideen und aktuellen Stuttgart Tipps. Alle Änderungen sind dank Supabase Realtime sofort auf beiden Handys sichtbar.

## Stack

React, Vite, Supabase (Datenbank, Auth, Realtime), Vercel (Hosting und Serverless Funktion), Anthropic API mit Websuche für die Stuttgart Tipps.

## Einrichtung in 15 Minuten

### 1. Supabase Projekt anlegen

1. Auf supabase.com ein neues Projekt erstellen (Region Frankfurt wählen)
2. Im SQL Editor den kompletten Inhalt von `supabase/schema.sql` ausführen
3. Unter Authentication, Sign In / Up, Email den Punkt "Confirm email" deaktivieren, damit ihr euch ohne Bestätigungsmail registrieren könnt
4. Unter Project Settings, API die Project URL und den anon public Key kopieren

### 2. Lokal starten

```bash
npm install
cp .env.example .env
# .env mit euren Supabase Werten füllen
npm run dev
```

### 3. Auf Vercel deployen

1. Repo auf GitHub pushen
2. Auf vercel.com das Repo importieren (Framework Vite wird automatisch erkannt)
3. Unter Environment Variables eintragen

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
ANTHROPIC_API_KEY=...
```

Der Anthropic Key wird nur für den Stuttgart Tab gebraucht. Ohne ihn funktioniert alles andere trotzdem.

### 4. Aufs Handy bringen

Die Vercel URL auf beiden Handys öffnen und über "Zum Home Bildschirm hinzufügen" installieren. Danach jeweils einmal registrieren, Namen eintragen, Farbe wählen, fertig.

## Hinweis zur Sicherheit

Die Datenbank erlaubt Zugriff für alle angemeldeten Nutzer. Da nur ihr zwei euch registriert, passt das. Wer auf Nummer sicher gehen will, deaktiviert nach eurer Registrierung unter Authentication die Neuanmeldungen ("Allow new users to sign up" ausschalten).

## Wie die Stuttgart Tipps funktionieren

Der Button im Stuttgart Tab ruft die Serverless Funktion `api/stuttgart.js` auf. Diese fragt die Claude API mit aktiviertem Websearch Tool nach Veranstaltungen der kommenden sieben Tage in Stuttgart und gibt sechs kuratierte Tipps als JSON zurück. Das Ergebnis wird pro Tag lokal gecacht, damit nicht bei jedem Öffnen API Kosten anfallen.

## Ideen für später

Wiederkehrende To Dos, Push Benachrichtigungen, geteilte Ausgaben, eine Merkliste für die Wohnungssuche mit Anbindung an den bestehenden Wohnungs Agenten, Rezeptvorschläge per KI im Essensplan.
