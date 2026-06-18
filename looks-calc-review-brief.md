# Looks Calculator — review brief for Codex

**Builder:** Claude · **Status:** Phase-1 prototype, committed for review · **File:** `looks.html` (+ nav slot in `partials/navigation-bar.html`)

## What it is
A new **Looks Calc** page. Phase 1 = a **face** calculator with two variants (Black Pill / PSL and Conventional) that share one measurement engine. Body calc + face×body composite are planned Phases 2–3, not built. Per Jason: must be **drag-and-drop, no sliders**, fully **client-side** (image never leaves the browser), and outputs a **full PSL-style decimal** (the genre's conceit, kept on purpose; honesty lives in the surrounding copy + the Bone Pill cross-link).

## Architecture (three `<script>` blocks in `looks.html`)
1. **Pure core** (DOM-free, has `module.exports` for node testing): `IDX` (MediaPipe landmark indices), `computeMetrics(lm,W,H)` (9 geometric metrics), `computeSoft(pixelStats)` (3 pixel features), `METRICS`/`SOFT` configs, `PROFILES` (weights + curve params), `gradeFace(geo,soft,profKey)`, tier label fns.
2. **UI wiring** (no MediaPipe): source tabs, variant toggle, `renderResult()`, `window.lcAnalyze`.
3. **MediaPipe module** (`@mediapipe/tasks-vision@0.10.14` from jsDelivr, model from storage.googleapis.com): loads `FaceLandmarker` (IMAGE mode), handles upload / camera / URL, draws overlay, calls `samplePixels()` (canvas `getImageData` patches sampled **before** the overlay is drawn), then `window.lcAnalyze(geo, soft)`.

## Scoring pipeline
Each geometric metric → `100*exp(-((v-ideal)/tol)^2)` (gaussian closeness). Pixel features already 0–100. Weighted average per profile → sigmoid contrast (`x^k/(x^k+(1-x)^k)`) → gamma → scale to `1..scaleMax`. Black Pill: bone-heavy weights, harsh contrast (k=1.75), scaleMax 8.6, PSL tiers. Conventional: skin-heavy weights, gentler (k=1.35, gamma 0.9), /10, friendly tiers.

## Known state (validated in node)
Scores **spread** correctly on synthetic good/mid/bad inputs (~8-pt range; flat-6 bug is fixed) and are monotonic + in-range. **But on real photos the direction is off**: Henry Cavill rated too low, some ugly faces not low enough. This is the heuristic's ceiling, not (we think) a pure bug — geometry+pixel proxies miss gestalt/dimorphism/harmony. The constants are reasoned, **never calibrated against real photos**.

## Please focus your review on
1. **Landmark indices** in `IDX` — are these the correct canonical MediaPipe Face Mesh points (eyes 33/133/263/362, cheeks 234/454, jaw 172/397, brow 105/334, forehead 10, chin 152, subnasale 2, lips 0/17, mouth 61/291)? A wrong index silently corrupts a metric.
2. **Pixel sampling** (`samplePixels`/`patchStats`) — patch placement (cheek/forehead/under-eye), luminance + coefficient-of-variation as a texture proxy, sampling before overlay. Sound? Better signals available cheaply?
3. **Calibration suspicion** — is the geometry mis-scoring *masculine-attractive* faces (e.g., jaw `ideal:0.80`/`tol`, FWHR `ideal:1.90`, leanness `ideal:0.46`) so that a Cavill gets penalized for strong-but-attractive features? Which ideals/tols look wrong?
4. **Bugs / crashes / failure modes** — anything that breaks on odd images, no-face, tiny faces, CORS, camera.
5. **Headroom call** — your honest read: can the transparent heuristic be pushed to "real use," or is the trained CNN (SCUT-FBP5500-grade) the only real fix? We lean toward the latter; argue us out of it if you can.

## Out of scope / deliberate
- Soft-tissue features that a front still can't read (hairline, beard, eye-whites, profile: chin/jaw projection, orbital vector) are **disclosed as omitted, not guessed**. Don't "fix" by faking them.
- The single decimal and PSL tiers are intentional (mirror of the methodology), not a bug.
