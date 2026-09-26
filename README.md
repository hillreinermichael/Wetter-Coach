# Wetter Coach

Mobile-first Wetter-PWA im Stil des U11 Coach – dunkelblau und weiß.

## Funktionen

- Startseite mit **Wetter heute** und **Wochenübersicht**
- Stundenübersicht für den heutigen Tag
- Wettervorhersage für die nächsten 7 Tage
- Standort über GPS oder Ort-/PLZ-Suche
- Standort wird lokal im Browser gespeichert
- PWA-Manifest und Service Worker
- Wetterdaten über Open-Meteo

## GitHub Pages

Die Dateien in diesem Ordner können direkt in das gewünschte GitHub-Repository hochgeladen werden.

Für GitHub Pages:

1. Repository öffnen
2. **Settings → Pages**
3. Bei **Build and deployment**: **Deploy from a branch**
4. Branch `main` und Ordner `/ (root)` auswählen
5. Speichern

Die App verwendet nur relative Pfade und funktioniert dadurch auch in einem Repository-Unterpfad.

## Lokal testen

```bash
python -m http.server 8080
```

Danach `http://localhost:8080` öffnen.
