# Face camera rendered coverage audit

Generated: 2026-08-18T12:21:46.356Z

## Result

**PASS** — 14/14 viewport/mode cases, 42/42 feed-mapping cases, 112/112 rendered alignment-state cases, and 7/7 mocked lifecycle/restore cases passed.

This is a deterministic, headless Chromium rendering audit. It loaded the production `face.html`, `css/styles.css`, `css/face.css`, and `js/face-camera-guide.js`. Layout cases use a synthetic CSS surface. Lifecycle cases replace native `getUserMedia` with a controlled promise returning a canvas-backed synthetic `MediaStream`; **no camera hardware, browser permission prompt, physical device sensor, real face, capture frame, model inference, or image persistence was exercised**. Camera-hardware/device validation therefore remains a manual requirement. Screenshots contain only the synthetic surface and production guide UI.

## Literal coverage inventory

- Viewports: **7/7 requested classes** — mobile portrait, tablet, 1366×768, 1920×1080, 2560×1440, desktop 16:10, and 4K.
- Width modes: **2/2 for every viewport** — original and wide, including the intentional ≤980px media-query collapse to the same 100% container.
- Feed shapes: **3/3 for every viewport/mode** — portrait, 4:3, and 16:9.
- Alignment states: **8/8 for every viewport/mode** — no face, closer, back, center, eyes, level, square-on, and ready.
- Lifecycle/restore states: **7/7 exercised** — pending tab cancellation, track-ended cleanup, pagehide cleanup, stable live-region/reduced-motion behavior, pending-source retirement, and malformed restore rejection.
- Total asserted matrix: **14 viewport/mode**, **42 mapping**, **112 rendered state**, and **7 lifecycle/restore** cases.
- Representative screenshots: **23**, listed in the JSON artifact.

## Viewport and width-mode coverage

| Viewport | Mode | Result | Content width px | 4:3 stage px | Horizontal overflow px | Hint/shutter gap px | Max SVG mapping error px |
|---|---:|---:|---:|---:|---:|---:|---:|
| mobile-portrait-390x844 | original | PASS | 390 | 320.813×240.609 | 0 | 152.125 | 0 |
| mobile-portrait-390x844 | wide | PASS | 390 | 320.813×240.609 | 0 | 152.125 | 0 |
| tablet-820x1180 | original | PASS | 820 | 709.219×531.906 | 0 | 443.422 | 0 |
| tablet-820x1180 | wide | PASS | 820 | 709.219×531.906 | 0 | 443.422 | 0 |
| desktop-1366x768 | original | PASS | 1120 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-1366x768 | wide | PASS | 819.594 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-1920x1080 | original | PASS | 1120 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-1920x1080 | wide | PASS | 1152 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-2560x1440 | original | PASS | 1120 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-2560x1440 | wide | PASS | 1536 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-1920x1200 | original | PASS | 1120 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-1920x1200 | wide | PASS | 1152 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-3840x2160 | original | PASS | 1120 | 313.219×234.906 | 0 | 146.422 | 0 |
| desktop-3840x2160 | wide | PASS | 2304 | 313.219×234.906 | 0 | 146.422 | 0 |

For mobile and tablet (≤980px), both saved mode values are honored in `data-content-width`, while the production media query deliberately resolves both to a 100% container. Desktop original/wide cases measure their distinct container widths.

## Exact viewBox-to-feed mappings

The guide SVG uses `viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"`. The table records the exact nominal transform and compares the browser-rendered ellipse/eye bar to it.

| Feed | Scale | Offset X px | Offset Y px | Passed | Worst SVG error px | Min hint-eye px | Min shutter-oval px |
|---|---:|---:|---:|---:|---:|---:|---:|
| portrait (1080×1920) | 10.8 | 0 | 420 | 14/14 | 0 | 215.4 | 181.85 |
| 4x3 (1440×1080) | 10.8 | 180 | 0 | 14/14 | 0 | 62.28 | 78.72 |
| 16x9 (1920×1080) | 10.8 | 420 | 0 | 14/14 | 0 | 38.78 | 76.95 |
Occlusion gates require at least 4px between the actionable hint and eye bar, and at least 4px between the circular shutter and oval.

Each mapping case also verifies that an unmirrored raw-face displacement of +6 guide units appears at −6 in the mirrored preview while structured raw offset remains +6. The production video CSS must compute to `scaleX(-1)`; generic “Center your face” copy contains no left/right instruction to reverse.

## Rendered alignment states

| Code | Production hint | Passed viewport/mode cases |
|---|---|---:|
| no_face | No face — look at the camera. | 14/14 |
| move_closer | Move closer. | 14/14 |
| move_back | Move back. | 14/14 |
| center_face | Center your face. | 14/14 |
| align_eyes | Align your eyes with the bar. | 14/14 |
| level_head | Level your head. | 14/14 |
| face_camera_square_on | Face the camera square-on. | 14/14 |
| ready | Ready — hold still… | 14/14 |

Every state checks exact classifier output and hint, guide/video/stage bounds, clipping, wrapping, type size and line height, conservative text contrast, hint/shutter separation, 44px shutter target, status semantics, and ready-only green styling.

## Mocked lifecycle and restore coverage

| Case | Result | Failed checks |
|---|---:|---|
| pending permission canceled by source switch | PASS | — |
| stable no-face hint and reduced motion | PASS | — |
| hardware track ended cleanup | PASS | — |
| pagehide cleanup | PASS | — |
| accepted source retires prior result | PASS | — |
| malformed restore rejected | PASS | — |
| lifecycle page runtime | PASS | — |

The live-region probe observes the production hint node across repeated 350ms no-face passes and requires zero duplicate text mutations. Computed guide, eye-bar, and hint transition durations must all be zero under `prefers-reduced-motion: reduce`. Acquisition candidates are native canvas-backed `MediaStream` objects, but the permission API itself is fully mocked and no frame is captured or exported.

## Privacy and limitations

- The harness never called native `getUserMedia`, `captureFrame`, canvas export, scoring, or local photo-save paths. A mocked `getUserMedia` function exercised ownership/cancellation using synthetic canvas-backed streams.
- No image payload persisted. A deliberately malformed data-URL sentinel was written only for the restore-rejection case and production code removed it during page load; layout-case before/after storage snapshots remain in the JSON.
- External CDN dependencies were replaced with inert local route responses so layout results do not depend on the network. This audit therefore does not validate CDN/model availability.
- Synthetic rendered coverage cannot prove physical front-camera orientation, OS/browser permission behavior, sensor rotation metadata, autofocus/exposure, or motion behavior. Those require a real-device manual pass.

## Failures

- None.

Machine-readable detail: `data/face-camera-coverage.json`. Representative screenshots: `artifacts/face-camera-coverage/`.
