# DESIGN_RESEARCH.md — PaperVault Design Research
**Date:** 8 Oct 2026 | **Purpose:** Tim picks ONE direction before any page code is written.
**Rule:** 100% original. These directions learn *principles* from references — no copying.

---

## 1. RESEARCH FINDINGS (principles, not copies)

### Linear.app — the precision instrument
- Dark is the *substrate*, not a theme. Near-monochrome; color used only for
  status + one accent. No decorative color, no gradients-for-vibe.
- Hairline (1px) borders instead of shadows; tight, sharp typography.
- Inter Display for headings, Inter for body, **monospace for anything that is data**
  (IDs, codes, values) — a clear signal of "this is data".
- Philosophy: *remove everything that isn't the work.* Show real product UI as
  the visual texture instead of marketing illustration.

### Stripe / Linear / Vercel (shared principles)
- Aggressively high contrast. Generous whitespace — "take what feels like enough
  spacing, then double it."
- Monochrome foundation + **exactly one accent color** used sparingly.
  One color used sparingly hits harder than five used everywhere.
- Sharp, geometric typography — never rounded/friendly for infrastructure products.

### Raycast — the command palette as brand
- Single dark canvas with a 4-step surface ladder (near-black → slightly lighter).
- **White pill CTA** as the universal primary action on dark.
- One signature typographic detail (their Inter `ss03` alternate glyph set) —
  a tiny distinction that makes type feel owned.
- Exactly ONE decorative moment (a red diagonal-stripe banner); everywhere else,
  total restraint.

### Awwwards winners (patterns across 2024–2026)
- **Restraint over decoration wins.** Igloo (Site of the Year): two colors total.
- **One metaphor, committed completely.** A dev-docs site designed as a rare-book
  library × terminal — every detail serves the metaphor.
- **Kinetic typography as layout.** One typeface doing all the work, stretched
  and set with total confidence.
- **The interface demonstrates the product** (Active Theory) — the site IS the proof.

### Notion / Craft — warm editorial
- Warm paper backgrounds, editorial serif/sans mix, calm generous spacing.
- Feels like a well-made document, not software. Trust through craft.

### Arc (mobile) — joy as a feature
- "Skeuomorph-ish": physicality, depth, tactile fun. Software can be joyful
  without being childish. Tactile cards, playful depth.

### Dark mode done right (technical)
- Layered dark greys (`#121212 → #1E1E1E → #2A2A2A`), never pure black.
- Off-white text (`#E0E0E0`), never pure white.
- Desaturate accents 15–25% on dark so they don't vibrate.

### Ban list (applies to ALL directions)
- Decorative purple/blue gradients, neon glows, glassmorphism without boundaries
- Pastel pill badges for ordinary metadata, cartoon illustrations
- Emoji as UI icons (inline SVG only)
- Generic hero copy ("Welcome to our amazing platform")

---

## 2. SHARED FOUNDATIONS (all three directions)

- Mobile-first, single column; `md:` 2-col, `lg:` sidebar layouts.
- Min 44px touch targets. 4px spacing scale.
- **Course codes always in monospace** (CSE3002) — the "this is data" signal.
- Micro-labels: 11px, uppercase, tracked 0.08em.
- Real VIT-AP content in mock data (CSE3002, MAT1001, CAT-1/CAT-2/FAT…).
- Accessibility: contrast ≥ 4.5:1 for text, visible focus states.

---

## 3. DIRECTION A — "ARCHIVE NOIR" (bold / memorable)

**Idea:** A dark vault of precious documents. Students study at night — meet them there.
The highlighter is the metaphor: what do students *do* with papers? They highlight them.

**Palette**
| Token | Hex | Use |
|---|---|---|
| Canvas | `#0C0D10` | Page background (near-black, not pure) |
| Surface | `#14161A` | Cards |
| Surface+ | `#1C1F24` | Elevated / hover |
| Hairline | `#26292F` | 1px borders |
| Text | `#EDEAE4` | Primary (warm off-white) |
| Text-dim | `#9BA0A8` | Secondary |
| Accent | `#FFB224` | **Signal amber — the highlighter.** CTAs, active states, key stats |
| Accent-dim | `#8A5E14` | Amber at low emphasis (borders, washes) |
| Moss | `#4CC38A` | Verified / success (desaturated for dark) |
| Brick | `#F26D5F` | Danger / rejected (desaturated for dark) |

**Typography**
- Display: **Space Grotesk** 700 — headlines, hero numbers. Technical, distinctive.
- Body: **Inter** 400/500/600.
- Mono: **JetBrains Mono** 500/600 — course codes, filenames, stats.

**Buttons & cards**
- Primary: amber fill (`#FFB224`), near-black text, 10px radius, semibold.
- Secondary: transparent, 1px hairline border, off-white text.
- Cards: `#14161A` surface, 1px `#26292F` border, 12px radius, *no shadow*.
- Chips (exam types): hairline pills; active = amber text + amber hairline border.

**Distinctive element — the highlighter swipe.**
Key phrases and the hero stat numbers sit on a hand-drawn-feeling amber
marker stroke (CSS: skewed pseudo-element behind text, 40% opacity). Search
matches in results get the same swipe. It says "study" instantly and no
competitor uses it.

**Dark-mode excellence:** this direction IS dark-first; light mode is a clean
inversion (paper `#F7F5F0`, ink `#14161A`, same amber) for daytime reading.

**Vibe:** Linear meets a midnight library. Confident, a little rebellious,
unforgettable on a phone screen at 1 AM before CAT-2.

