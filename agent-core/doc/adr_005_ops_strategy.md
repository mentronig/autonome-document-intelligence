# ADR 005: Integration of DevOps Responsibilities

**Status:** Accepted
**Date:** 2026-02-11
**Deciders:** Admin & Mentor, User
**Context:** The project is entering Phase 7 (Deployment & CI/CD). We need to decide whether to introduce a dedicated "DevOps Persona" or integrate these responsibilities into existing roles.

## 1. Analysis

### Option A: Dedicated "DevOps Engineer" Persona

- **Pros:**
  - **Focus:** Force a mindset shift from "Feature functionality" to "Operational stability".
  - **Safety:** Separation of concerns (Developer writes code, DevOps deploys it).
- **Cons:**
  - **Overhead:** Constant context switching for a small team (1 User + 1 AI).
  - **Siloing:** "Not my job" syndrome for the Lead Developer regarding build scripts/config.
  - **Complexity:** Managing 3+ personas dilutes the context window and cognitive load.

### Option B: Integrated "DevOps Hat" (Recommended)

- **Concept:** The **Lead Developer** is responsible for implementation (scripts, configs), while the **Admin & Mentor** is responsible for approval/architecture (pipelines, security).
- **Pros:**
  - **Simplicity:** Leverages existing context.
  - **Ownership:** The developer owns the code from "Copyright" to "Production".
  - **Agility:** Faster iteration on build scripts without persona swaps.
- **Cons:**
  - Risk of "hacking" build scripts if the Admin doesn't review strictly.

## 2. Decision

We will **NOT** create a separate "DevOps Persona" file.
Instead, we define **DevOps** as a shared responsibility:

- **Admin & Mentor:** Defines the Standards (Linting rules, CI pipeline structure, Release Gates).
- **Lead Developer:** Implements the Automation (GitHub Actions, Dockerfiles, Scripts).

## 3. Implementation

- **Phase 7** in `task.md` will list "Infrastructure" tasks assigned to the Lead Developer.
- The "Definition of Done" for any feature now includes "Deployed & Verified".
