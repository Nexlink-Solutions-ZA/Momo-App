# DESIGN_SYSTEM.md — MTN MoMo Agent Pay Design System

## 1. Brand Identity & Visual Constitution

The visual system for **MoMo Agent Pay** is grounded in the corporate identity of **MTN Group**—Africa’s largest telecommunications and mobile money network—combined with high-precision financial engineering aesthetics.

### Color Palette

| Token | Hex | Tailwind Equivalent | Role |
| :--- | :--- | :--- | :--- |
| **MTN Warm Yellow** | `#FFCC00` | Custom `momo-yellow` | Primary brand mark, primary CTAs, active highlights |
| **MTN Yellow Hover** | `#E5B800` | Custom `momo-yellow-hover` | Hover & focus-visible states |
| **Deep Canvas** | `#090D16` | Custom dark neutral | 60% dominant neutral background |
| **Structural Surface** | `#101522` | `bg-slate-900/90` | 30% card panels, phone chassis |
| **Elevated Surface** | `#161F30` | `bg-slate-800/80` | Modals, active dialogs, input containers |
| **Border Hairline** | `#1E2638` | `border-slate-800` | 1px subtle hairline container boundaries |
| **Settled Emerald** | `#22C55E` / `#16A34A` | `text-emerald-400`, `bg-emerald-950` | Settled transactions, valid hash chain |
| **Step-Up Amber** | `#F59E0B` / `#B45309` | `text-amber-400`, `bg-amber-950` | In-flight PIN confirmation, moderate risk |
| **Blocked Crimson** | `#EF4444` / `#B91C1C` | `text-rose-400`, `bg-rose-950` | Hard rule blocks, high-risk anomalies, SIM swap alert |

---

## 2. Typography & Numerical Discipline

### Type Families
1. **Primary Display & UI Prose**: `Plus Jakarta Sans`, `system-ui`, `sans-serif`
   - Geometric, modern neo-grotesque design with high x-height and open apertures.
   - Used for headers, button labels, chat bubbles, and narrative rationale tags.
2. **Cryptographic & Data Monospace**: `JetBrains Mono`, `ui-monospace`, `monospace`
   - Strict character width uniformity for vertical column alignment.
   - Used for SHA-256 hashes (`#c286eaf7`), USSD terminal text, currency figures, and timestamps.
   - Enforces `tabular-nums` (`font-variant-numeric: tabular-nums`).

### Type Scale
- **Display Hero**: `clamp(1.5rem, 2.5vw, 2rem)`, weight 800/900.
- **Section Headers**: `14px`–`16px` (`text-sm` / `text-base`), uppercase tracking-wider, weight 700.
- **Body UI**: `13px`–`14px` (`text-xs` / `text-sm`), leading 1.45.
- **Micro Metadata**: `10px`–`11px`, muted text (`text-slate-400` / `text-slate-500`).

---

## 3. Anti-AI Slop & Editorial Discipline

This application adheres to strict design hygiene rules:
- **Zero-Pill Metadata**: Static metadata (timestamps, transaction IDs, category names) uses clean unboxed text separated by typographic middots (`·`). Pill badges are reserved strictly for semantic state indicators (`SETTLED`, `BLOCKED`, `STEP-UP`) and interactive segmented control buttons.
- **No Mechanical Code-Comment Headers**: Prohibits prefixing section headers with `//` or `01_`. Headings use natural, clean title-case prose.
- **No Hallucinated Cockpit Gauges**: Risk scores are strictly derived from the logistic regression formula and accompanied by explicit plain-language rationale tags.
- **Single-Elevation Depth**: Cards never nest multiple heavy shadows or borders. Content separation is achieved through whitespace (`gap-4`, `p-3.5`) and hairline borders (`border border-slate-800`).

---

## 4. Component Directory & Micro-Interactions

### A. The Phone Shell (`PhoneSimulator.tsx`)
- **Dimensions**: Realistic fixed-height container (`670px`) with rounded-2xl chassis (`rounded-2xl`).
- **Status Bar**: Mimics native MTN South Africa network lockup: `MTN SA · 23:45`, signal, Wi-Fi, battery (88%).
- **USSD Screen**: Emulates monochrome feature-phone interface (`font-mono`, `#0A0D15` background) with prompt text and PIN submission.
- **Chat Feed**: Emulates WhatsApp/MoMo messaging with outgoing customer bubbles in deep emerald (`#005C4B`) and incoming agent bubbles in charcoal (`#182030`).
- **In-Phone PIN Modal**: Glides in from bottom (`animate-in slide-in-from-bottom-6`) directly over the phone screen, presenting plain language approval without technical jargon.

### B. Decision Card (`DecisionFeed.tsx`)
- **Card States**:
  - `SETTLED`: Left subtle tint, green badge, MoMo mock transaction hash.
  - `BLOCKED`: Deep rose backdrop (`#1A131C/90`), crimson status chip, signature callout banner (*"R300 never left her wallet. MoMo API was never called"*).
  - `STEP_UP`: Amber badge, awaiting customer approval on phone.
- **Risk Progress Bar**: Color-interpolating bar (emerald for `<0.25`, amber for `0.25–0.69`, rose for `≥0.70`).

### C. Cryptographic Audit Card (`AuditLogView.tsx`)
- **Hash Preview**: Truncated 8-character current hash (`#c286eaf7`) and 6-character parent hash (`prev: #0`).
- **Actor Signature Badges**:
  - `NOMSA`: MTN Yellow border.
  - `AGENT`: Indigo/Blue border.
  - `SERVICE`: Purple border.
  - `MOMO`: Emerald border.
- **Interactive Verification**: Pulsing animation during verification, resolving to an accessible checkmark with entry count.
