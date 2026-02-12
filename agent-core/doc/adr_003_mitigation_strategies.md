# Architecture Decision Record (ADR) 003: Risk Mitigation Strategies

**Date:** 2026-02-11
**Refers to:** ADR 002 (Risk Analysis)

## Context

In ADR 002, we identified three critical failure points. This document outlines the architectural solutions to fix them.

---

## Solution 1: Containerization (The "Frozen World")

**Target Problem:** "Dual Runtime" Friction (Node.js + Python version mismanagement).

**The Solution:**
Wrap the entire agent (Node.js, Python, PDF libraries) in a **Docker Container**.
Instead of asking the user to "Install Python 3.10 and Node 20", we ask them to "Run this Container".

**Why it is better:**

- **Immutable Environment:** We define exactly which Python version and which Node version run together. The user cannot accidentally break it by updating their local Python.
- **Zero Setup:** The "It works on my machine" problem vanishes.
- **Safety:** The agent cannot accidentally delete files on the user's host OS (outside the mounted folder).

---

## Solution 2: Structured IPC (The "Dedicated Phone Line")

**Target Problem:** "Fragile Bridge" (Node.js crashing because Python printed a warning to stdout).

**The Solution:**
Replace `stdout` text parsing with **ZeroMQ** or **gRPC**.
Node.js and Python communicate via a local network socket using structured messages (Protobuf or MessagePack).

**Why it is better:**

- **Separation of Channels:** "Logs" (stdout) and "Data" (socket) are physically separated. Python can print all the warnings it wants; Node.js only listens to the data socket.
- **Type Safety:** We can define a schema (e.g., "Result must be a JSON object with 'pbis' list").
- **Speed:** Binary serialization is faster than parsing huge JSON text strings.

---

## Solution 3: The "Sandboxed Playpen" (Safe Evolution)

**Target Problem:** "Lobotomized Evolution" (Agent self-destructs with bad code).

**The Solution:**
Before applying new code, the agent spins up a **Temporary Test Environment (The Playpen)**.

1.  Agent writes the new code to a temp file.
2.  Agent runs a "Success Capsule" (Regression Test) against this temp file.
3.  **Rule:** If the test fails or crashes, the code is **discarded immediately**.
4.  Only if the test passes (Green), the code is promoted to `src/`.

**Why it is better:**

- **No Suicide:** Use of `git checkout` or temp files ensures the "main" agent never runs broken code.
- **Trust:** We rely on _Proof_ (Tests passed?), not just _Promise_ (LLM says it fixed it).
- **Human Loop:** If the Sandbox fails 3 times, the agent escalates to the user instead of looping forever.

---

## Summary

These solutions move the agent from "POC Awareness" to "Production Reliability".

- **Docker** solves Deployment.
- **ZeroMQ** solves Communication.
- **Sandbox** solves Safety.
