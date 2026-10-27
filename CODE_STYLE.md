# CODE_STYLE.md — Engineering & Code Style Guidelines

## 1. Core Principles

1. **Clarity & Explicitness Over Magic**: Business rules for financial authorization must be written as readable, self-explanatory pure functions without opaque abstractions.
2. **Deterministic Logic Decoupled from UI**: Core rules and calculations must live in `src/logic/`, fully testable in Node.js without browser or DOM dependencies.
3. **Accessibility as a First-Class Citizen**: Every interactive control must have an accessible name, valid role, and keyboard navigation support.

---

## 2. TypeScript Guidelines

- **Strict Type Checking**: Strict mode is enabled in `tsconfig.json`. Explicitly type all function signatures, component props, and state transitions. Avoid the `any` escape hatch; prefer discriminated unions.
- **Discriminated Unions for Financial State**:
  ```typescript
  // Prefer explicit outcome states
  export type DecisionOutcome = 'SETTLED' | 'STEP_UP' | 'BLOCKED';

  // State transitions carry distinct payloads
  export type AuditActor = 'NOMSA' | 'AGENT' | 'SERVICE' | 'MOMO';
  ```
- **Type Imports**: Use `import type` or explicit `.ts` imports in client code matching bundler path resolutions.

---

## 3. React 19 & Component Architecture

- **Modular File Structure**:
  - `src/components/`: Pure presentation and interactive UI components (Phone Simulator, Decision Feed, Audit Log, Modals).
  - `src/logic/`: Pure business logic, cryptographic hash chain functions, and risk scoring algorithms.
  - `src/types/`: Centralized domain interfaces and type definitions.
- **Hook Rules & State Hygiene**:
  - Use `useRef` for values requiring **synchronous continuity across asynchronous promises** (e.g. `lastHashRef`, `auditQueueRef`).
  - Use `useState` strictly for values driving UI renders (e.g. `decisions`, `auditLog`, `phoneTab`).
  - Guard against stale closures when chaining rapid asynchronous actions by passing override arguments or using updater callbacks `setCount((prev) => prev + 1)`.

---

## 4. Tailwind CSS v4 Guidelines

- **Zero-Pill Discipline**:
  - Do NOT wrap plain text metadata (dates, categories, transaction IDs) in border pills or badge islands.
  - Render informational metadata as clean text with typographic separators:
    ```tsx
    <div className="flex items-center gap-1.5 text-xs text-slate-400">
      <span>{payee.category}</span>
      <span aria-hidden="true">·</span>
      <span className="font-mono">{timestamp}</span>
    </div>
    ```
- **Consistent Radius Scale**:
  - Outer app containers: `rounded-2xl`
  - Cards & modals: `rounded-xl`
  - Interactive inputs & buttons: `rounded-lg`
- **Subtle Surface Contrast**:
  - Always use subtle hairline borders (`border border-slate-800` or `border-slate-700/80`) rather than thick accent borders or drop shadows.
- **Responsive Layout**:
  - Baseline target is a clean desktop cockpit at 1440px wide, reflowing to a stacked single-column view on mobile screens (`grid-cols-1 lg:grid-cols-12`).

---

## 5. Security & Error Handling

- **Never Leak Raw Scores to End Users**: On Nomsa's phone, error and status messages are strictly human-readable:
  - ❌ *“HTTP 403: Rule violation error 104; Risk score 0.87 > threshold 0.70”*
  - ✅ *“I stopped R300 to Thuto Primary school fees. Your SIM card was changed recently. Your money has not moved.”*
- **Fail-Safe Defaults**: If a required mandate parameter is missing, evaluate to `BLOCKED`. Never default to `SETTLED`.
