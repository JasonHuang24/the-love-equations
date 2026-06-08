# The Love Equations

A static website presenting a personal framework for attraction, selection, and compatibility.

## Structure

- `index.html` — home
- `hierarchy.html` — The Love Hierarchy + "Build your own hierarchy" tool
- `smv.html` — The 5 Factors of SMV
- `pills.html` — Pill Dossiers
- `gender-dynamics.html` — Male & Female Dynamics
- `calculator.html` — SMV Calculator
- `compatibility.html` — Compatibility Calculator
- `frameworks.html` — Rules & Frameworks
- `partials/` — shared `navigation-bar.html` and `footer.html`, injected at runtime
- `js/include.js` — fetches the partials and sets the active nav link
- `css/` — styles

## Running locally

The shared header/footer are loaded with `fetch`, which the browser blocks over `file://`.
Serve over HTTP instead:

```bash
python -m http.server 8080
```

Then open http://localhost:8080/
