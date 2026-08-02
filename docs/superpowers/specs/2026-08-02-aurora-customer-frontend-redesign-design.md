# Aurora Customer Frontend Redesign — Image-led Editorial V9

> Visual direction approved by owner: 2026-08-02  
> Written specification status: awaiting owner review  
> Implementation status: not started

## 1. Objective

Redesign Aurora Hotel's customer-facing frontend to feel luxurious, warm,
approachable, and distinctive while increasing completed direct bookings. The
desktop composition is designed first, followed by a dedicated mobile
composition. The redesign must preserve every existing backend, API, payload,
validation, database, authentication, payment, authorization, and business
rule.

The approved visual direction is **Image-led Editorial V9**. Hotel and resort
photography is the principal visual content. Typography sits directly on the
hero image rather than inside a white card. Warm material colors and restrained
motion support the photography instead of competing with it.

## 2. Scope

### Included

- Customer-facing header, navigation, footer, and public design system.
- Homepage and availability entry point.
- Room discovery, search results, room details, and rate-plan presentation.
- Customer booking flow, login handoff, confirmation, booking lookup, and
  cancellation presentation.
- Customer-facing experiences and offers pages.
- Desktop-first implementation followed by a purpose-designed mobile layout.
- Accessibility, performance, SEO, motion, and responsive quality for the
  customer journey.

### Excluded

- Admin pages and components.
- Reception pages and components.
- Housekeeping pages and components.
- Backend services, API routes, route authorization, schemas, payloads,
  validation, database models, migrations, authentication, payment, webhook,
  pricing, availability, inventory, coupon, cancellation, or booking rules.
- New properties, villas, room inventory, payment providers, saved stays,
  reviews, deposits, or guest checkout.

## 3. Product positioning

Aurora remains one official hospitality brand and one backend inventory. It is
not a marketplace and does not gain a property selector.

"Hotel" and "Resort" are customer-facing editorial groupings only:

- **Hotel Rooms:** existing Deluxe room categories for convenient city and
  short-stay journeys.
- **Resort Suites:** existing Executive and Presidential suite categories for
  more spacious, private stays.

These groupings must be derived from existing room-category data or an explicit
frontend mapping. They must never create a new property, room category, rate,
availability pool, or database record.

## 4. Preserved frontend-backend contracts

The redesign may change presentation and navigation, but the following
contracts remain authoritative.

| Capability | Existing contract | Frontend rule |
| --- | --- | --- |
| Availability | `GET /api/availability?checkIn&checkOut&guests&roomCategoryId?` returns `{ success, data: [{ category, minAvailableCount }] }` | Submit the existing query names and treat the response as the only availability source. Never fabricate scarcity. |
| Room catalog | `GET /api/rooms` | Render existing room IDs, categories, media, capacity, and rates. Do not create villa or resort inventory in the client. |
| Search navigation | Existing homepage/search journey passes `checkIn`, `checkOut`, and `guests` to the rooms experience | Preserve parameter names across redirects and navigation. |
| Quote | `POST /api/quote` accepts dates, `rooms[]`, optional `couponCode`, and optional `services[]` | The returned server breakdown is the only authoritative price. The UI cannot calculate a final payable amount independently. |
| Services | `GET /api/services` | Only returned services may appear as purchasable add-ons. Editorial dining or wellness content does not imply an available checkout add-on. |
| Coupon | `POST /api/coupons/verify` | Keep the existing request shape, response handling, and validation messages. |
| Checkout | `POST /api/checkout` requires the authenticated user and an `idempotency-key` header | Preserve authentication and stable checkout intent. Disable duplicate submission without changing server idempotency behavior. |
| Payment method | Existing accepted values are `CREDIT_CARD`, `BANK_TRANSFER`, `CASH`, and `MOCK_PAYMENT` | Never submit presentation-only values such as `PAY_AT_HOTEL`. Labels may be rewritten only when mapped to a valid existing value. |
| Booking lookup/cancel | Existing lookup and cancellation flow under `/api/bookings/lookup` | Preserve identifying fields, authorization, cancellation validation, and state transitions. |

### Known integration risks to resolve only in the frontend

- The current rooms journey does not consistently consume real availability.
- The optional `roomCategoryId` query is parsed by the route but is not applied
  by the current service call. The redesign must not claim category-level
  filtering until the existing behavior supports it; changing the service is
  outside this redesign.
- The current booking UI exposes `PAY_AT_HOTEL`, which is not an accepted
  checkout value. The redesigned control must use an existing valid value.
- The current checkout replay response may not contain every confirmation field
  expected by the UI. The UI must tolerate the existing response without
  inventing a booking number or amount.
- Existing hard-coded room-detail content, dummy account content, local-only
  language state, fake hold timers, and fake QR presentation must not be carried
  into the redesigned customer journey as if they were server-backed facts.

