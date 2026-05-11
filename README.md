# Math Worksheet Site

A GitHub Pages-ready scaffolded worksheet engine for 9th Grade Integrated Math 101.

The site loads worksheet content from YAML files and renders printable student and teacher-key versions in the browser.

## Structure

```text
.
├── index.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   ├── app.js
│   │   ├── worksheet-loader.js
│   │   ├── render/
│   │   │   ├── components.js
│   │   │   ├── html.js
│   │   │   └── worksheet.js
│   │   └── validate/
│   │       └── worksheet-validator.js
│   └── worksheets/
│       └── systems-linear-equations.yaml
└── README.md