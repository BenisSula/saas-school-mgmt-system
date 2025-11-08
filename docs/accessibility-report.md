# Accessibility Audit – SaaS School Management Portal

Date: 2025-11-08  
Auditor: Automated + manual review (Phase 5)

## Summary

| Area                      | Status | Notes |
|---------------------------|:------:|-------|
| Axe automated checks      | ✅     | `pnpm --filter frontend run test:accessibility` |
| Keyboard navigation       | ✅     | All focusable elements reachable; skip/close buttons return focus appropriately |
| Color contrast            | ✅     | Verified against WCAG AA using Chrome DevTools (primary/secondary backgrounds) |
| Landmark structure        | ✅     | Header/nav/main/footer present; sidebar given `aria-label` |
| Live regions & alerts     | ✅     | `StatusBanner` uses `role="status"` / `aria-live="polite"` |
| Modal/dialog semantics    | ✅     | Modal retains focus trap and escape handling |

## Automated Testing

```bash
cd frontend
pnpm install      # one-time to pick up vitest-axe/axe-core
pnpm test:accessibility
```

The suite renders the home page and runs `axe-core`; zero violations are reported.

## Manual Checklist

- **Keyboard only:**  
  - Navbar/menu toggle reachable with <kbd>Tab</kbd>; `aria-expanded` reflects state.  
  - Sidebar collapse/expand buttons respond to <kbd>Space</kbd>/<kbd>Enter</kbd>.  
  - Modal and dropdowns trap focus and close on <kbd>Esc</kbd>.  
- **Pointer + Screen magnifier:** Buttons sized ≥44px, hover/focus states visible.  
- **Screen reader sanity:** NVDA + Chrome confirmed section titles, banner messages announced.  
- **Forms:** All inputs have `<label>` or `aria-label`; inline errors use the same `StatusBanner` for announcement.  
- **Tables:** Column headers expose `scope="col"`; captions describe dataset context.

## Outstanding Items

- None blocking release. Continue to monitor newly introduced components with `axe` during development.


