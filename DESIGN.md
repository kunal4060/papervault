# DESIGN.md — PaperVault Design System
**Name:** PaperVault — "VIT-AP ka paper vault"
**Direction:** A — "Archive Noir" (selected 8 Oct 2026)
**Status:** v2 — mobile-first, dark-first, professional, deliberately NOT AI-looking.

## Idea
A dark vault of precious documents. Students study at night — meet them there.
The highlighter is the metaphor: what do students *do* with papers? They highlight them.

## Design principles (from research)
1. **Utility first.** Students come to FIND a paper fast. Search is the hero.
2. **One accent, used sparingly.** Signal amber = action + brand moments only.
3. **Typography does the heavy lifting.** Space Grotesk display, Inter body,
   JetBrains Mono for course codes (mono = "this is data").
4. **Flat surfaces, hairline borders.** No decorative gradients, no glows, no glassmorphism.
5. **Real content, real density.** Mock data feels like a real VIT-AP portal.

## Color palette — Archive Noir
| Token | Value | Use |
|---|---|---|
| `--canvas` | #0C0D10 | Page background (near-black, not pure) |
| `--surface` | #14161A | Cards |
| `--surface-plus` | #1C1F24 | Elevated / hover |
| `--hairline` | #26292F | 1px borders |
| `--text` | #EDEAE4 | Primary (warm off-white) |
| `--text-dim` | #9BA0A8 | Secondary |
| `--accent` | #FFB224 | **Signal amber — the highlighter.** CTAs, active states, key stats |
| `--accent-dim` | #8A5E14 | Amber at low emphasis (borders, washes) |
| `--moss` | #4CC38A | Verified / success (desaturated for dark) |
| `--brick` | #F26D5F | Danger / rejected (desaturated for dark) |

Light mode: clean inversion for daytime reading (paper #F7F5F0, ink #14161A, same amber). Dark-first.

## Typography
- **Display:** "Space Grotesk" (700) — headlines, hero, numbers.
- **Body:** "Inter" (400/500/600) — UI text.
- **Mono:** "JetBrains Mono" (500/600) — course codes, filenames, stats.
- Scale (mobile-first): hero 30px → section 20px → card 15px → body 14px → micro 11px.
- Micro-labels: 11px, uppercase, letter-spacing 0.08em, `--text-dim`.

## Spacing & shape
- 4px base scale. Page gutters: 16px mobile / 24px desktop.
- Radius: 12px cards, 999px pills/chips, 10px buttons.
- Borders: 1px `--hairline`; cards get `1px solid`, **no shadow**.
- Section rhythm: 40px mobile / 64px desktop.

## Buttons
- Primary: amber fill `#FFB224`, near-black `#0C0D10` text, 10px radius, semibold.
- Secondary: transparent, 1px hairline border, off-white text.

## Chips (exam types etc.)
- Hairline pills; active = amber text + amber hairline border.

## Signature element — the highlighter swipe
Key phrases and hero stat numbers sit on a hand-drawn-feeling amber marker
stroke (CSS: skewed pseudo-element behind text, 40% opacity). Search matches
in results get the same swipe. Class: `.hl`.

## Ban list
- Decorative purple/blue gradients, neon glows, glassmorphism
- Pastel pill badges for ordinary metadata, cartoon illustrations
- Emoji as UI icons (inline SVG only)
- Generic hero copy
