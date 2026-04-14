# Hendrik Bauer — Handwerk aus Herne

> Firmenwebseite für ein Kleingewerbe im Bereich Bodenverlegung, Türeneinbau und Tapezierarbeiten. Gebaut mit purem HTML, CSS und JavaScript — kein Framework, kein Build-Step, einfach deployen.

**Live:** [handwerk.hendrik-bauer.de](https://handwerk.hendrik-bauer.de)

---

## Stack

| Schicht | Technologie |
|---|---|
| Frontend | HTML5, CSS3 (Custom Properties), Vanilla JS |
| Hosting | Hetzner (Linux/Nginx) |
| CDN & Proxy | Cloudflare |
| Kontaktschutz | Cloudflare Turnstile + Cloudflare Worker |
| SSL | Let's Encrypt via Certbot |

---

## Projektstruktur

```
/
├── index.html          # Hauptseite (Single Page)
├── impressum.html      # Impressum
├── datenschutz.html    # Datenschutzerklärung
├── styles.css          # Gesamtes Design (Dark/Light Mode)
└── script.js           # Theme-Toggle, Scroll-Animationen, Turnstile-Logik
```

---

## Features

- **Dark / Light Mode** — erkennt automatisch die Systempräferenz, speichert manuelle Auswahl
- **Cloudflare Turnstile** — Telefonnummer, E-Mail und Adresse sind erst nach Bot-Prüfung sichtbar
- **Cloudflare Worker** — sensible Daten (Telefon, E-Mail, Adresse, Steuernummer) werden serverseitig als Umgebungsvariablen gespeichert und nie im Quellcode ausgeliefert
- **Responsive** — optimiert für Desktop, Tablet und Mobilgerät
- **Scroll-Animationen** — sanftes Einblenden der Sektionen via Intersection Observer
- **Keine Dependencies** — kein npm, kein Build-Tool, kein Framework

---

## Cloudflare Worker

Der Worker läuft unter `phone-reveal.jan691425.workers.dev` und gibt nach erfolgreicher Turnstile-Verifikation die geschützten Kontaktdaten zurück.

### Umgebungsvariablen (Cloudflare Dashboard → Worker → Einstellungen)

| Variable | Typ | Beschreibung |
|---|---|---|
| `PHONE_NUMBER` | Text | Telefonnummer |
| `EMAIL` | Text | E-Mail-Adresse |
| `ADDRESS` | Text | Adresse mit `\|` als Zeilenumbruch-Trenner |
| `STEUERNUMMER` | Text | Steuernummer |
| `TURNSTILE_SECRET` | Secret | Geheimer Turnstile-Schlüssel |

### Turnstile Site Key

Der öffentliche Site Key ist in `script.js` hinterlegt (`sitekey: "0x4AAAAAAC1TDpWNQbR8roof"`).  
Zugehöriges Widget: **Hendrik Bauer Handwerk** im Cloudflare Turnstile Dashboard.

---

## Lokale Entwicklung

Da Turnstile `https://` erfordert, funktioniert die Nummer-Anzeige lokal nicht — das ist gewollt. Alle anderen Features sind lokal voll funktionsfähig.

```bash
# Einfach die index.html im Browser öffnen
open index.html

# Oder mit einem lokalen Server (z.B. VS Code Live Server Extension)
```

---

## Deployment

Dateien per SFTP/SCP auf den Hetzner-Server hochladen:

```bash
scp index.html impressum.html datenschutz.html styles.css script.js user@server:/var/www/handwerk.hendrik-bauer.de/
```

Nginx-Config liegt unter `/etc/nginx/sites-available/handwerk.hendrik-bauer.de`.

---

## Nginx-Konfiguration

```nginx
server {
    server_name handwerk.hendrik-bauer.de;
    root /var/www/handwerk.hendrik-bauer.de;
    index index.html;

    add_header Content-Security-Policy "...";

    listen 443 ssl;
    # SSL via Certbot verwaltet
}
```

---

## Rechtliches

- Impressum und Datenschutz gemäß deutschem Recht (TMG, DSGVO)
- Kleingewerbe gemäß § 19 UStG — keine Umsatzsteuer-ID
- Cloudflare-Nutzung im Datenschutz dokumentiert

---

*Entwickelt von [Jan Bauer](https://jan-bauer.de)*
