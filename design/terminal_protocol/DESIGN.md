---
name: Terminal Protocol
colors:
  surface: "#131314"
  surface-dim: "#131314"
  surface-bright: "#3a393a"
  surface-container-lowest: "#0e0e0f"
  surface-container-low: "#1c1b1c"
  surface-container: "#201f20"
  surface-container-high: "#2a2a2b"
  surface-container-highest: "#353436"
  on-surface: "#e5e2e3"
  on-surface-variant: "#b9cbc1"
  inverse-surface: "#e5e2e3"
  inverse-on-surface: "#313031"
  outline: "#83958c"
  outline-variant: "#3a4a43"
  surface-tint: "#00e1ab"
  primary: "#fbfffa"
  on-primary: "#003828"
  primary-container: "#00ffc2"
  on-primary-container: "#007255"
  inverse-primary: "#006c50"
  secondary: "#ecb2ff"
  on-secondary: "#520071"
  secondary-container: "#cf5cff"
  on-secondary-container: "#480063"
  tertiary: "#fcfeff"
  on-tertiary: "#00363f"
  tertiary-container: "#9fedff"
  on-tertiary-container: "#006e7e"
  error: "#ffb4ab"
  on-error: "#690005"
  error-container: "#93000a"
  on-error-container: "#ffdad6"
  primary-fixed: "#36ffc4"
  primary-fixed-dim: "#00e1ab"
  on-primary-fixed: "#002116"
  on-primary-fixed-variant: "#00513c"
  secondary-fixed: "#f8d8ff"
  secondary-fixed-dim: "#ecb2ff"
  on-secondary-fixed: "#320047"
  on-secondary-fixed-variant: "#74009f"
  tertiary-fixed: "#a5eeff"
  tertiary-fixed-dim: "#00daf8"
  on-tertiary-fixed: "#001f25"
  on-tertiary-fixed-variant: "#004e5a"
  background: "#131314"
  on-background: "#e5e2e3"
  surface-variant: "#353436"
typography:
  headline-lg:
    fontFamily: JetBrains Mono
    fontSize: 32px
    fontWeight: "700"
    lineHeight: "1.2"
    letterSpacing: -0.02em
  headline-md:
    fontFamily: JetBrains Mono
    fontSize: 24px
    fontWeight: "600"
    lineHeight: "1.3"
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: "400"
    lineHeight: "1.6"
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: "400"
    lineHeight: "1.5"
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: "400"
    lineHeight: "1.5"
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: "500"
    lineHeight: "1"
    letterSpacing: 0.05em
spacing:
  unit: 4px
  gutter: 16px
  margin: 24px
  container-max: 1440px
---

## Brand & Style

This design system is built for a developer-centric environment, evoking the high-stakes, high-focus atmosphere of a modern command center. The personality is precise, technical, and unapologetically "nerdy," drawing heavy inspiration from cyberpunk aesthetics and terminal interfaces while maintaining the usability of a high-end SaaS tool.

The visual style blends **Modern Minimalism** with **Cyberpunk/Retro-Futurism**. It utilizes a "Matrix-lite" aesthetic characterized by:

- **Terminal Aesthetics:** Heavy reliance on monospaced type and structured data grids.
- **Micro-Detailing:** 1px borders, "crosshair" corner accents, and subtle scanline overlays to create a sense of mechanical precision.
- **Glow & Depth:** Utilizing vibrant neon accents against deep charcoal backgrounds to create high-contrast focal points and a sense of digital energy.
- **Immersive Textures:** Faint background grids (8px intervals) and glassmorphism panels that provide layers of information without breaking the technical immersion.

## Colors

The palette is optimized for long-duration focus in dark environments, using deep blacks to minimize eye strain and vibrant neons to highlight critical path actions.

