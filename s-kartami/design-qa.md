# Design QA — inactive segment

- Source visual truth: `/var/folders/ny/81xswgl57rl2_k49c59fgk0m0000gn/T/TemporaryItems/NSIRD_screencaptureui_fwFdGZ/Screenshot 2026-09-21 at 11.01.54.png`
- Source pixels: 2124 × 886; normalized comparison: 1280 × 534.
- Implementation: `http://127.0.0.1:5174/?cb_client=0`
- Implementation screenshot: `design-qa-inactive.png`, 1280 × 720; comparison crop: 1280 × 534.
- Combined comparison: `design-qa-comparison.png`, reference left and implementation right.
- CSS viewport: 1280 × 720; browser density: standard in-app browser capture.
- State: inactive customer, fallback name, Silver card, default interaction state.

## Full-view comparison evidence

The three-column composition, asymmetric card heights, pale-blue frame, white surfaces,
rounded corners, orange imagery, value pills and CTA now follow the source hierarchy.
All seven cards are visible without clipping or horizontal overflow.

## Focused comparison evidence

The combined comparison was inspected for the greeting/CTA, manager card, card-level
description, numeric pills and right-side promotion crop. Text wrapping is intentional
and the card-level description remains two lines as in the source. Supplied production
assets are used directly; no visible asset was recreated with CSS shapes.

## Comparison history

1. Initial implementation: P2 differences included an illustration behind the greeting,
   missing CTA, equalized row proportions, a clipped one-line card-level description and
   wrapped manager heading.
2. Fixes: removed the greeting background, added the CTA, introduced independent column
   proportions, constrained the card description, adjusted image scales and corrected
   inactive typography.
3. Post-fix evidence: `design-qa-inactive.png` and `design-qa-comparison.png` show the
   corrected structure and readable content at the tested desktop viewport.
4. The card primitives were reconciled with `bez-kart`: desktop padding, radius,
   internal gap, text roles, value pill and desktop asset sizing now share that baseline.
   Only screenshot-specific inactive overrides remain for layout proportions, enlarged
   values, the card-level presentation and CTA.

## Findings

No actionable P0, P1 or P2 differences remain at the tested desktop state.

## Follow-up polish

- P3: final text metrics may vary slightly on the Coral host if its global font differs
  from the local Arial preview fallback.

## Verification

- CTA is rendered as a real link.
- Tooltip remains an accessible native disclosure control.
- Existing mobile horizontal layout is preserved below the desktop breakpoint.

final result: passed
