# Wetter Coach V1.0

Mobile-first Wetter-PWA im Stil einer kompakten Vereins-App: dunkelblauer Kopfbereich, weiße Karten, klare Typografie und zwei Startkacheln.

## Funktionen

- Startseite mit **Wetter heute** und **Wochenübersicht**
- Stundenübersicht für den aktuellen Tag
- 7-Tage-Prognose
- Standort über GPS oder Ort-/PLZ-Suche
- Standort lokal im Browser gespeichert
- PWA-Manifest und Service Worker
- Wetterdaten über Open-Meteo

## Starten

Die App benötigt einen Webserver, damit Service Worker und PWA-Installation funktionieren.
Zum Beispiel:

```bash
python -m http.server 8080
```

Danach `http://localhost:8080` im Browser öffnen.