## 5. Approved visual direction

### 5.1 Character

- Contemporary hospitality luxury rather than palace ornamentation.
- Warm, human, and tactile rather than dark-blue corporate luxury.
- Editorial composition with generous negative space.
- Photography-led storytelling with quiet, precise interface controls.
- Resort atmosphere without changing the single-property data model.

### 5.2 Color system

| Token | Value | Use |
| --- | --- | --- |
| Espresso | `#261E1A` | Primary dark sections, text, booking CTA |
| Warm Carbon | `#191512` | Image overlays and high-contrast surfaces |
| Linen | `#F3EEE7` | Main light page background |
| Warm Ivory | `#FBF8F2` | Forms, booking console, quiet panels |
| Walnut | `#665044` | Secondary dark accents |
| Antique Brass | `#B59A6B` | Fine rules, active states, restrained highlights |
| Muted Terracotta | `#A76D55` | One warm editorial accent per composition |
| Taupe | `#887A70` | Secondary text and borders |

Semantic success, warning, error, and information colors retain their existing
meaning and must not be replaced by brand accents.

Rules:

- No dark navy or forest-green brand surfaces in the redesigned customer area.
- No chromatic, rainbow, aurora, or decorative multi-color gradient.
- Image readability gradients may use transparent Warm Carbon because they are
  functional overlays, not decorative color effects.
- Do not use gold on every control. Antique Brass is reserved for rules,
  selected states, and small typographic details.
- Each viewport composition should have at most one warm accent color in
  addition to neutral materials and the photography.

### 5.3 Typography

- Display: Cormorant Garamond, weights 400–600, with Vietnamese glyph support.
- Interface and body: Manrope, weights 400–700.
- Large headlines use editorial line breaks, compact leading, and restrained
  italics.
- Body copy stays readable and concise; decorative uppercase labels are never
  used for essential instructions.

### 5.4 Shape and depth

- Public imagery may be rectangular or use a restrained 0–12px radius.
- Booking forms and utility surfaces may use 10–14px radii.
- Large generic rounded cards are not the default content container.
- Depth comes from image overlap, scale, warm material contrast, and soft
  shadows rather than glassmorphism or floating card stacks.

## 6. Homepage composition

### 6.1 Header

- Wordmark on the left.
- Desktop navigation centered around Rooms & Suites, Resort Life, Dining,
  Wellness, Gallery, and Offers.
- Language, booking lookup/account, and the primary booking CTA on the right.
- Header sits over the hero initially and gains a calm opaque material surface
  when required for readability while scrolling.

The navigation labels may change, but every destination must resolve to an
existing customer route or a valid anchor. No dead navigation item is allowed.

### 6.2 Hero

- One dominant full-bleed hotel or resort photograph.
- Headline and supporting copy sit directly on the image. A white or ivory text
  card behind the hero copy is prohibited.
- A localized transparent Warm Carbon gradient provides contrast on the left
  and bottom without obscuring the room or resort photograph.
- The approved headline style uses white text with a restrained Antique Brass
  italic phrase.
- One optional secondary "living moment" image may appear on wide desktops.
  Its caption overlays the image; it does not use a white card.
- A thin neutral keyline and short brass rule may frame the composition. There
  is no chromatic rail, halo, particle field, glow orbit, or decorative fog.
- The availability console remains a distinct Warm Ivory utility surface at the
  bottom of the hero. This is a functional form and is the only large light
  surface allowed inside the hero.

### 6.3 Booking console

- Check-in, check-out, guests/rooms, and the existing search action remain
  visible and keyboard operable.
- Field names and submitted query parameters do not change.
- Date constraints and validation remain consistent with the current frontend
  and backend.
- Direct-booking trust messages must describe real policies only.
- No fake countdown, fake remaining-room badge, crossed-out price, or urgency
  message.

### 6.4 Room focus

- Room photography occupies approximately 70–80% of the primary room stage.
- One selected room image is shown at editorial scale with a small adjacent
  strip for other existing room categories.
- Price labels are treated as starting/catalog information until the server
  quote is available.
- Room capacity, amenities, availability, rate plan, cancellation, and final
  totals must come from their existing authoritative sources.

### 6.5 Hotel and resort storytelling

- "Hotel Rooms" and "Resort Suites" provide two emotional entry points into
  the same catalog.
- Dining, wellness, gallery, and resort-life sections create desire through
  photography and editorial copy.
- Editorial experiences must not be rendered as purchasable services unless
  returned by `/api/services`.

## 7. Booking journey

The public landing experience may be cinematic. Once a customer starts booking,
the interface becomes quiet, compact, and explicit.

1. **Discover:** homepage, rooms, suites, resort life, dining, wellness.
2. **Search:** submit existing dates and guest parameters.
3. **Select:** compare real room categories, availability, and existing rate
   plans.
