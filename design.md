# Design System - Aurora Hotel

> Status: locked
> Approved: 2026-07-31
> Approval-Spec-SHA256: 1545d99b2c484b36cb8c29d90b0ded609810914b52714be3ad369d34091c3900

## Direction
A mobile-first contemporary luxury hospitality experience with calm editorial travel composition, generous warm whitespace, restrained dark sections, cinematic hotel photography, transparent booking information, and conversion-focused interaction. Public pages should feel premium, tranquil, and distinctly Vietnamese without visual excess; operational screens should prioritize speed, clarity, and moderate information density.

## Tone
- Contemporary luxury
- Calm
- Warm premium
- Natural elegance
- Trustworthy
- Conversion-focused

## Reference provenance
- Premium resort and editorial travel experiences: learn calm pacing, immersive photography, and clear hospitality storytelling without copying brand identity
- Professional direct-booking engines: learn transparent availability, pricing, cancellation-policy placement, and three-step checkout ergonomics without copying layouts
- Apple product experiences: learn hierarchy, restraint, and interaction clarity without imitating visual assets

## Brand constraints
- Brand name: Aurora Hotel
- Slogan: Where Every Stay Becomes a Memory
- Primary colors: Aurora Midnight #17211D, Warm Ivory #F7F4ED, Champagne Gold #C5A46D used sparingly
- Secondary colors: Forest Green #355B4B, Terracotta #B97857, Mist Gray #DADDD8, Charcoal #242826, White #FFFFFF
- Semantic colors: success #2E7D5A, warning #C48138, error #B84A4A, information #3F6D8C
- Use an intentional premium serif display face paired with a highly readable modern sans-serif interface face, both supporting Vietnamese
- Do not use neon, cyberpunk, strong gradients, site-wide glassmorphism, heavy 3D, excessive gold, dense finance-dashboard cards, unreadable artistic fonts, or booking-slowing animation
- Never copy logos, imagery, content, color systems, or identity from hotel and OTA brands

## Typography
- Display: Cormorant Garamond, weights 400/500/600.
- Interface: Manrope, weights 400/500/600/700.

## Semantic tokens
- aurora-midnight: #17211D
- warm-ivory: #F7F4ED
- paper: #FFFDF8
- champagne-gold: #C5A46D
- forest-green: #355B4B
- terracotta: #B97857
- mist-gray: #DADDD8
- charcoal: #242826
- success: #2E7D5A
- warning: #C48138
- error: #B84A4A
- information: #3F6D8C

## Component rules
- Header uses left wordmark, centered navigation, and right utilities/booking CTA.
- Hero uses three right-to-left slides with manual controls and a reduced-motion static state.
- Booking console overlaps the hero boundary without consuming the mobile viewport.
- Room showcase uses Suite Spotlight and never uses the rejected Stay Atlas rows.
- Vertical scrolling remains native; Lenis, Locomotive Scroll, and pinned scroll narratives are prohibited.

## Spacing, shape, and hierarchy
- Desktop content width: 1280–1440px (12-column grid)
- Tablet grid: 8 columns; Mobile grid: 4 columns
- Public section spacing: 96–144px desktop, 64–88px mobile
- Radius: surfaces 20–24px, inputs 12–14px, buttons 10–12px, modals 24px

## Motion budget
Level: subtle. Hero horizontal slide, opacity & short vertical reveal, subtle hover scale, progress feedback. Scroll hijacking, long pinned narratives, heavy parallax, and autoplaying fast carousels are prohibited.

## Mobile composition
- Availability search from the homepage
- Date range and guest selection
- Room and rate-plan comparison
- Three-step multi-room booking checkout
- Payment status and booking confirmation
- Booking lookup, management, and cancellation
- Receptionist check-in and check-out
- Housekeeping room-status updates

## Accessibility and performance floor
- Preset: core-web-vitals-good
- Field percentile: p75
- LCP: <= 2500 ms
- INP: <= 200 ms
- CLS: <= 0.1

## Anti-patterns
- Neon or cyberpunk visual language
- Strong decorative gradients
- Site-wide glassmorphism
- Heavy 3D effects or parallax
- Excessive champagne gold
- Dense finance-dashboard card layouts on public pages
- Unreadable artistic fonts
- Motion that delays booking actions
- Fake urgency, fake crossed-out prices, or fabricated reviews
- Hidden taxes, fees, or cancellation terms
- Autoplaying fast carousels and obstructive promotional popups
- Critical information shown only in toast messages
- Desktop layouts merely scaled down for mobile

## Approval
> Status: locked
> Approval-Spec-SHA256: 1545d99b2c484b36cb8c29d90b0ded609810914b52714be3ad369d34091c3900
