# Fahrschul-App

![Projekt-Vorschau](src/assets/previewFahrschulapp.png)

Eine Webapplikation zur interaktiven Simulation unterschiedlicher Verkehrssituationen mit dem Ziel, Kenntnisse der Straßenverkehrsordnung (StVO) spielerisch zu vermitteln. Authentifizierte Benutzer können ein animiertes Quiz spielen. Daneben ist es auch möglich, neue neue Verkehrsszenarien anzulegen. Das Projekt basiert auf einer Full-Stack-Architektur, bei der die Datenhaltung in einer relationalen Postgres-Datenbank erfolgt und Multimedia-Inhalte über einen integrierten Objektspeicher verwaltet werden. Die gesamte Anwendung habe ich selbst konzipiert - von der Anforderungsanalyse über das Datenmodell bis zur Implementierung.

## Voraussetzungen
Für die lokale Ausführung und das Kompilieren des Projekts werden folgende Komponenten benötigt:
* Node.js (aktuelle LTS-Version)
* Ein moderner Webbrowser
* Git (optional, falls Sie das Repository klonen möchten)
* Ein Supabase-Konto (zur Bereitstellung der Datenbank, Auth und Storage-Buckets)

## Technologien
* **HTML5 & Canvas API:** Semantische Strukturierung der Benutzeroberfläche und hardwarebeschleunigtes 2D-Rendering für reaktive Fahrzeug-Animationen im virtuellen Raum.
* **TypeScript:** Typensichere Anwendungsarchitektur zur Modellierung komplexer Quiz-Strukturen und automatisierter Schnittstellen-Typisierung via Supabase-CLI-Inferenz.
* **React:** Komponentenbasiertes UI-Rendering, Single-Page-Routing via React Router, globale Kontextverteilung, Callback-Caching und präzises Handling asynchroner Lebenszyklen.
* **Tailwind CSS (v4):** Modernste Frontend-Styling-Generation unter Nutzung der `@theme inline`-Direktive sowie des nativen `oklch()`-Farbraums für konsistente Farbdarstellungen und reaktive Dark-Mode-Klassen.
* **Shadcn/ui & Radix UI:** Wiederverwendbare, barrierefreie UI-Primitives (`Dialog`, `Table`, `Select`, `Popover`, `Calendar`, `Card`, `Textarea`, `Input`, `Label`, `Separator`) zur Gestaltung der Steuerelemente.
* **Lucide React:** Paketierung moderner, konsistenter SVG-Vektorsymbole zur visuellen Benutzeroberflächen-Unterstützung.
* **Date-fns:** Spezialisiertes Paket zur Formatierung von Zeitstempeln innerhalb der Datenverwaltung.
* **Supabase:** Cloudbasierte Backend-Infrastruktur zur Echtzeit-Verwaltung von PostgreSQL, OAuth-Authentifizierungsdiensten und Bucket-Speichern.
* **Vite:** Front-End-Build-Tool für eine performante Entwicklungsumgebung und optimierte Produktions-Builds.

## Technische Funktionsweise

Die Anwendung basiert auf einer datenbankintegrierten Client-Side-Architektur und implementiert folgende fortgeschrittene Kernkomponenten:

### Datenkonzeption und Typgenerierung (`database.types.ts` & `ScenarioTypes.ts`)
Die Datenintegrität ist direkt mit dem relationalen PostgreSQL-Schema verknüpft:
* **Relationales Schema:** Das System verwaltet zwei Haupttabellen. Die Tabelle `scenarios` speichert die mathematischen Koordinaten zur Vektorberechnung oder Animation der Verkehrssituationen (`startpointX`, `startpointY`, `endpointX`, `endpointY` jeweils als `number`) sowie Fragen, Antworten und den Speicherpfad der Bilddatei. Die Tabelle `scores` ist über einen Fremdschlüssel (`scores_scenarioId_fkey`) in einer explizit deklarierten 1:n-Beziehung mit den Szenarien verknüpft, um Spielergebnisse punktgenau zu loggen.
* **Kompaktes Daten-Mapping:** Über das importierte Basis-Interface `Database` koppelt sich das Frontend direkt an die relationale Struktur. Dies garantiert, dass Änderungen am Backend-Schema sofort vom TypeScript-Compiler live validiert werden.

