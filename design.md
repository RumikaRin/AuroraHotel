# Design System - Aurora Hotel

> Status: locked
> Approved: 2026-08-02
> Approval-Spec-SHA256: b3ee8e2913fbdf0147af57dd25758165de1c9c44e52aaa44091277286b2bedf1

## Direction
An image-led editorial customer experience for one Aurora Hotel & Resort brand:
warm material colors, cinematic room photography, headline directly on imagery,
transparent booking information, and quiet conversion-focused interaction.
Customer pages are desktop-first in composition and have a dedicated mobile
composition; operational screens remain outside this redesign and prioritize
speed, clarity, and moderate information density.

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
- Primary colors: Espresso #261E1A, Warm Ivory #FBF8F2, Antique Brass #B59A6B used sparingly
- Secondary colors: Warm Carbon #191512, Linen #F3EEE7, Walnut #665044, Muted Terracotta #A76D55, Taupe #887A70, White #FFFFFF
- Semantic colors: success #2E7D5A, warning #C48138, error #B84A4A, information #3F6D8C
- Use an intentional premium serif display face paired with a highly readable modern sans-serif interface face, both supporting Vietnamese
- Do not use dark navy/forest-green brand surfaces, chromatic or rainbow gradients, site-wide glassmorphism, heavy 3D, excessive gold, dense finance-dashboard cards, unreadable artistic fonts, or booking-slowing animation
- Never copy logos, imagery, content, color systems, or identity from hotel and OTA brands

## Typography
- Display: Cormorant Garamond, weights 400/500/600.
- Interface: Manrope, weights 400/500/600/700.

## Semantic tokens
- espresso: #261E1A
- warm-carbon: #191512
- linen: #F3EEE7
- warm-ivory: #FBF8F2
- antique-brass: #B59A6B
- walnut: #665044
- terracotta: #A76D55
- taupe: #887A70
- aurora-midnight: #17211D (legacy operational token; not for redesigned customer surfaces)
- forest-green: #355B4B (legacy semantic/operational token; not for redesigned customer surfaces)
- mist-gray: #DADDD8 (legacy semantic/operational token)
- charcoal: #242826
- success: #2E7D5A
- warning: #C48138
- error: #B84A4A
- information: #3F6D8C

## Component rules
- Header uses left wordmark, centered navigation, and right utilities/booking CTA.
- Hero uses direct-on-image editorial copy, localized functional contrast overlays,
  and a reduced-motion static state; no white copy card or chromatic rail.
- Booking console overlaps the hero boundary without consuming the mobile viewport.
- Room showcase uses the approved image-led room reel/spotlight and never uses
  the rejected Stay Atlas rows.
- Hotel Rooms and Resort Suites are presentation groupings over the same existing
  room-category inventory, not new properties or inventory.
- Vertical scrolling remains native; Lenis, Locomotive Scroll, and pinned scroll narratives are prohibited.

## Spacing, shape, and hierarchy
- Desktop content width: 1280–1440px (12-column grid)
- Tablet grid: 8 columns; Mobile grid: 4 columns
- Public section spacing: 96–144px desktop, 64–88px mobile
- Radius: surfaces 20–24px, inputs 12–14px, buttons 10–12px, modals 24px

## Motion budget
Level: subtle. Slow image movement, opacity/short vertical reveal, image mask
reveal, restrained hover scale, and progress feedback. Checkout and payment stay
quiet. Scroll hijacking, long pinned narratives, heavy parallax, particles,
decorative fog, and autoplaying fast carousels are prohibited.

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
> Approval-Spec-SHA256: b3ee8e2913fbdf0147af57dd25758165de1c9c44e52aaa44091277286b2bedf1
