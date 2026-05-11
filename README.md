# README.md

## Math Worksheet Site

A GitHub Pages-ready worksheet engine for scaffolded math worksheets.

The site loads worksheet content from YAML files and renders printable student and teacher-key versions in the browser.

## What this project does

This project lets you:

- write worksheets as YAML files
- preview them in the browser
- print student versions
- toggle and print teacher-key versions
- host multiple worksheets from one GitHub Pages site
- switch worksheets using a picker or a URL parameter

The worksheet picker and authoring notes appear on screen only. They do not print with the worksheet.

## Project structure

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
│       ├── index.yaml
│       ├── systems-solving-methods.yaml
│       └── systems-number-of-solutions.yaml
└── README.md
````

## Separation of concerns

- `index.html`: page shell and script/style links
- `assets/css/styles.css`: screen, print, worksheet, and picker styling
- `assets/worksheets/index.yaml`: list of available worksheets for the picker
- `assets/worksheets/*.yaml`: individual worksheet content and page layout
- `assets/js/worksheet-loader.js`: loads the worksheet index and selected worksheet YAML
- `assets/js/validate/worksheet-validator.js`: tiny smoke-check for catastrophic YAML/layout mistakes
- `assets/js/render/html.js`: low-level HTML helpers, escaping, blanks, and teacher-key answer spans
- `assets/js/render/components.js`: reusable worksheet components
- `assets/js/render/worksheet.js`: turns YAML pages/sections into rendered worksheet pages
- `assets/js/app.js`: DOM bootstrap for loading, picker behavior, MathJax, printing, and teacher-key toggle

## Running locally

Because the site fetches YAML files, open it through a local server rather than double-clicking `index.html`.

From the project folder:

```bash
python3 -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Worksheet picker

The site loads this file to build the worksheet picker:

```text
assets/worksheets/index.yaml
```

Example:

```yaml
default: "systems-solving-methods"

worksheets:
  - slug: "systems-solving-methods"
    title: "Systems: Solving Methods"
    description: "Elimination and substitution practice with workspace."

  - slug: "systems-number-of-solutions"
    title: "Systems: How Many Solutions?"
    description: "Compare slopes and y-intercepts to decide the number of solutions."
```

Each `slug` should match a YAML filename in `assets/worksheets/`.

For example:

```yaml
slug: "systems-solving-methods"
```

loads:

```text
assets/worksheets/systems-solving-methods.yaml
```

## Loading a worksheet directly

You can link directly to a worksheet with the `sheet` URL parameter:

```text
http://localhost:8000/?sheet=systems-solving-methods
```

On GitHub Pages:

```text
https://yourname.github.io/your-repo/?sheet=systems-solving-methods
```

## GitHub Pages

Push the folder contents to a GitHub repository and enable GitHub Pages from the repository settings.

Internal paths use relative URLs so the site works when served from a project site like:

```text
https://yourname.github.io/repo-name/
```

## Adding a new worksheet

1. Create a new YAML file in:

```text
assets/worksheets/
```

Use a lowercase hyphenated filename:

```text
graphing-systems.yaml
```

1. Add it to:

```text
assets/worksheets/index.yaml
```

Example:

```yaml
worksheets:
  - slug: "graphing-systems"
    title: "Graphing Systems"
    description: "Practice solving systems by graphing."
```

1. Open it with:

```text
?sheet=graphing-systems
```

## Worksheet YAML structure

Each worksheet YAML file has two main parts:

```yaml
title: "Worksheet Title"
subtitle: "Course or Unit Subtitle"

content:
  # worksheet content collections

pages:
  # printable page and section layout
```

The `content` section contains the actual worksheet material.

The `pages` section controls where that material appears.

Example:

```yaml
content:
  goal: "I can solve simple systems using elimination or substitution."

  workspaceProblems:
    - id: 1
      title: "You Try: Add"
      system: ["2x+y=13", "x-y=2"]
      prompt: "The opposites are already lined up. Add straight down."
      solution: "\\((5,3)\\)"

pages:
  - header: true
    sections:
      - type: "goal"

      - type: "workspace-problems"
        title: "Part A — You Try"
        source: "workspaceProblems"
        columns: "2"
        workspaceLines: 6
```

## Supported section types

Current section types:

```text
goal
method-clues
method-recognition
guided-problems
practice-problems
workspace-problems
solution-count
exit-ticket
```

Each section usually has:

```yaml
type: "workspace-problems"
title: "Part A — You Try"
source: "workspaceProblems"
columns: "2"
```

The `source` must point to a collection inside `content`.

## Teacher-key answers

Use `{{answer}}` where you want a student blank plus a teacher-key answer.

Example:

```yaml
math: "\\( 2x=14 \\), so \\( x= \\) {{7}}"
```

Student view shows a blank.

Teacher-key view shows the answer.

## Raw HTML convention

Normal text fields are escaped before rendering.

Use `bodyHtml` only when you intentionally want raw HTML, such as blanks or line breaks in an exit ticket.

Example:

```yaml
exitTicket:
  - title: "3. Solve."
    bodyHtml: >-
      \(\begin{cases}x+y=8\\x-y=2\end{cases}\)<br />Solution:
      <span class="blank blank--md"></span>
```

## Printing

Use the **Print** button in the toolbar rather than the browser menu when possible.

The Print button waits for MathJax to finish rendering before opening the print dialog.

The toolbar, worksheet picker, and authoring notes do not print.

## Teacher key

Use the **Toggle Teacher Key** button to switch between:

- student version
- teacher-key version

Then print whichever version is visible.

## Authoring advice

Keep worksheet files explicit.

Prefer:

```yaml
steps:
  - label: "Step 1"
    prompt: "Add straight down."
    math: "\\( x+x= \\) {{2x}}"
```

over hiding too much inside JavaScript templates.

The goal is to make the worksheet easy to revise as a teacher, even if the YAML is a little verbose.
