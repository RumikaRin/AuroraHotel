# Aurora Hotel Route Inventory

> Date: 2026-08-01  
> Scope: Complete App Router & API Route Coverage  

---

## 1. Page Routes (`src/app/**/page.tsx`)

| URL Path | Audience / Role | Source File | Loading / Empty / Error State | Mobile & Desktop | Data Source / APIs | Coverage & Status |
|---|---|---|---|---|---|---|
| `/` | Public | `src/app/page.tsx` | Next.js SSG / Dynamic | Fully Responsive | Prisma / Local Assets | ✅ Complete & Verified |
| `/rooms` | Public | `src/app/rooms/page.tsx` | Loading skeleton | Fully Responsive | Prisma RoomCategories | ✅ Complete & Verified |
| `/rooms/[slug]` | Public | `src/app/rooms/[slug]/page.tsx` | 404 / Loading state | Fully Responsive | Prisma Category & Rates | ✅ Complete & Verified |
| `/booking` | Public / Customer | `src/app/booking/page.tsx` | 3-step stepper, error alert | Fully Responsive | `/api/quote`, `/api/checkout` | ✅ Complete & Verified |
| `/login` | Public / Customer | `src/app/login/page.tsx` | Form validation & feedback | Fully Responsive | NextAuth credentials | ✅ Complete & Verified |
| `/account` | Customer / Staff | `src/app/account/page.tsx` | Loading skeleton & empty stays | Fully Responsive | Prisma User & Bookings | ✅ Complete & Verified |
| `/my-bookings` | Public / Customer | `src/app/my-bookings/page.tsx` | Token lookup & stay list | Fully Responsive | `/api/bookings/lookup` | ✅ Complete & Verified |
| `/operations/reception` | Receptionist / Manager / Admin | `src/app/operations/reception/page.tsx` | Table loading & empty search | Responsive | Prisma Bookings & Rooms | ✅ Complete & Verified |
| `/operations/housekeeping` | Housekeeper / Manager / Admin | `src/app/operations/housekeeping/page.tsx` | Status badge & filter queue | Responsive | Prisma Rooms | ✅ Complete & Verified |
| `/admin` | Manager / Admin | `src/app/admin/page.tsx` | Dynamic stats & links | Responsive | Prisma Metrics | ✅ Complete & Verified |
| `/admin/rooms` | Manager / Admin | `src/app/admin/rooms/page.tsx` | Table pagination & forms | Responsive | Prisma Rooms | ✅ Complete & Verified |
| `/admin/reports` | Manager / Admin | `src/app/admin/reports/page.tsx` | Metric cards & DB aggregation | Responsive | Prisma DB Aggregation | ✅ Complete & Verified |
| `/admin/bookings` | Manager / Admin | `src/app/admin/bookings/page.tsx` | Table & search filters | Responsive | Prisma Bookings | ✅ Complete & Verified |
| `/admin/media` | Manager / Admin | `src/app/admin/media/page.tsx` | Grid gallery & upload modal | Responsive | Blob Adapter & DB | ✅ Complete & Verified |
| `/admin/audit` | Manager / Admin | `src/app/admin/audit/page.tsx` | Filterable audit table | Responsive | Prisma AuditLogs | ✅ Complete & Verified |

---

## 2. API Routes (`src/app/api/**/route.ts`)

| API Path | Method | Access | RBAC / Auth Guard | Rate Limit Bucket | Purpose | Status |
|---|---|---|---|---|---|---|
| `/api/auth/[...nextauth]` | GET, POST | Public | Auth.js Handler | Unlimited | Authentication callbacks | ✅ Verified |
| `/api/health/live` | GET | Public | None | General API | Liveness probe | ✅ Verified |
| `/api/health/ready` | GET | Public | None | General API | Readiness DB probe | ✅ Verified |
| `/api/rooms` | GET | Public | None | General API | List room categories | ✅ Verified |
| `/api/availability` | GET | Public | None | General API | Day-level availability | ✅ Verified |
| `/api/quote` | POST | Public | Zod validated | Public Write | Server quote calculation | ✅ Verified |
| `/api/coupons/verify` | POST | Public / User | Zod validated | Public Write | Coupon validation | ✅ Verified |
| `/api/services` | GET | Public | None | General API | List add-on services | ✅ Verified |
| `/api/checkout` | POST | User / Customer | `requireUser`, Idempotency | Public Write | Process booking checkout | ✅ Verified |
| `/api/bookings/lookup` | POST | Public / User | Verification Token | Public Write | Guest booking lookup | ✅ Verified |
| `/api/refunds` | POST | Admin | `requireAdmin`, Idempotency | Admin Write | Process payment refund | ✅ Verified |
| `/api/cron/cleanup` | GET, POST | System | `CRON_SECRET` Bearer | Restricted | Daily media/temp cleanup | ✅ Verified |
| `/api/internal/jobs/daily-maintenance` | GET | System | `CRON_SECRET` Bearer | Restricted | Daily maintenance job | ✅ Verified |
