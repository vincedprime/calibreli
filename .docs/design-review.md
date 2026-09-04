# Design and motion review

Implemented September 4, 2026. React 18, Vite, Tailwind, Radix; no additional motion library. This occasional-use planning tool benefits from calm typography and quick feedback. Existing uncommitted work was preserved.

| Before | After | Why |
| --- | --- | --- |
| Bright gradient, centered branding, mismatched card widths | Muted ivory/green palette, compact header, left-aligned introduction, consistent 672px content width | Clear hierarchy and less visual competition |
| Repetitive welcome cards and three simultaneous preference explanations | One useful planning hint and description of the selected preference | Reduce reading burden |
| Artificial 1,000ms wait | Immediate computation | Respect the user's time |
| Popup keyframe zooms without reduced-motion handling | Interruptible 180ms opacity transition; keyboard instant, reduced motion 120ms | Predictable, restrained feedback |
| No press feedback | Pointer-only scale(0.97), 160ms cubic-bezier(0.23, 1, 0.32, 1) | Acknowledge input without delaying actions |
| Noninteractive result cards gain shadow on hover | Static result cards | Avoid implying clickability |
| Tiny duplicated weekday labels | 44px-high controls, short visual labels, full accessible names and pressed state | Improve mobile fit and selection clarity |

## Vetted motion findings

| # | Severity | Category | Location | Finding | Fix summary |
| --- | --- | --- | --- | --- | --- |
| 1 | MEDIUM | Accessibility | src/components/ui/popover.jsx, select.jsx, hover-card.jsx | Default zoom/slide animations did not account for reduced motion or keyboard use | Shared opacity-only transitions and input-modality handling in src/index.css |
| 2 | LOW | Purpose | src/components/ScheduleView.jsx | Hover elevation implied interaction on read-only content | Removed hover elevation |
| 3 | LOW | Cohesion | src/components/ui/button.jsx and button.tsx | Buttons lacked shared press behavior | Shared pointer-only press feedback token |

## Opportunities and gate decisions

| # | Location | Today | Purpose | Frequency | Suggested motion |
| --- | --- | --- | --- | --- | --- |
| 1 | src/components/ui/button.jsx, button.tsx | Implemented | Feedback | Tens per session | transform scale(0.97), 160ms cubic-bezier(0.23, 1, 0.32, 1); pointer only; no transform under reduced motion |
| 2 | src/components/ui/popover.jsx, select.jsx, hover-card.jsx | Implemented replacement for existing keyframes | Preventing a jarring change | Occasional | opacity 0 → 1, 180ms cubic-bezier(0.23, 1, 0.32, 1); 120ms ease under reduced motion; instant keyboard interaction |

Both pass the speed and function gates: feedback remains short, and readable data does not move. Popup removal stays immediate; no delayed unmount machinery was introduced.

Rejected candidates:
- Calendar month/day navigation: frequency gate; repeated navigation needs immediate feedback, no slides or stagger.
- Results and summary numbers: function gate; users need stable dates and numbers, no count-up or card entrances.
- Work-week selection: frequency gate; immediate selected styling is sufficient.

Verdict: this interface needs very little motion. Shared press feedback has the highest leverage. The accepted work is already implemented, so no executor handoff is required.

## Verification and limits

- Production build passes.
- Browser checked initial light theme and dark form layout.
- Date selection and Escape dismissal verified.
- Submitted a September 4–30, 2026 range with 10 PTO days and confirmed results render.
- Responsive classes improve narrow layouts; physical-device and reduced-motion emulation checks were not performed.
- Existing optimizer behavior can return overlapping date ranges (observed September 4–7 and September 7–8), overstating aggregated totals. Algorithm changes were outside this design pass.