---

## 4. DIRECTION B — "READING ROOM" (clean / premium minimal)

**Idea:** A university reading room — quiet, scholarly, permanent. Editorial
typography does the talking. For students (and parents, and faculty) who want
the portal to feel *trustworthy*.

**Palette**
| Token | Hex | Use |
|---|---|---|
| Paper | `#F7F4ED` | Page background (warm paper) |
| Card | `#FFFFFF` | Surfaces |
| Ink | `#1B1E24` | Primary text |
| Ink-soft | `#62666E` | Secondary |
| Line | `#E4DFD2` | Hairline borders (warm) |
| Accent | `#1E5B41` | **Library green.** CTAs, active states, verified |
| Accent-deep | `#14402E` | Hover |
| Accent-wash | `#E7F0EA` | Tinted backgrounds |
| Seal | `#B3402A` | **Seal vermillion** — used ONLY for the "verified/admin" stamp motif |
| Amber | `#9A6B1E` | Pending |

**Typography**
- Display: **Fraunces** (serif, 600/700, optical sizing) — headlines with
  real editorial character. Uncommon in edtech = instantly distinctive.
- Body: **Inter** 400/500.
- Mono: **IBM Plex Mono** — course codes.

**Buttons & cards**
- Primary: library-green fill, white text, 8px radius (slightly sharper = formal).
- Secondary: white, 1px warm border.
- Cards: white, 1px `#E4DFD2`, 10px radius, whisper shadow.
- Section numbering: "01 — Browse", "02 — Trending" in mono micro-labels.

**Distinctive element — the catalog card.**
Subject cards styled as library catalog index cards: a small tab notch at top,
mono code as the "call number", ruled hairline under the title. The admin
"Verified" badge is a **round seal-stamp** (vermillion ring, serif "V") rather
than a generic checkmark pill. Scholarly, ownable, memorable.

**Vibe:** Notion's calm meets a university library. Premium, calm, credible —
the direction a professor would forward without embarrassment.

---

## 5. DIRECTION C — "NOTICE BOARD" (playful / student energy)

**Idea:** The campus notice board — loud, urgent, alive. Papers drop like
announcements; trending papers scroll like a ticker. Built for WhatsApp-forward
energy and exam-week adrenaline.

**Palette**
| Token | Hex | Use |
|---|---|---|
| Base | `#FFFDF6` | Warm white base |
| Ink | `#191817` | Text (warm near-black) |
| Line | `#191817` | Borders are INK, not gray (poster look) |
| Accent | `#FF4D00` | **Poster orange-red.** CTAs, ticker, badges — used BOLDLY |
| Accent-ink | `#FFFFFF` | Text on accent |
| Teal | `#0E7C6B` | Sparingly: AI insight cards, success |
| Paper-yellow | `#FFF3D6` | Highlight washes, sticky-note backgrounds |

**Typography**
- Display: **Bricolage Grotesque** 700/800 — chunky, quirky, full of character.
- Body: **Inter** 500/600 (slightly heavier than usual for punch).
- Mono: **Space Mono** 700 — course codes, LOUD.

**Buttons & cards**
- Primary: `#FF4D00` fill, white text, 12px radius, **hard offset shadow**
  (`3px 3px 0 #191817`) — tactile, pressable, fun.
- Cards: white, **2px ink border**, 14px radius, hard offset shadow on featured
  cards. Flat elsewhere.
- Chips: 2px ink-bordered pills; active = accent fill.

**Distinctive element — the ticker + tape.**
A marquee ticker under the hero scrolls live trends:
"▲ CSE3002 CAT-2 ’25 — 1.2k downloads · ▲ BIT1001 FAT ’24 — 980 downloads ·"
New papers get a rotated **tape-strip label** ("NEW", "HOT") stuck on the card
corner like tape on a notice. Playful, kinetic, impossible to confuse with a
generic SaaS page.

**Vibe:** Arc's joy meets an Indian campus fest poster. Loud in a disciplined
way — every loud element earns its place. Most shareable of the three.

---

## 6. COMPARISON

| | A — Archive Noir | B — Reading Room | C — Notice Board |
|---|---|---|---|
| First impression | Bold, midnight, elite | Calm, scholarly, premium | Loud, fun, alive |
| Accent | Signal amber `#FFB224` | Library green `#1E5B41` | Poster orange `#FF4D00` |
| Display font | Space Grotesk | Fraunces (serif) | Bricolage Grotesk |
| Dark mode | Native (dark-first) | Light-first, dark later | Light-first, dark later |
| Signature element | Highlighter swipe | Catalog cards + seal stamp | Ticker + tape labels |
| Risk | Dark can tire in daylight | Could feel "serious"/slow | Could feel less "studious" |
| Best for | Night-before-exam grind | Trust, faculty sharing | Virality, student buzz |

## 7. RECOMMENDATION

**Direction A (Archive Noir)** is the strongest pick: most distinctive on a phone,
dark mode is a genuine functional win for night studying, the highlighter
metaphor is ownable and no competitor uses it, and it photographs/shares well.
Direction B is the safe premium fallback; Direction C the highest-energy option
if Tim wants maximum shareability.

## 8. NEXT STEPS (after Tim picks)
1. Lock palette hex codes + font files into `DESIGN.md` / Tailwind `@theme`.
2. Build a small component gallery (buttons, cards, chips, inputs) in the chosen
   direction before pages — approve the *atoms* first.
3. Then build Home page (§3.1) in that direction with mock data.
4. No Firebase wiring until design is approved on-device.
