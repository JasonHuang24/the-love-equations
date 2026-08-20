# Body camera rendered coverage audit

Generated: 2026-08-20T06:31:37.688Z

## Result

**PASS** — 4884/4884 rendered guide cases, 222/222 exact feed/SVG mapping cases, and 9/9 mocked production-page lifecycle cases passed.

This deterministic headless-Chromium audit loaded production `body.html`, `css/styles.css`, `css/body.css`, and `js/body-camera-guide.js`. It uses synthetic colored surfaces and canvas-backed streams; no human image or body rating is involved. Structural/render coverage does **not** prove physical-camera behavior or subjective attractiveness accuracy.

## Literal coverage inventory

- Required viewport classes: **7/7** — mobile portrait, tablet, standard desktop, 1080p, 1440p, 16:10, and 4K.
- Explicit breakpoint widths: **30/30** — 479/480/481, 719/720/721, 879/880/881, 899/900/901, 979/980/981, 1023/1024/1025, 1199/1200/1201, 1479/1480/1481, 1699/1700/1701, and 1759/1760/1761 px.
- Width modes: **2/2** per viewport; feeds: **3/3** (portrait 9:16, 4:3, 16:9); guide codes: **11/11**; auto-snap states: **2/2**.
- Full rendered state matrix: **4884** cases (37 viewports × 2 modes × 3 feeds × 11 states × 2 auto-snap states), exceeding the 1,056-case floor.
- Exact mapping matrix: **222** cases. Representative committed screenshots: **9**.
- Every layout context preserved its before/after localStorage and sessionStorage snapshot.

## Required viewport results

| Class | Width mode | Guide states | Feed mappings | Max overflow px | Min hint/shutter gap px | Result |
|---|---|---:|---:|---:|---:|---:|
| mobile portrait (390×844) | original | 66/66 | 3/3 | 0 | 69.688 | PASS |
| mobile portrait (390×844) | wide | 66/66 | 3/3 | 0 | 69.688 | PASS |
| tablet (820×1180) | original | 66/66 | 3/3 | 0 | 293.094 | PASS |
| tablet (820×1180) | wide | 66/66 | 3/3 | 0 | 293.094 | PASS |
| standard desktop (1366×768) | original | 66/66 | 3/3 | 0 | 53.547 | PASS |
| standard desktop (1366×768) | wide | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 1080p (1920×1080) | original | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 1080p (1920×1080) | wide | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 1440p (2560×1440) | original | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 1440p (2560×1440) | wide | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 16:10 desktop (1920×1200) | original | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 16:10 desktop (1920×1200) | wide | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 4K (3840×2160) | original | 66/66 | 3/3 | 0 | 53.547 | PASS |
| 4K (3840×2160) | wide | 66/66 | 3/3 | 0 | 53.547 | PASS |

## Guide-state coverage

| Stable actionable code | Passed |
|---|---:|
| no_body | 444/444 |
| move_closer | 444/444 |
| move_back | 444/444 |
| center_body | 444/444 |
| align_feet | 444/444 |
| stand_upright | 444/444 |
| face_camera_square_on | 444/444 |
| straighten_legs | 444/444 |
| level_shoulders_hips | 444/444 |
| arms_out | 444/444 |
| ready | 444/444 |

Each state checks exact production code/hint, feed/stage/guide agreement, horizontal overflow, clipping, hint/shutter separation, 60-character line measure, 12px+ type, 4.5:1 hint contrast, 3:1 guide contrast, mirroring, reduced motion, manual-shutter target, width cap, source/URL/video/canvas/status semantics, and auto-snap on/off invariance.

## Exact xMidYMid meet mapping

| Feed | Frame | Passed | Worst SVG error px |
|---|---:|---:|---:|
| portrait-9x16 | 1080×1920 | 74/74 | 0.0001 |
| 4x3 | 1440×1080 | 74/74 | 0.0001 |
| 16x9 | 1920×1080 | 74/74 | 0 |

Every mapping case binds the production SVG circle/torso/foot line to `preserveAspectRatio="xMidYMid meet"`, checks inverse round trips, and verifies that a raw +7-unit shift displays as −7 only in the mirrored preview while raw provenance remains +7.

## Mocked lifecycle coverage

| Case | Result | Failed checks |
|---|---:|---|
| matrix page runtime and storage invariance | PASS | — |
| late permission canceled by source switch | PASS | — |
| late play completion canceled by source switch | PASS | — |
| hardware ended cleanup | PASS | — |
| hardware inactive cleanup | PASS | — |
| reset cleanup | PASS | — |
| pagehide cleanup | PASS | — |
| auto-snap off keeps stable live guidance | PASS | — |
| manual shutter available with auto-snap off | PASS | — |