- **Primary (#00FFC2):** "Matrix Green" — used for primary actions, success states, and active team indicators.
- **Secondary (#BD00FF):** "Cyber Purple" — used for secondary interactive elements, user roles, and special randomization effects.
- **Tertiary (#00E0FF):** "Data Cyan" — used for information callouts, links, and progress indicators.
- **Backgrounds:** The core interface uses `#0a0a0b` for the base layer and `#121214` for elevated panels or containers.
- **Accents:** Use low-opacity versions of the neon colors (10–15%) for "glow" effects and background washes.

## Typography

This system employs a dual-font strategy to balance technical flavor with readability.

- **Technical Data & Labels:** All metadata, status counts, and headers use **JetBrains Mono**. This reinforces the "IDE" feel and ensures that alphanumeric strings (like developer IDs) are perfectly legible.
- **UI Controls & Content:** General interface text, descriptions, and settings use **Inter**. Its neutral, clean architecture prevents the UI from becoming visually overwhelming or "cluttered" during heavy reading tasks.
- **Styling:** Headers should often be paired with a prefix (e.g., `> HEADER`) to simulate a terminal prompt. Labels should be uppercase with slight letter spacing to mimic hardware labels.

## Layout & Spacing

The layout philosophy follows a **Rigid Grid** model. Everything should feel like it "snaps" into place on a technical blueprint.

- **Grid:** A 12-column grid system is used for the desktop application, with a background 8px dot or line grid visible at low opacities (3-5%) to ground the elements.
- **Margins & Gutters:** Consistently use 16px (4 units) for gutters and 24px (6 units) for screen margins.
- **Alignment:** Elements should align to the baseline grid to maintain the "monospaced" feel across the entire UI.
- **Adaptation:** On smaller screens, panels collapse into a single-column vertical stack, but the "terminal" aesthetic is preserved by maintaining the 1px borders and corner accents.

## Elevation & Depth

In this system, depth is not conveyed through soft shadows, but through **Tonal Layering** and **Luminescence**.

- **Surface Levels:**
  - Level 0: `#0a0a0b` (Deep Base)
  - Level 1: `#121214` (Raised Panels/Cards)
  - Level 2: `#1c1c1f` (Popovers/Modals)
- **Glassmorphism:** Use semi-transparent backgrounds (80% opacity) with a `20px` backdrop blur for floating menus. Add a `1px` inner border (stroke) with `20%` white opacity to define the edges.
- **Neon Glows:** Active elements should have a subtle outer glow (box-shadow: `0 0 10px rgba(primary, 0.3)`).
- **Outlines:** Use 1px solid borders (`#252529`) for all containers. Avoid drop shadows unless they are "hard" and color-tinted to match the neon primary colors.

## Shapes

The shape language is strictly **Geometric and Sharp**.

- **Corner Treatment:** Use `0px` roundedness for all primary UI components (cards, inputs, buttons) to emphasize the architectural, technical nature of the system.
- **Corner Accents:** For high-priority cards, add "L-shaped" corner brackets (2px thick) that extend 8px along the top-left and bottom-right edges in the primary neon color.
- **Segments:** Progress bars and selection indicators should be broken into discrete rectangular segments rather than a continuous smooth line.

## Components

- **Buttons:** Sharp corners, 1px border. Default state: `#121214` background with primary color border. Hover state: Primary color background with black text and an outer glow.
- **Technical Cards:** Level 1 background, 1px border. Must include a "header" strip (24px high) containing a label in `label-sm` typography and a status indicator.
- **Status Badges:** Use a "pulsing" dot next to the text. For "Active," use Primary Green; for "Busy," use Cyber Purple.
- **Input Fields:** Styled like terminal inputs. Prefixed with a `$` or `>` symbol. Subtle scanline pattern (linear-gradient) inside the field at 2% opacity.
- **Progress Bars:** Segmented into 10–20 blocks. Filled blocks use a neon gradient; empty blocks use a dark charcoal border.
- **Selection/Checkboxes:** Use custom "X" marks rather than checkmarks to maintain the terminal aesthetic.
- **Team Slots:** Empty slots should be represented by a dotted 1px border with the text "READY FOR INPUT..." in a low-opacity code font.
