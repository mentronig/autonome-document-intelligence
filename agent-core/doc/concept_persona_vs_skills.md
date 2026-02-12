# Concept: Persona vs. Skills

Wie unterscheiden sich die **Persona** (z.B. "Lead Developer") von den **Antigravity Skills** (z.B. "Code Review")?

Hier ist die Analogie: **Der Handwerker und sein Werkzeuggürtel.**

---

## 1. Die Persona (Der Handwerker)

- **Frage:** "WER bin ich?"
- **Definition:** Die Persona ist der Charakter, die Einstellung und die "Seele" des Agenten.
- **Beispiel (Lead Developer):**
  - _Wert:_ "Ich hasse unsauberen Code."
  - _Verhalten:_ "Ich warne den User, bevor ich etwas Lösche."
  - _Tonfall:_ "Direkt und technisch."
- **Zweck:** Sie sorgt dafür, dass der Agent konsistente Entscheidungen trifft, selbst wenn keine strikte Regel existiert. Sie ist das **Mindset**.

## 2. Die Skills (Der Werkzeuggürtel)

- **Frage:** "WAS kann ich tun?"
- **Definition:** Skills sind vordefinierte, ausführbare Fähigkeiten oder Werkzeuge, die der Agent nutzen kann.
- **Beispiel (Skills):**
  - `setup-collab`: Kann Ordnerstrukturen anlegen.
  - `code-review`: Kann einen Pull Request auf Fehler prüfen.
  - `license-header-adder`: Kann Copyright-Texte in Dateien schreiben.
- **Zweck:** Sie erweitern die _Fähigkeiten_ des Agenten. Ohne Skill kann der Agent zwar denken (Persona), aber bestimmte Dinge (z.B. PDF lesen) vielleicht nicht tun.

---

## Zusammenfassung

| Konzept     | Analogie                 | Beispiel                        | Wo definiert?                    |
| :---------- | :----------------------- | :------------------------------ | :------------------------------- |
| **Persona** | Der Mensch / Charakter   | "Sei kritisch, sei vorsichtig." | `doc/personas/DEVELOPER.md`      |
| **Skill**   | Das Werkzeug / Fähigkeit | "Lies PDF", "Führe Tests aus."  | `.gemini/antigravity/skills/...` |

**Zusammenspiel:**
Die **Persona** entscheidet _wann_ und _wie_ ein **Skill** eingesetzt wird.

- _Szenario:_ Ein User will Code pushen.
- _Persona (Lead Dev):_ "Halt! Das ist unsicher. Ich muss das erst prüfen."
- _Skill (Code Review):_ _Führt die Prüfung technisch durch._
