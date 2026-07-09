---
name: paper-pilots-gamedev
description: Development, auditing, balancing, and asset pipeline for the Paper Pilots bullet-hell game (paper_plane_game HTML file) and any other HTML5/canvas game project Vaughan works on. Use this skill whenever the user mentions Paper Pilots, the planes game, bullet-hell mechanics, game balance, difficulty curves, wave/boss/upgrade systems, game bug fixing, or wants to create/convert SVG game assets (ships, enemies, bosses) for use in a game. Also trigger when reviewing or modifying ANY game code file, even if the game isn't named — the verification methodology here applies to all gameplay logic and mathematics work.
---

# Paper Pilots Game Development

Skill for working on "Paper Pilots: Antigravity Elite" — a single-file HTML5 canvas bullet-hell shooter — and its SVG asset pipeline. The owner (Vaughan) requires **zero guesswork**: every claim about the code must be verified before it is stated or acted on.

## The No-Guesswork Rule (mandatory, applies to every task)

Never state that code is broken, dead, correct, or balanced from memory or from reading alone. Verify first:

1. **Dead-code claims** → grep every identifier for call sites before claiming it is unused:
   `grep -n "identifier" file.html` — a definition with zero invocations elsewhere = dead. Show the grep output.
2. **Math/balance claims** → extract the pure function(s) VERBATIM into Node and execute:
   `node -e "…paste function… console.log(f(1), f(5), f(10))"` — test branch boundaries for continuity, extremes for sanity. Show the numbers.
3. **Bug claims** → cite exact line numbers and reproduce the defect logically (trace the write site AND the read site; a property written but never read = nonfunctional feature).
4. **Before editing** → re-read the current file state; after editing → re-verify the changed function numerically.
5. Separate every finding into one of three labels: **VERIFIED DEFECT** (evidence shown), **VERIFIED DEAD CODE** (call-site trace shown), or **DESIGN DECISION** (needs Vaughan's call — never silently resolve these).

## Current State of the Codebase

Read `references/audit-findings.md` before touching any gameplay code — it lists every verified defect with line numbers, evidence, and the agreed fix, plus the open design decisions. Do NOT re-fix things already fixed; check the findings file's status column and update it when a fix lands.

Read `references/design-contract.md` before changing any formula, constant, reward, cost, or timer — it records the canonical difficulty model, economy math, and verified curve values. Any change to these numbers must be re-verified in Node and the contract file updated in the same session.

Read `references/shmup-pattern-taxonomy.md` before designing ANY enemy fire pattern, formation, or scaling change — it defines the aimed-fire anchor rule, the pattern catalogue (1942/Raiden vocabulary), and the mirror-pair symmetry directive.

Read `references/svg-asset-pipeline.md` before creating, converting, or loading any visual asset — it defines the CorelDRAW→SVG→game conventions (canvas size, anchor, naming, loading code). Assets live in separate files and are never inlined back into the game HTML.

## Working Conventions (verified against existing code style)

- **Timing**: real-time (`Date.now()` deltas), never frame counts, for anything gameplay-relevant (wave timers, attack rhythm, cooldowns). Frame counts only for cosmetic oscillation.
- **Entity caps** are load-bearing: enemyBullets ≤ 200, bullets ≤ 100, particles ≤ 150, enemies ≤ 40. Never remove them; patterns that mass-spawn must respect them.
- **Event listeners** that touch `player` or other run-scoped objects MUST null-guard (`if (!player) return;`) — these objects don't exist on the menu.
- **Never mutate arrays during `forEach`** — filter, or iterate backwards.
- **Every new property written must have a read site** in the same change, or it's a nonfunctional feature (see EMP stun defect).
- **Save integrity**: run-state restoration rebuilds the player from base stats and reapplies upgrades once (see `continueRun()` — the Glass Cannon comment explains why). Preserve this pattern.
- Single-file architecture is intentional for the game logic; only assets are externalized.

## Task Workflow

For any change request:
1. Load the relevant reference file(s).
2. Verify the current behavior of the code being changed (steps in No-Guesswork Rule).
3. Make the minimal change; Vaughan prefers direct fixes without over-explanation.
4. Re-verify numerically/by trace, THEN run scripts/smoke-harness.js (jsdom headless boot + 600-frame gameplay + save/resume cycle) — a syntax pass is NOT sufficient; session 7 shipped a frame-1 ReferenceError that only the harness caught.
5. Update `references/audit-findings.md` status and, if constants changed, `references/design-contract.md`.
6. Report: what was verified, what changed, evidence it now behaves correctly. Keep it tight.

For a fresh audit of new game code: run the full methodology (call-site trace of every top-level identifier, Node execution of every pure math function, write-site/read-site pairing of every stateful property) and produce a findings table in the same format as `references/audit-findings.md`.
