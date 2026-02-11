
# Benutzerhandbuch: Setup, Build & Deployment

Dieses Handbuch führt Sie Schritt für Schritt durch den Prozess, um den **Autonomen Dokumentenanalyse-Agenten** von GitHub herunterzuladen, eine ausführbare Version zu erstellen und diese auf einem Computer (Windows) auszurollen.

---

## 1. Voraussetzungen (Was muss installiert sein?)

Bevor Sie beginnen, stellen Sie sicher, dass folgende Software auf Ihrem Computer installiert ist:

1.  **Git** (Zum Herunterladen des Codes)
    *   Download: [git-scm.com](https://git-scm.com/download/win)
    *   Installation: Standardeinstellungen beibehalten.
2.  **Node.js** (Laufzeitumgebung für den Agenten)
    *   Download: [nodejs.org](https://nodejs.org/) (LTS Version wählen, z.B. v20 oder v22).
3.  **Python** (Für die PDF-Verarbeitung)
    *   Download: [python.org](https://www.python.org/downloads/)
    *   **Wichtig:** Haken bei "Add Python to PATH" setzen!
4.  **Ollama** (Für die künstliche Intelligenz)
    *   Download: [ollama.com](https://ollama.com)
    *   Installation & Setup: Nach der Installation Terminal öffnen und `ollama run llama3` eingeben, um das Modell herunterzuladen.

---

## 2. Code herunterladen (Checkout)

Wir holen uns den Quellcode von GitHub auf Ihren Computer.

1.  Öffnen Sie die **Eingabeaufforderung (cmd)** oder **PowerShell**.
2.  Navigieren Sie zu dem Ort, wo das Projekt liegen soll (z.B. `C:\Projekte`):
    ```powershell
    cd C:\Projekte
    ```
3.  Klonen Sie das Repository:
    ```powershell
    git clone https://github.com/mentronig/autonome-document-intelligence.git
    ```
4.  Gehen Sie in den Projektordner:
    ```powershell
    cd autonome-document-intelligence/agent-core
    ```

---

## 3. Installation & Build (Erzeugung der Distribution)

Jetzt verwandeln wir den Quellcode (TypeScript) in ausführbaren JavaScript-Code.

1.  **Abhängigkeiten installieren:**
    Laden Sie alle benötigten Bibliotheken herunter:
    ```powershell
    npm install
    ```
2.  **Python-Pakete installieren:**
    Installieren Sie den PDF-Leser:
    ```powershell
    pip install pdfplumber
    ```
3.  **Kompilieren (Build):**
    Übersetzen Sie den Code. Dies erzeugt einen `dist`-Ordner.
    ```powershell
    npm run build
    ```
    *(Hinweis: Falls `npm run build` nicht definiert ist, nutzen Sie `npx tsc`)*

**Ergebnis:** Sie haben nun einen Ordner `dist`. Zusammen mit `node_modules` und `pdf_parser.py` bildet dies Ihre **ausführbare Anwendung**.

---

## 4. Ausrollen (Deployment)

Wie bringen Sie den Agenten auf einen *anderen* Computer?

### Option A: Quellcode-Deployment (Einfachste Methode)
Dafür wiederholen Sie einfach **Schritt 1 bis 3** auf dem Zielcomputer. Das ist am sichersten, da alles frisch installiert wird.

### Option B: Manuelles Kopieren (Offline Deployment)
Wenn der Zielcomputer kein Internet hat:

1.  **Auf Ihrem Entwickler-PC:**
    Kopieren Sie folgende Dateien/Ordner in einen neuen Ordner `Agent_Release_v1`:
    *   `dist/` (Der Code)
    *   `node_modules/` (Die Bibliotheken - ACHTUNG: Muss auf gleichem OS erstellt sein!)
    *   `.env` (Konfiguration, falls vorhanden)
    *   `package.json`
    *   `pdf_parser.py`
    *   `pdf-parser-wrapper.js` (falls genutzt)

2.  **Auf dem Ziel-PC:**
    *   Installieren Sie **Node.js**, **Python** und **Ollama** (siehe Schritt 1).
    *   Kopieren Sie den Ordner `Agent_Release_v1` auf den Ziel-PC.
    *   Stellen Sie sicher, dass `pip install pdfplumber` auch dort ausgeführt wurde (oder kopieren Sie die Python-Libs, was aber komplex ist).

---

## 5. Starten des Agenten

Um den Agenten zu benutzen:

1.  Öffnen Sie das Terminal im Projektordner.
2.  Stellen Sie sicher, dass Ollama läuft (`ollama serve` in einem separaten Fenster).
3.  Starten Sie die Analyse:
    ```powershell
    node dist/index.js "C:\Pfad\zu\Ihrem\Dokument.pdf" --mode review
    ```

**Viel Erfolg!**
