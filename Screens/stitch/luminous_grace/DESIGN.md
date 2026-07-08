---
name: Luminous Grace
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9da'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f4'
  surface-container: '#f1edee'
  surface-container-high: '#ebe7e8'
  surface-container-highest: '#e5e1e3'
  on-surface: '#1c1b1c'
  on-surface-variant: '#46464c'
  inverse-surface: '#313031'
  inverse-on-surface: '#f3f0f1'
  outline: '#77767d'
  outline-variant: '#c7c5cc'
  surface-tint: '#5c5d6e'
  primary: '#5c5d6e'
  on-primary: '#ffffff'
  primary-container: '#e6e6fa'
  on-primary-container: '#656677'
  inverse-primary: '#c5c5d8'
  secondary: '#635f40'
  on-secondary: '#ffffff'
  secondary-container: '#e8e0ba'
  on-secondary-container: '#686344'
  tertiary: '#70585b'
  on-tertiary: '#ffffff'
  tertiary-container: '#ffe0e3'
  on-tertiary-container: '#7a6164'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e1e1f5'
  primary-fixed-dim: '#c5c5d8'
  on-primary-fixed: '#191b29'
  on-primary-fixed-variant: '#444655'
  secondary-fixed: '#eae3bc'
  secondary-fixed-dim: '#cec7a2'
  on-secondary-fixed: '#1f1c04'
  on-secondary-fixed-variant: '#4b472b'
  tertiary-fixed: '#fbdbde'
  tertiary-fixed-dim: '#debfc2'
  on-tertiary-fixed: '#281719'
  on-tertiary-fixed-variant: '#574144'
  background: '#fcf8fa'
  on-background: '#1c1b1c'
  surface-variant: '#e5e1e3'
typography:
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  headline-md:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  container-padding: 24px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
  gutter: 16px
---

## Brand & Style

The design system is centered on "Luminous Grace"—a philosophy that prioritizes emotional clarity and effortless elegance. Targeting engaged couples navigating the complexities of wedding planning, the UI aims to reduce cognitive load and "planning fatigue" through high-end editorial aesthetics and ample negative space.

The style is a **Refined Minimalist** approach. It leans heavily on white space to evoke a sense of calm and luxury, reminiscent of a high-end physical wedding invitation. Visual hierarchy is established through sophisticated typography and a "soft-layering" technique rather than heavy borders or loud colors. The emotional response should be one of optimism, serenity, and premium service.

## Colors

The palette is a sophisticated trio of "Bridal Pastels" set against a Pure White foundation. 

- **Primary (Soft Lavender):** Used for primary actions, subtle backgrounds, and signifying "active" states. It represents the dreamlike quality of the event.
- **Secondary (Sage Green):** Employed for success states, botanical accents, and grounding elements. It provides a natural, organic contrast.
- **Tertiary (Dusty Pink):** Reserved for highlights, heart icons, and romantic accents.
- **Pure White (#FFFFFF):** The dominant surface color. All cards and containers sit on white or very light lavender tints to maintain a clean, airy feel.
- **Neutral/Text:** A deep charcoal is used for text instead of pure black to maintain softness, while a muted grey is used for secondary metadata.

## Typography

This design system utilizes a high-contrast typographic pairing to balance tradition with modernity. 

**Playfair Display** is the voice of the brand, used for all major headings and "hero" moments. It should be typeset with slightly tighter letter-spacing in larger sizes to emphasize its elegant serifs.

**Inter** provides a functional, highly readable counterpoint for all utility text, body copy, and form labels. To maintain the sophisticated tone, use `label-caps` for small categories or section overlines, providing a structural rhythm to the page.

## Layout & Spacing

The layout follows a **Fluid Grid** model designed specifically for mobile-first interactions. A generous 24px horizontal margin is enforced to create a "frame" effect around content, enhancing the editorial feel.

Spacing follows a 4px base scale, but emphasizes "Large" increments (16px, 32px, 48px) to prevent the UI from feeling cluttered. Elements within a card should use 16px padding, while the vertical gap between cards should be 24px or 32px to ensure each planning task feels distinct and manageable.

## Elevation & Depth

Hierarchy is achieved through **Ambient Shadows** and **Tonal Layering**. 

1.  **Base Layer:** Pure White (#FFFFFF).
2.  **Surface Layer (Cards):** These use a very soft, diffused shadow (Offset: 0, 4; Blur: 20; Opacity: 4% Black) to appear as if floating slightly above the base.
3.  **Interactive States:** Buttons and active cards use a subtle color-tinted shadow (e.g., a Soft Lavender glow) to indicate focus without breaking the minimalist aesthetic.

Avoid heavy borders; use subtle 1px strokes in a very light grey (#F3F4F6) only when necessary to define boundaries on white-on-white elements.

## Shapes

The design system employs **Rounded** corners (8px for standard components, 16px for large cards) to evoke a friendly, welcoming, and soft atmosphere. 

- **Cards & Inputs:** 8px radius (rounded-md).
- **Primary Buttons:** 12px or fully pill-shaped depending on the context of the CTA.
- **Imagery:** Photos of venues or dresses should always feature a 16px radius to align with the soft aesthetic of the UI containers.

## Components

### Buttons
Primary buttons use a solid Lavender (#E6E6FA) background with deep charcoal text. Secondary buttons are "ghost" style with a Sage Green (#B2AC88) border. All buttons should have a height of at least 48px for easy touch targets.

### Cards
Cards are the primary organizational unit. They must have a white background, the defined ambient shadow, and 16px–24px internal padding. Use "Editorial Style" cards for vendors, featuring a large image with the name in Playfair Display overlapping or immediately below.

### Input Fields
Inputs should be minimalist: a simple 1px bottom border or a very light grey outlined box. Labels should use `body-sm` in a medium grey, moving to a floating state or appearing above the field.

### Chips & Tags
Used for categories like "Booked," "Pending," or "High Priority." These use a pill shape with a 10% opacity fill of the Primary, Secondary, or Tertiary colors and a corresponding dark text color.

### Progress Indicators
Since wedding planning is a journey, use "Soft-Bar" indicators: thin, Sage Green lines that track completion percentages for checklists or budgets.