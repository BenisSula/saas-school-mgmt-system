## Login Access Investigation

### Summary
- Users reported that sign-in accepted their credentials but immediately redirected them back to the login screen with “Account pending admin approval”.
- Issue was reproducible whenever the app tried to rehydrate a session (initial load or refresh token exchange).

### Root Cause
- The `/auth/refresh` endpoint fetched `id, email, role, tenant_id, is_verified` but **omitted the `status` column**. Every refresh response therefore surfaced `status: undefined`, which defaulted to `'pending'` on the frontend and triggered an automatic logout.
- Legacy databases that had not run the status migration (or rows where the column was still `NULL`) also caused the login endpoint to emit `'pending'`, locking verified admins/superadmins out of their dashboards.

### Fix
1. Added a shared `resolveUserStatus()` helper in `backend/src/services/authService.ts` that:
   - Uses the stored status when present.
   - Falls back to `'active'` for verified admins/superadmins (or any verified legacy account) and `'pending'` otherwise, logging a warning so migrations can be backfilled.
2. Updated `/auth/refresh` to select the `status` column and return the resolved value.
3. Ensured login and refresh responses always include the resolved status.
4. Added Jest coverage in `backend/tests/auth.test.ts` for:
   - Refresh flows preserving `status: 'active'`.
   - Legacy rows with `NULL` status still authenticating as active once verified.

### Verification
- `npm run test --prefix backend`
  - Notable new specs: “preserves active status during refresh flows” and “falls back to active status when legacy records have null status”.
- Manual sanity: sign-in → hard refresh → user remains on dashboard.

### Follow-up
- Run the latest shared migrations (008/010) in every environment so status data is persisted server-side and the fallback path remains a safeguard only.
