# README.md

## Math Worksheet Site

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
````

## Separation of concerns

* `index.html`: page shell and script/style links
* `assets/css/styles.css`: print and screen presentation
* `assets/worksheets/*.yaml`: worksheet content and page/section layout
* `assets/js/worksheet-loader.js`: chooses which YAML file to load, fetches it, parses it, and runs a light smoke-check
* `assets/js/validate/worksheet-validator.js`: tiny authoring guardrail for catastrophic YAML/layout mistakes
* `assets/js/render/html.js`: low-level HTML helpers, escaping, blanks, and teacher-key answer spans
* `assets/js/render/components.js`: reusable worksheet components
* `assets/js/render/worksheet.js`: turns YAML pages/sections into rendered worksheet pages
* `assets/js/app.js`: DOM bootstrap for loading, MathJax, printing, and teacher-key toggle

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

## Loading different worksheets

By default, the site loads:

```text
assets/worksheets/systems-linear-equations.yaml
```

You can load another worksheet with the `sheet` URL parameter:

```text
http://localhost:8000/?sheet=systems-linear-equations
```

For GitHub Pages:

```text
https://yourname.github.io/your-repo/?sheet=systems-linear-equations
```

The slug must match a YAML filename in `assets/worksheets/`.

For example:

```text
?sheet=elimination-basics
```

loads:

```text
assets/worksheets/elimination-basics.yaml
```

## GitHub Pages

Push the folder contents to a GitHub repository and enable GitHub Pages from the repository settings.

Internal paths use relative URLs so the site works when served from:

```text
https://yourname.github.io/repo-name/
```

## YAML authoring convention

Use `{{answer}}` where you want a student blank plus a teacher-key answer.

Example:

```yaml
math: "\\( 2x=14 \\) so \\( x= \\) {{7}}"
```

The renderer outputs a blank for students and reveals `7` when the teacher-key toggle is on.

## Content and layout convention

Each worksheet YAML file should have two main parts:

```yaml
content:
  # worksheet content collections

pages:
  # printable page and section layout
```

Example:

```yaml
pages:
  - header: true
    sections:
      - type: "goal"

      - type: "guided-problems"
        title: "Part A — Practice"
        source: "practiceProblems"
        columns: "2"
```

The YAML decides the page order and section order. JavaScript only renders known section types.

## Raw HTML convention

Normal text fields are escaped before rendering.

Use `bodyHtml` only when you intentionally want raw HTML, such as blanks or line breaks in an exit ticket:

```yaml
exitTicket:
  - title: "3. Solve."
    bodyHtml: >-
      \(\begin{cases}x+y=8\\x-y=2\end{cases}\)<br />Solution:
      <span class="blank blank--md"></span>
```
