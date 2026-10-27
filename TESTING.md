# TESTING.md — Test Strategy, Unit Testing & Browser Verification

## 1. Testing Philosophy & Ultra-Mode Discipline

**MoMo Agent Pay** follows a two-tiered verification strategy:
1. **Tier 1: Fast Deterministic Unit Tests**: Pure mandate rules, risk calculation formulas, and cryptographic hash-chain validations are tested in Node.js using `node:test` and `node:assert/strict` (running in $<300\text{ms}$).
2. **Tier 2: Interactive Browser Journey Testing**: Real browser automation runs against `localhost:3000` via Playwright to verify DOM snapshots, focus states, PIN modal popups, and visual hierarchy.

---

## 2. Unit Testing Suite (`src/logic/mandateEngine.test.ts`)

The test suite tests the pure mathematical and logical core of the mandate engine:

| Test Case | Purpose | Expected Outcome |
| :--- | :--- | :--- |
| `blocks when mandate is null or inactive` | Verifies kill-switch and absent mandate handling | `BLOCKED`, hard rule violation |
| `blocks category outside authorized mandate` | Tests unauthorized payee category (e.g. Spaza) | `BLOCKED`, hard rule violation |
| `blocks amount exceeding single tx limit` | Tests proposal of R600 against R500 limit | `BLOCKED`, hard rule violation |
| `blocks amount exceeding monthly budget` | Tests adding R200 when R850 of R1,000 is used | `BLOCKED`, hard rule violation |
| `requires step-up PIN on first payment` | Verifies step-up trigger for unknown payee | `STEP_UP`, risk evaluated |
| `blocks when SIM swapped yesterday` | Injects SIM-swap flag (+0.60 penalty) | `BLOCKED`, risk $\ge 0.70$ |
| `settles automatically when within limits` | Low risk (0.06), known payee | `SETTLED`, MoMo settlement emitted |
| `verifies cryptographic hash chain` | Tests valid sequence and catches tampering | Valid passes; tampered payload fails |

### Executing Unit Tests

Run the unit tests via `npx --yes tsx`:

```bash
# Run the test suite once
npx --yes tsx --test src/logic/mandateEngine.test.ts

# Run with TAP reporter output
npx --yes tsx --test --test-reporter=tap src/logic/mandateEngine.test.ts
```

All 8 tests execute and pass in $\approx 200\text{ms}$.

---

## 3. Browser End-to-End Journey Verification

Browser journeys test the complete user experience through all 5 hackathon scenes:

### The 5 Guided Scenes
1. **Scene 0 — Grant Permission by USSD**:
   - Customer dials `*130*AGENT#` in the phone simulator.
   - Enters demo PIN `1234`.
   - Gate logs `NOMSA: mandate.granted` and `MOMO: momo.preapproval.successful`.
   - Household Agent welcomes Nomsa in Chat.
2. **Scene 1 — Pay R200 Electricity (First Payment)**:
   - Agent proposes R200 to City Power.
   - Detected as first payment to this payee.
   - In-phone PIN approval modal slides up on the phone screen.
   - Customer inputs `1234` and approves $\implies$ settles to MoMo.
3. **Scene 2 — Pay R150 Electricity (Autonomous Settlement)**:
   - Agent proposes R150 electricity.
   - Payee is now known, amount is within limits, risk is $0.06$.
   - Payment settles automatically with zero PIN interruption.
4. **Scene 3 — SIM Swapped Yesterday, Pay R300 School (Blocked)**:
   - SIM swapped switch toggles to ON.
   - Agent proposes R300 to Thuto Primary school fees.
   - Gateway risk model scores $0.87$ ($>0.70$).
   - Payment is instantly **BLOCKED**. Callout displays:
     > *"R300 never left her wallet. MoMo API was never called."*
5. **Scene 4 — Say STOP (Instant Revocation)**:
   - Customer texts `"STOP"` in chat.
   - Mandate is immediately revoked. Status switches to `"Switched Off"`.
   - Subsequent calls return HTTP 403.

---

## 4. Playwright Automation Commands

To perform browser verification programmatically:

```bash
# 1. Open the application in headless Chromium
playwright-cli open http://localhost:3000

# 2. Inspect accessibility tree and DOM refs
playwright-cli snapshot

# 3. Capture high-resolution desktop screenshot
playwright-cli screenshot --filename=.playwright-cli/desktop-verify.png

# 4. Trigger verification of the cryptographic chain
playwright-cli eval "() => document.querySelector('button:has-text(\"Verify Chain\")')?.click()"

# 5. Close browser session
playwright-cli close
```
