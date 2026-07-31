# Aurora Hotel Role-Screen-Action Matrix

> Date: 2026-08-01  
> Coverage: 6 Server-Enforced Roles (`GUEST`, `CUSTOMER`, `RECEPTIONIST`, `HOUSEKEEPER`, `MANAGER`, `ADMIN`)  

---

| Route / Action | GUEST | CUSTOMER | RECEPTIONIST | HOUSEKEEPER | MANAGER | ADMIN | Tested Guard |
|---|---|---|---|---|---|---|---|
| **`/` (Homepage)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Route |
| **`/rooms` & `/rooms/[slug]`** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Public Route |
| **`/booking` (Checkout)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | `requireUser` on submit |
| **`/my-bookings` (Lookup)** | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | ✅ Allowed | Token Verification |
| **`/account` (Customer Portal)** | ❌ Denied | ✅ Own Only | ✅ Own Only | ✅ Own Only | ✅ Own Only | ✅ Own Only | `requireUser` |
| **`/operations/reception`** | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ Denied | ✅ Allowed | ✅ Allowed | `requireStaff` |
| **`/operations/housekeeping`**| ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | ✅ Allowed | `requireStaff` |
| **`/admin` (Management)** | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | `requireAdmin` |
| **`/admin/reports`** | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | `requireAdmin` |
| **`/admin/media`** | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | `requireAdmin` |
| **`/admin/audit`** | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | `requireAdmin` (`ADMIN` only) |
| **`/api/refunds` (POST)** | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | `requireAdmin` |
| **`room:assign` Mutation** | ❌ Denied | ❌ Denied | ✅ Allowed | ❌ Denied | ✅ Allowed | ✅ Allowed | `assertPermission` |
| **`room:update_cleaning`** | ❌ Denied | ❌ Denied | ❌ Denied | ✅ Allowed | ✅ Allowed | ✅ Allowed | `assertPermission` |
