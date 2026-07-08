---
name: Forever Vow
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e5e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4d4635'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#7f7663'
  outline-variant: '#d0c5af'
  surface-tint: '#735c00'
  primary: '#735c00'
  on-primary: '#ffffff'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#e9c349'
  secondary: '#715859'
  on-secondary: '#ffffff'
  secondary-container: '#f9d8d8'
  on-secondary-container: '#755d5d'
  tertiary: '#4f6450'
  on-tertiary: '#ffffff'
  tertiary-container: '#a2b9a2'
  on-tertiary-container: '#364a38'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#fcdbdb'
  secondary-fixed-dim: '#dfbfbf'
  on-secondary-fixed: '#281717'
  on-secondary-fixed-variant: '#584142'
  tertiary-fixed: '#d1e9d0'
  tertiary-fixed-dim: '#b5cdb5'
  on-tertiary-fixed: '#0c1f11'
  on-tertiary-fixed-variant: '#374c3a'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e5e2e1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 36px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.05em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.2'
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-max: 1280px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 64px
  stack-lg: 48px
  stack-md: 24px
  stack-sm: 12px
---

## Brand & Style
The design system is anchored in "Cinematic Romance"—a philosophy that treats every wedding planning task as a curated, editorial experience. It targets a high-end demographic seeking a stress-free, aesthetically pleasing journey toward their wedding day. 

The visual style is a sophisticated blend of **Apple-inspired Minimalism** and **Modern Luxury**. It utilizes vast amounts of "breathing room" (whitespace), soft glassmorphic layers to create depth without clutter, and a refined tactile feel that mimics physical wedding stationery. The emotional response is intended to be calm, intentional, and deeply celebratory.

## Colors
The palette is inspired by natural textures and precious metals. 
- **Ivory (#FAF7F2):** The primary canvas. Use this for the base background of all screens to provide a warmer, more premium feel than pure white.
- **Champagne Gold (#D4AF37):** Reserved for moments of high importance—primary actions, active states, and delicate decorative borders.
- **Dusty Rose & Sage Green:** Used as soft secondary accents. Sage represents growth and success (checkmarks, completed tasks), while Rose highlights emotional milestones (guest list confirmations, favoriting vendors).
- **Charcoal (#222222):** The primary ink color. Used for maximum legibility and high-contrast headlines.

## Typography
The typographic hierarchy creates an editorial "lookbook" feel. High-contrast **Playfair Display** is used for storytelling—titles, section headers, and hero statements—to evoke a sense of tradition and elegance. 

**Inter** provides a functional counterpoint. It is used for all utility text, body copy, and interactive labels. To maintain the premium aesthetic, body text should always have generous line-height (1.5–1.6) and labels should often use subtle letter spacing to create a clean, airy appearance.

## Layout & Spacing
The layout follows a fluid-to-fixed model. On desktop, content is centered in a 1280px container with wide 64px margins to emphasize exclusivity. 

Spacing is intentionally generous. Elements should never feel crowded. Use a vertical "stack" rhythm based on multiples of 8px, but lean toward the larger values (`stack-lg`) to separate major conceptual sections. This "luxury of space" mimics high-end print magazines.

## Elevation & Depth
Depth is achieved through a combination of **Glassmorphism** and **Ambient Shadows**. 

1.  **The Base Layer:** Ivory background (#FAF7F2).
2.  **The Glass Layer:** Overlays, navigation bars, and modal backgrounds use a semi-transparent white (#FFFFFF at 70-80% opacity) with a high `backdrop-filter: blur(20px)`.
3.  **The Shadow:** Elevated cards use a "Large Ambient Shadow": `0 20px 40px rgba(34, 34, 34, 0.05)`. The shadow should be extremely soft, low-opacity, and slightly tinted with the neutral charcoal color to feel natural.

## Shapes
Shape language is defined by extreme softness and fluidity. All primary containers and cards use a `rounded-xl` (24px) or higher radius. Primary buttons are fully pill-shaped (rounded-full) to provide a soft, inviting touchpoint. This roundedness mimics the curves of organic floral arrangements and premium wedding invitations.

## Components
- **Buttons:** Primary buttons are pill-shaped with a Champagne Gold background and Charcoal text. On hover, apply a subtle scale-up (1.02x) and a soft glow.
- **Cards:** Cards use a pure White background, 24px corner radius, and a 1px border in a very faint Gold or Ivory-Darker shade (#F0EBE0).
- **Inputs:** Text fields should be "ghost style"—no background, just a delicate bottom border in Charcoal (20% opacity) that strengthens to 100% on focus.
- **Chips/Tags:** Used for "Vendor Categories" or "Guest Status." These use a light wash of Sage or Rose with text in the same hue at high saturation.
- **Progress Indicators:** Use thin, elegant lines in Gold. Avoid thick, "gamified" bars.
- **Imagery:** All images should feature a subtle 12px corner radius and be presented in large formats to maintain the "cinematic" feel.