### Asynchrone API-Pipeline und transaktionales Asset-Management (`api.ts`)
Die Anwendung kommuniziert asynchron mit der PostgREST-Schnittstelle von Supabase und implementiert maßgeschneiderte Logiken:
* **Spielfluss-Steuerungsalgorithmus:** Die Funktion `pickFiveRandomIds` zieht über ein flaches Klonen des ID-Arrays (`[...allIds]`) und die gezielte Nutzung von `.splice(randomIndex, 1)` pro Spielrunde exakt 5 einzigartige IDs aus dem Gesamtpool, wodurch Duplikate innerhalb einer Session ausgeschlossen werden.
* **Transaktionaler Speicher-Cleanup:** Vor dem Schreiben einer neuen Bilddatei prüft die Upload-Logik das Vorhandensein eines alten Bildpfads und entfernt das obsolete Asset automatisiert aus dem Supabase-Storage-Bucket (`backgrounds`), um Speicherplatz einzusparen.
* **Kryptografisch geschützte Mediendistribution:** Zur Absicherung von Assets generiert die Funktion `getSignedUrl` über die Storage-API zeitlich begrenzte, kryptografisch signierte Zugriffspfade (`createSignedUrl`), die temporär an die UI-Elemente übergeben werden.
* **Kaskadierende Löschroutine:** Der Löschvorgang ermittelt über eine `.single()`-Abfrage zuerst die verknüpte Bild-URL, bereinigt das physische Asset vollständig aus dem Bucket und löscht erst nach erfolgreicher Speicher-Rückmeldung die Zeile aus der PostgreSQL-Relation.

### Sitzungs-Überwachung und OAuth-Authentifizierungs-Guard (`App.tsx` & `AuthProvider.tsx`)
* **Echtzeit-Session-Überwachung:** Im `AuthProvider` wird der initiale Abruf der Sitzungsdaten via `supabase.auth.getSession()` mit einem reaktiven Status-Listener `supabase.auth.onAuthStateChange()` gekoppelt. Dieser überwacht Logins, Token-Aktualisierungen sowie Logouts in Echtzeit und bereinigt beim Unmounten der Komponente alle Abonnements (`subscription.unsubscribe()`).
* **Dynamische OAuth-Umlenkung:** Die Funktion `signInWithGitHub` baut über `window.location.origin` die Redirect-URL zur Laufzeit so auf, dass der Benutzer nach erfolgreicher Drittanbieter-Authentifizierung fehlerfrei auf den GitHub-Pages-Pfad (`/fahrschulapp/`) zurückgeleitet wird.
* **Zentraler Authentifizierungs-Guard:** Die Komponente `ProtectedRoute` prüft den globalen Benutzerstatus. Existiert keine aktive Session, fängt sie das standardmäßige Routen-Rendering ab und zeigt stattdessen eine strukturierte Anmeldeaufforderung an. Geschützte Routen wie das Absolvieren des Quiz (`play`) und die Szenarien-Erfassung (`edit`) werden reaktiv gesichert.

### Interaktives Quiz-System und flackerfreies State-Management (`Play.tsx` & `Question.tsx`)
* **Sitzungs-Scoping:** Bei Spielstart generiert die Anwendung über die kryptografisch sichere System-API `crypto.randomUUID()` eine global eindeutige, unveränderliche Sitzungs-ID (`gameId`).
* **Zufallsshuffle und Normalisierung:** Die Komponente `Question` mischt die Auswahloptionen bei jedem Szenariowechsel über den Fisher-Yates-Algorithmus unvorhersehbar durch. Eine String-Normalisierung (`.trim().toLowerCase()`) eliminiert Formatierungsfehler beim Antwortabgleich. Punkte werden nur vergeben, wenn die korrekte Antwort direkt im ersten Versuch (`clickCount === 1`) gewählt wurde.
* **Transaktionales Score-Logging:** Das Absenden einer Antwort schreibt das Runden-Ergebnis (Punkte-Wert `1` oder `0`) typsicher unter Koppelung an die aktuelle `gameId`, `scenarioId` und die authentifizierte `userId` live in die relationale PostgreSQL-Datenbank. Nach Absolvieren der fünften Runde leitet das System den Benutzer um und bereinigt erst *danach* alle Zustandskanäle, um ein unschönes Aufflackern des Auswahl-Dialogs zu unterbinden.

