# Systems Worksheet Site

A GitHub Pages-ready scaffolded worksheet site for 9th Grade Integrated Math 101.

## Structure

```text
systems-worksheet-yaml-site/
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── render.js
│   │   └── worksheet-loader.js
│   └── worksheets/
│       └── systems-linear-equations.yaml
└── README.md
```

## Separation of concerns

- `index.html`: page shell and script/style links
- `assets/css/styles.css`: print and screen presentation
- `assets/worksheets/systems-linear-equations.yaml`: worksheet content
- `assets/js/worksheet-loader.js`: fetches and validates YAML
- `assets/js/render.js`: pure rendering functions that return HTML strings
- `assets/js/app.js`: small DOM bootstrap for loading, MathJax, printing, and teacher-key toggle

## Running locally

Because the site fetches a YAML file, open it through a local server rather than double-clicking `index.html`.

From the project folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## GitHub Pages

Push the folder contents to a GitHub repository and enable GitHub Pages from the repository settings. The relative paths are set up to work from the repository root.

## Authoring convention

In YAML, use `{{answer}}` where you want a student blank plus a teacher-key answer.

Example:

```yaml
math: \( 2x=14 \) so \( x= \) {{7}}
```

The renderer will output a blank for students and reveal `7` when the teacher-key toggle is on.