## Representative screenshots

Screenshots contain only the synthetic two-color feed and production camera UI.

| Viewport | Mode | Feed | State | Auto-snap | File | SHA-256 |
|---|---|---|---|---:|---|---|
| mobile-portrait-390x844 | original | portrait-9x16 | ready | off | [mobile-portrait-390x844--original--portrait-9x16--ready--auto-off.png](body-camera-coverage-screenshots/mobile-portrait-390x844--original--portrait-9x16--ready--auto-off.png) | `cffe7e2c3e86…` |
| tablet-820x1180 | wide | 4x3 | arms_out | on | [tablet-820x1180--wide--4x3--arms_out--auto-on.png](body-camera-coverage-screenshots/tablet-820x1180--wide--4x3--arms_out--auto-on.png) | `1cabb1d23550…` |
| desktop-1366x768 | original | 16x9 | center_body | on | [desktop-1366x768--original--16x9--center_body--auto-on.png](body-camera-coverage-screenshots/desktop-1366x768--original--16x9--center_body--auto-on.png) | `6949ccd3cebf…` |
| desktop-1920x1080 | wide | 4x3 | ready | off | [desktop-1920x1080--wide--4x3--ready--auto-off.png](body-camera-coverage-screenshots/desktop-1920x1080--wide--4x3--ready--auto-off.png) | `3fc7f5d8706c…` |
| desktop-2560x1440 | wide | portrait-9x16 | move_back | on | [desktop-2560x1440--wide--portrait-9x16--move_back--auto-on.png](body-camera-coverage-screenshots/desktop-2560x1440--wide--portrait-9x16--move_back--auto-on.png) | `6aec9a5b62a5…` |
| desktop-1920x1200 | original | 16x9 | level_shoulders_hips | off | [desktop-1920x1200--original--16x9--level_shoulders_hips--auto-off.png](body-camera-coverage-screenshots/desktop-1920x1200--original--16x9--level_shoulders_hips--auto-off.png) | `d9d6e95d7daa…` |
| desktop-3840x2160 | wide | 4x3 | no_body | on | [desktop-3840x2160--wide--4x3--no_body--auto-on.png](body-camera-coverage-screenshots/desktop-3840x2160--wide--4x3--no_body--auto-on.png) | `07d0ec940441…` |
| boundary-980x1000 | wide | 4x3 | ready | on | [boundary-980x1000--wide--4x3--ready--auto-on.png](body-camera-coverage-screenshots/boundary-980x1000--wide--4x3--ready--auto-on.png) | `6e42a2ab48ac…` |
| boundary-1024x1000 | original | 16x9 | align_feet | off | [boundary-1024x1000--original--16x9--align_feet--auto-off.png](body-camera-coverage-screenshots/boundary-1024x1000--original--16x9--align_feet--auto-off.png) | `0efd9a23c207…` |

## What synthetic coverage cannot prove

This audit does **not** prove physical sensor orientation or rotation metadata, autofocus, exposure, native permission/browser prompts, browser chrome and safe-area behavior, or real-device motion between alignment and capture. It also does not prove model accuracy, calibration, ranking, AUC, or human attractiveness discrimination.

### Real-device checklist

- iOS Safari and Android Chrome: allow, deny, dismiss, retry, and revoke camera permission.
- Front camera in portrait and landscape: confirm preview mirroring, captured-pixel orientation, and guide/feed agreement after rotation.
- Test 4:3, 16:9, and tall native feeds where the device exposes them; inspect browser chrome and safe-area insets.
- Bright, dim, and backlit rooms: verify autofocus/exposure settles before manual and automatic capture.
- Walk into/out of frame, move arms, rotate, and lean: verify hints remain stable, auto-snap does not fire after retirement, and manual shutter always remains available.
- Interrupt with tab switch, app backgrounding, track revocation, reset, upload/paste/URL replacement, and camera restart; confirm tracks stop and no old result returns.
- Confirm no photo or capture payload appears in storage before a validated analysis commit.

## Failures

- None.

Machine-readable detail: `data/body-camera-coverage.json`. Production bindings and screenshot hashes are recorded there. Reproducibility hash: `2fea987eb1bea213112b5d8bbaa638498bd2eacd417e56fe75fedfe2bdf21ed8`.