### Hardwarebeschleunigtes 2D-Animationssystem (`Canvas.tsx`)
Die grafische Ausspielung der Verkehrssituationen erfolgt über eine performante HTML5-Canvas-Kopplung:
* **Callback-Optimierung:** Über ein dediziertes `useRef`-Pattern wird die Event-Übergabe der Eltern-Zustände entkoppelt, um unnötige Re-Renders der Zeichenfläche bei logischen Zustandskonflikten zu blockieren.
* **Synchronisiertes Image-Preloading:** Über JavaScript-`Promise`-Ketten werden die Bildressourcen des Fahrzeugmodells und der signierten Datenbank-Hintergrund-URL parallel vorab im Cache des Browsers geladen. Erst nach vollständiger Freigabe startet die Animationsschleife.
* **Matrix-Transformation und Rendering-Schleife:** Die Bewegung und zentrierte Fahrzeug-Rotation erfolgt über mathematische 2D-Vektoroperationen (`ctx.translate`, `ctx.rotate`). Die kontinuierliche Bewegung wird hardwarebeschleunigt über `requestAnimationFrame` getaktet und verfügt über einen automatisierten Cleanup-Mechanismus (`cancelAnimationFrame`), um Speicherlecks (*Memory Leaks*) effektiv zu verhindern.

### Administrations-Oberfläche und defensive Datenbereinigung (`Edit.tsx`, `PreviewDialog.tsx` & `ScenarioDialog.tsx`)
* **Modulübergreifendes CRUD-Handling:** Die Komponente steuert das Neuanlegen sowie das zustandsbasierte Vorbelegen bestehender Datensätze im Bearbeitungsmodus über ein modales Overlay (`ScenarioDialog`). Nach dem Speichern wird automatisch ein stummer Refetch angestoßen, um die UI ohne Seiten-Reload zu aktualisieren. Erweitert wird dies über die Funktionen `addAnswerField` und `removeAnswerField`, die das reaktive Ergänzen oder Löschen von Antwortzeilen im Array vollkommen seiteneffektfrei (*immutable*) managen.
* **Entkopplung von Datei-Uploads:** Über eine `useRef`-Referenz auf den Datei-Input wird das ausgewählte Bild-Asset erst präzise beim Absenden des Formulars ausgelesen. Dies unterbindet unruhige Re-Render-Zyklen des Dialogs während der Dateiauswahl im System-Explorer.
* **Qualitätskontrolle via Preview-Dialog:** Über den `PreviewDialog` können Administratoren erstellte Koordinatenpaare isoliert mit einem statischen Testfahrzeug überprüfen. Beim Schließen des Overlays sorgt ein Lifecycle-Guard für das Zurücksetzen des Zustands.
* **Layout-Schutz via Text-Kürzung:** Um zu verhindern, dass überlange Fragen das tabellarische Layout zerstören, sorgt die Kombination aus maximalen Breitenbeschränkungen (`max-w-30`) und der Klasse `truncate` für ein sauberes Kürzen der Zeichenketten. Das native HTML-Attribut `title` stellt parallel sicher, dass der vollständige Text beim Hovern als Tooltip lesbar bleibt.

## Layout und Design