4. **Personalize:** choose only existing API-provided services and coupon
   behavior.
5. **Review:** show the server quote, tax/fee breakdown, cancellation terms, and
   authentication requirement.
6. **Confirm:** submit the unchanged checkout payload with one stable
   idempotency key.
7. **Recover/manage:** use existing confirmation, lookup, status, and
   cancellation behavior.

The redesign must never turn a pending or ambiguous result into a visual
success state.

## 8. Motion system

Allowed public motion:

- Very slow image zoom or horizontal image transition.
- Short opacity and vertical text reveal.
- Image mask reveal when a section enters the viewport.
- Restrained 1.02–1.04 image scale on hover.
- Progress and focus feedback for carousel and booking controls.

Rules:

- Motion uses transform and opacity where possible.
- `prefers-reduced-motion` provides a stable, non-animated state.
- No scroll hijacking, pinned storytelling, heavy parallax, particles, 3D
  camera, decorative fog, or continuous glow animation.
- Search, authentication, quote, checkout, payment, confirmation, and booking
  management do not use decorative animation.
- Motion cannot delay access to a booking control or alter layout stability.

## 9. Desktop and mobile composition

### Desktop-first implementation

- 1280–1440px content system with large image stages and asymmetric editorial
  overlap.
- Hero copy occupies the left visual field while preserving the architectural
  focal point of each image.
- Availability remains visible without requiring a scroll on common desktop
  viewports.
- Room comparison uses image scale and clear metadata, not a dense card grid.

### Dedicated mobile composition

- Mobile is designed after the desktop direction is stable, but it is not a
  scaled desktop page.
- Hero uses a separate crop, shorter headline, and no secondary living-moment
  image.
- Availability becomes a compact, accessible booking trigger or stacked form
  without consuming the entire first viewport.
- Room stages become swipeable or vertically sequenced with visible controls
  and no hidden critical content.
- Sticky booking actions must not cover form errors, browser controls, or
  cancellation/payment information.

## 10. Accessibility, SEO, and performance

- WCAG 2.2 AA contrast, focus order, focus visibility, target size, and semantic
  landmark requirements apply to every customer page.
- Hero and carousel controls require accessible names, pause behavior, and a
  static reduced-motion state.
- Essential content and controls cannot exist only on hover or inside a visual
  animation.
- Use responsive image sizes and preserve the hero LCP image priority.
- Avoid layout shift from fonts, media, booking controls, or sticky actions.
- Target p75 LCP <= 2.5s, INP <= 200ms, and CLS <= 0.1.
- Page titles, descriptions, headings, image alt text, and internal navigation
  remain meaningful for both Vietnamese and English content.

## 11. Implementation boundaries

- Customer components may be replaced, reorganized, or removed when their
  backend contracts are preserved.
- Shared components must not cause visual or behavioral changes in admin,
  reception, or housekeeping areas.
- Operational layouts should be isolated before changing shared global tokens.
- Any control that looks interactive must be functional, route to an existing
  destination, or be removed.
- Temporary concept assets and Visual Companion files are not production
  assets and are not part of the implementation commit.

## 12. Verification gates

Required repository gates:

- `npm run ui:contract-check`
- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run design:check`
- `npm run build`
- `npm run e2e`

Additional redesign evidence:

- Desktop visual screenshots for homepage, rooms, room detail, and each booking
  step.
- Dedicated mobile screenshots for the same booking journey.
- Keyboard-only availability and checkout walkthrough.
- Reduced-motion verification.
- API request/payload comparison for availability, quote, coupon, services,
  checkout, lookup, and cancellation.
- Negative checkout tests for invalid payment value, duplicate submission,
  unauthenticated submission, price conflict, and unavailable inventory.
- Regression proof that admin, reception, and housekeeping source and routes
  were not redesigned.

## 13. Acceptance criteria

- The customer area matches Image-led Editorial V9: warm material palette,
  photography-first composition, and headline directly on the hero image.
- No dark navy/forest-green brand theme or chromatic decorative gradient remains
  in the redesigned customer area.
- Room and resort photography remains the dominant content.
- Availability, quotes, services, coupons, checkout, authentication, payment,
  lookup, and cancellation use their existing contracts without mutation.
- Hotel/Resort grouping does not create or imply new backend inventory.
- Unsupported fake functionality and urgency presentation are absent.
- Desktop and dedicated mobile booking journeys are complete and accessible.
- Admin, reception, and housekeeping are unchanged by the redesign.
- All required quality gates pass with retained evidence.

## 14. Approval and next step

The owner approved the V9 visual direction in chat on 2026-08-02. The temporary
Visual Companion prototype is located at:

`.superpowers/brainstorm/codex-20260802120909632/content/photo-led-chromatic-v7.html`

This document must be reviewed by the owner before the design lock is updated
and before an implementation plan or application-source changes are made.
