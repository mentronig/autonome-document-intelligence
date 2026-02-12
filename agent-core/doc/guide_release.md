# 🚀 Release-Prozess & Versionierung

Dieser Guide beschreibt, wie wir eine neue Version von **Autonome Document Intelligence** veröffentlichen.

## 1. Voraussetzungen (Definition of Done)

Bevor wir an ein Release denken, muss der Code **sauber** sein.

- [ ] **Tests:** Alle Tests müssen grün sein.
  ```bash
  npm test
  ```
- [ ] **Linting:** Der Code muss den Style-Guidelines entsprechen.
  ```bash
  npm run lint
  ```
  _(Tipp: `npm run format` repariert viele Fehler automatisch.)_

## 2. Versionierung (SemVer)

Wir folgen **Semantic Versioning** (`MAJOR.MINOR.PATCH`).
Beispiel: `1.2.0` -> `1.2.1` (Bugfix) oder `1.3.0` (Neues Feature).

### Wo wird die Version geändert?

1.  **`package.json`**: Im Root-Verzeichnis.
    ```json
    "version": "1.0.0"
    ```
2.  **`agent-core/src/index.ts`** (Optional): Falls wir eine Konstante für die Version haben.

## 3. Changelog pflegen

Wir führen kein separates `CHANGELOG.md` (noch nicht), aber die Commit-Messages sollten sprechend sein.
Für ein Release fassen wir die Änderungen in der **Git-Tag-Message** zusammen.

## 4. Release durchführen (Git)

Wenn alles bereit ist:

1.  **Änderungen committen:**

    ```bash
    git add .
    git commit -m "chore(release): bump version to 1.x.x"
    ```

2.  **Tag erstellen:**

    ```bash
    git tag -a v1.x.x -m "Release v1.x.x: Features X, Y, Z"
    ```

    _Der Tag-Name muss mit `v` beginnen!_

3.  **Tags pushen:**
    ```bash
    git push origin main --tags
    ```

## 5. Deployment (Automatisch vs. Manuell)

Aktuell haben wir **keine** CI/CD-Pipeline, die automatisch deployt.
Das bedeutet: Das Repository _ist_ der Release.

**Für die Zukunft (Phase 8+):**

- GitHub Actions könnten bei einem Push auf `v*` automatisch Docker-Images bauen.
- Automatisches Update der Dokumentation.

---

**Autor:** Admin & Mentor
**Stand:** Phase 7 (Deployment Prep)