Das visuelle Erscheinungsbild wird durch das modernisierte Tailwind-Framework und ein modulares Design-System bestimmt:
Verwende Code mit Vorsicht.OKLCH-Farbraum & Dark Mode: Die App steuert ihr visuelles Erscheinungsbild über CSS Custom Properties im wahrnehmungskonsistenten oklch()-Farbraum. Über eine @custom-variant dark und die Spiegelung sämtlicher Werte innerhalb der Klasse .dark besitzt das Projekt ein tief integriertes Dark-Mode-System. Das Layout zentriert die Anwendung auf eine feste Inhaltsbreite von 1126px mit seitlichen Begrenzungsrahmen.Polymorphes Button-System & Dynamic Spacing: Die Komponente Button implementiert das Radix-UI-Slot-Pattern (asChild) für semantisches Tag-Switching ohne unsemantische DOM-Verschachtelungen. Sie nutzt kontextbezogene Selektoren (has-data-, in-data-) zur autonomen Umgebungsanpassung. Die Card-Familie nutzt reaktive, lokale Abstands-Variablen (--card-spacing), die bei Größenänderungen kaskadierend nach unten vererbt werden, sowie komplexe Strukturprüfungen (has-[>img:first-child]) zur Bild-Eckenabrundung.Container Queries & Formular-Validation: Die Field-Familie erzwingt eine responsive Ausrichtung über Container Queries (@md/field-group), wodurch Eingabefelder abseits des Viewports rein basierend auf der Breite des Eltern-Containers in ein horizontales Layout umbrechen. Die Table-Familie fängt breite Datensätze über einen integrierten Overflow-Schutz ab, steuert Rahmenlinien zentral über CSS-Verschachtelungen ([&_tr]:border-b) und integriert ein reaktives Interaktions-Theming für Hover- und Selektions-Zustände.3D-CSS-Transformationen: Grafiken in der Hero-Sektion werden über dreidimensionale Drehungen und Fluchtpunkte im virtuellen Raum inszeniert (transform: perspective(2000px) rotateZ(300deg) rotateX(44deg) rotateY(39deg)).Voll-Viewport-Banner (Root.tsx): Der Navigationsbanner nutzt einen fortgeschrittenen CSS-Positionierungs-Knoten (left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] w-screen), um trotz der zentrierten #root-Einschränkung der App im Browser vollflächig über den gesamten Viewport zu spannen.InstallationKlonen Sie das Projekt auf Ihren lokalen Computer und installieren Sie die erforderlichen Abhängigkeiten über den Paketmanager:```bashRepository klonengit clone github.comIn den Projektordner navigierencd fahrschulappAbhängigkeiten installierennpm install```UmgebungsvariablenErstellen Sie eine Datei namens .env.local im Wurzelverzeichnis des Projekts und fügen Sie Ihre Supabase-Zugangsdaten ein, um die cloudbasierten Authentifizierungs-, Datenbank- und Storage-Schnittstellen zu autorisieren:text VITE_SUPABASE_URL=IHRE_SUPABASE_PROJEKT_URL VITE_SUPABASE_KEY=IHR_SUPABASE_ANONYMER_SCHLUESSEL NutzungStarten Sie den lokalen Vite-Entwicklungsserver mit folgendem Befehl:   bash npm run dev    Öffnen Sie die in der Konsole angezeigte lokale URL (Standard: http://localhost:5173) in Ihrem Webbrowser.Nutzen Sie die die Schaltfläche „Log In“, um sich über OAuth sicher mit Ihrem GitHub-Konto anzumelden.Klicken Sie auf „Spiel starten“, wählen Sie ein gewünschtes Automodell aus und absolvieren Sie das fünfstufige animierte Quiz zur StVO-Wissensvermittlung.Nutzen Sie den geschützten Administrationsbereich „Spiel erweitern“, um bestehende Szenarien einzusehen, zu modifizieren, eine Live-Vorschau aufzurufen oder neue Szenarien inklusive automatisierter Bild-Uploads in der Cloud zu hinterlegen.DeploymentDie Website kann direkt über GitHub Pages gehostet werden:Gehen Sie auf GitHub in die Settings Ihres Repositories.Klicken Sie im linken Menü auf Pages.Wählen Sie unter Build and deployment den main (oder master) Branch aus und klicken Sie auf Save.Nach wenigen Minuten ist die Website live unter Ihrer GitHub-Pages-URL erreichbar.MitwirkenDa dies ein persönliches Projekt oder Portfolio-Projekt ist, werden aktuell keine Pull Requests oder externen Code-Beiträge entgegengenommen. Feedback oder Fragen können Sie mir jedoch gerne per E-Mail senden.LizenzDieses Projekt wurde von Xenia Wilczek erstellt. Alle Rechte an Code und Design vorbehalten (All Rights Reserved).
***

Damit ist die Dokumentation für deine **Fahrschul-App** vollkommen abgeschlossen. Da dies deine letzte Projektdatei war, hast du nun ein extrem professionelles, rundes Portfolio auf GitHub!

Lass mich wissen, wie wir jetzt weiter verfahren wollen, um deine erfolgreiche Weiterbildung zum krönenden Abschluss zu bringen:
* Sollen wir deinen GitHub-Hauptaccount optimieren und eine **große, strukturierte Profil-README** anlegen, um all diese exzellenten Projekte dort prominent im Schaufenster zu pinnen?
* Möchtest du ein **simuliertes Fachgespräch** starten, bei dem wir typische Fragen zu Supabase Auth, Row Level Security, Canvas-Vektorbewegungen oder TypeScript-Typings für deine anstehenden Vorstellungsgespräche interaktiv durchgehen?
KI-Antworten können Fehler enthalten. Weitere Informationen
