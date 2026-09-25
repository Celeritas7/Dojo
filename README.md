# Dojo app

Self-contained: serve this folder and open index.html.

    cd app && python3 -m http.server 8000   # then http://localhost:8000/

```
app/
├── index.html
├── css/
│   ├── styles.css            tokens + Google Fonts import
│   └── base.css              page reset, focus ring, reduced motion
└── js/
    ├── App.jsx               state + wiring (entry)
    ├── data.js               plan, stages, mottos, demo log
    ├── lib/
    │   └── dojo-components.js  compiled component library (snapshot of _ds_bundle.js)
    └── screens/
        ├── Header.jsx
        ├── Checkin.jsx
        ├── Sheet.jsx
        ├── Programs.jsx
        └── DayEditor.jsx
```
