# MoMo Agent Pay 🐘
### A consent, mandate and risk layer so AI agents can pay on MTN MoMo safely.

> **“The agent proposes. The mandate service disposes.”**  
> *Team 032 Elephants — South Africa · Eswatini · Zambia*  
> *MTN Group Technology Hackathon 2026 · Showcase, 28 October*

---

## Overview

Across Africa, **70.8 million monthly active MoMo users** generate over 13 billion transactions every half-year (~50,000 per minute). Yet today, every telecommunications assistant goes read-only the moment money appears. Not because AI cannot pay—but because **MoMo has no primitive for delegated permission**.

On card rails, delegated agent payments emerged in 2025 (Mastercard). **MoMo Agent Pay** is the first production-grade mobile money counterpart:
- **Customer Consent**: Nomsa grants standing authority via a simple USSD flow (`*130*AGENT#`) protected by her MoMo PIN (`1234`).
- **Zero Balance Custody**: AI models (Claude, Gemini) only converse and propose payment intents. They hold zero funds.
- **Deterministic Hard Limits**: Caps transactions at R500 and monthly spend at R1,000 across whitelisted categories (*Electricity, Airtime, School Fees, Stokvel*).
- **Sub-7ms Adaptive Risk Engine**: Detects SIM swaps, middle-of-the-night timing, and unfamiliar devices, blocking high-risk fraud before MoMo rails are ever touched.
- **Cryptographic Non-Repudiation**: Every decision is committed to an append-only, SHA-256 hash-chained ledger before money can move.
- **One-Word Kill Switch**: Texting `"STOP"` immediately revokes the mandate, cutting agent access without needing model cooperation.

---

## The Three-Column Interactive Cockpit

| Column | Role | Key Capabilities |
| :--- | :--- | :--- |
| **1. Her Phone (Nomsa)** | Customer Touchpoint | Dual-mode: USSD session (`*130*AGENT#`) & WhatsApp Chat; In-phone PIN Step-Up modal; Live budget progress bar; Standing payment schedule. |
| **2. Every Decision** | Mandate & Risk Gateway | Real-time proposal stream; Risk gauge ($0.01$–$0.99$); Rationale tags; Signature zero-loss guarantee callout (*"R300 never left her wallet"*); Interactive custom bill tester. |
| **3. The Audit Log** | Cryptographic Ledger | Append-only SHA-256 hash-chained records; Interactive "Verify Chain" tool; Block Inspector modal with full cryptographic proof; JSON export. |

---

## Live Links

- **Live Production Applet**: [https://ais-pre-mo6u6clqke737rc2n4hsal-985275574707.europe-west2.run.app](https://ais-pre-mo6u6clqke737rc2n4hsal-985275574707.europe-west2.run.app)
- **Development Applet**: [https://ais-dev-mo6u6clqke737rc2n4hsal-985275574707.europe-west2.run.app](https://ais-dev-mo6u6clqke737rc2n4hsal-985275574707.europe-west2.run.app)

---

## Quick Start & Local Development

### Prerequisites
- Node.js $\ge 20$
- npm $\ge 10$

### Installation
```bash
# Clone the repository
git clone https://github.com/your-org/momo-agent-pay.git
cd momo-agent-pay

# Install dependencies
npm install

# Start development server on port 3000
npm run dev
```

### Running Unit Tests
Core mandate rules and hash-chain verification run via Node's native test runner:
```bash
npx --yes tsx --test src/logic/mandateEngine.test.ts
```

### Building for Production
```bash
npm run build
```
The optimized bundle will be created in the `dist/` directory in under 500ms.

---

## Deploying to Vercel

A zero-config `vercel.json` file is included in the root directory:

```bash
# Option 1: Deploy with Vercel CLI
npx vercel --prod

# Option 2: Connect Git repository
# Push to GitHub and import directly at https://vercel.com/new
```

---

## Key Performance Indicators & Benchmarks

- **Decision Latency**: **6.9 ms (p50)**, 11.3 ms (p95)
- **Throughput**: **340 decisions / second** on an untuned 4-vCPU box
- **LLM Token Cost on Settlement**: **0 tokens ($0.00)**
- **Fraud Reduction (Synthetic Test)**: **90.5%** fraud stopped (43% blocked outright)
- **Economic Value Target**: Contributes toward MTN's strategic target of moving advanced services from **37.4% to 50%+** of MoMo revenue by 2030 (R30bn projected AI value creation).

---

## Team 032 Elephants

- **Vuyani Mofolo** — Lead, Product
- **Matthews Thekiso** — Full Stack Engineer
- **Emmanuel Mukanku** — Full Stack Engineer
- **Shepard Mwamba** — Machine Learning

*Everything in this repository is assigned to MTN under clause 8 of the MTN Group Technology Hackathon 2026 Terms & Conditions.*
