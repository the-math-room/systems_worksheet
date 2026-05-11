/**
 * Pure-ish rendering functions.
 *
 * Most functions in this file accept plain data and return HTML strings.
 * They do not mutate worksheet data and do not touch the DOM.
 */

const cx = (...classes) => classes.filter(Boolean).join(" ");

const mathSystem = ([eq1, eq2]) =>
  `\\(\\begin{cases}${eq1}\\\\${eq2}\\end{cases}\\)`;

const blank = (size = "md") =>
  `<span class="student-blank blank blank--${size}"></span>`;

const answer = (value) =>
  `${blank(answerSize(value))}<span class="key-answer">${value}</span>`;

const answerSize = (value) => {
  const plain = String(value).replace(/<[^>]+>/g, "").replace(/\\\(.+?\\\)/g, "math");
  if (plain.length <= 3) return "sm";
  if (plain.length <= 18) return "md";
  return "lg";
};

const withAnswers = (template) =>
  String(template).replace(/\{\{(.*?)\}\}/g, (_, value) => answer(value.trim()));

const box = (kind, content) =>
  `<div class="box box--${kind}">${content}</div>`;

const sectionTitle = (title) =>
  `<div class="section-title">${title}</div>`;

const card = (content, { compact = false } = {}) =>
  `<section class="${cx("card", compact && "card--compact")}">${content}</section>`;

const page = (content) =>
  `<main class="page">${content}</main>`;

const grid = (columns, content) =>
  `<div class="grid-${columns}">${content}</div>`;

function renderToolbar() {
  return `
    <button data-action="print">Print</button>
    <button data-action="toggle-key">Toggle Teacher Key</button>
    <span class="hint">Student version prints by default. Toggle key before printing teacher copy.</span>
  `;
}

function renderHeader({ title, subtitle }) {
  return `
    <header class="worksheet-header">
      <div>
        <h1 class="worksheet-title">${title}</h1>
        <div class="worksheet-subtitle">${subtitle}</div>
      </div>
      <div class="name-lines">
        <div>Name: <span class="line line--medium"></span></div>
        <div>Date: <span class="line line--medium"></span></div>
      </div>
    </header>
  `;
}

function renderMethodClues(clues) {
  return box("directions", `
    <strong>Look for the clue. Do not solve yet.</strong>
    <div class="method-options">
      ${clues.map(({ clue, method }) => `<div class="option">${clue} → <strong>${method}</strong></div>`).join("")}
    </div>
  `);
}

function renderMethodCard({ id, system, notice, method }) {
  return card(`
    <div class="problem-title">${id}.</div>
    <div class="system">${mathSystem(system)}</div>
    What do you notice? ${answer(notice)}<br />
    Best method: ${answer(method)}
  `, { compact: true });
}

function renderStep({ label, prompt, math }) {
  return `
    <div class="step">
      <strong>${label}:</strong> ${prompt}
      <div class="math-line">${withAnswers(math)}</div>
    </div>
  `;
}

function renderGuidedProblem({ id, title, system, hint, steps, solution }) {
  return card(`
    <div class="problem-title">${id}. ${title}</div>
    <div class="system">${mathSystem(system)}</div>
    ${box("hint", hint)}
    <div class="steps">
      ${steps.map(renderStep).join("")}
      <div class="step"><strong>Solution:</strong> ${answer(solution)}</div>
    </div>
  `);
}

function renderPracticeProblem({ id, title, system, prompts, solution }) {
  return card(`
    <div class="problem-title">${id}. ${title}</div>
    <div class="system">${mathSystem(system)}</div>
    ${prompts.map((prompt) => `${withAnswers(prompt)}<br />`).join("")}
    Solution: ${answer(solution)}
  `, { compact: true });
}

function renderSolutionRules(rules) {
  return `
    <table class="solution-table">
      <tr><th>Slopes</th><th>Y-intercepts</th><th>Answer</th></tr>
      ${rules.map(([slopes, intercepts, result]) => `
        <tr><td>${slopes}</td><td>${intercepts}</td><td>${result}</td></tr>
      `).join("")}
    </table>
  `;
}

function renderSolutionCountCard({ id, equations, work, result }) {
  return card(`
    <div class="problem-title">${id}.</div>
    ${equations.map((eq) => `\\(${eq}\\)`).join("<br />")}<br />
    Work: ${answer(work)}<br />
    Number of solutions: ${answer(result)}
  `, { compact: true });
}

function renderExitTicketCard({ title, body }) {
  return card(`
    <strong>${title}</strong><br />
    ${body}
  `, { compact: true });
}

function renderPageOne(data) {
  return page(`
    ${renderHeader(data)}
    ${box("goal", `<strong>Goal:</strong> ${data.goal}`)}

    ${sectionTitle("Part A — Choose the Method")}
    ${renderMethodClues(data.methodClues)}
    ${grid("4-to-2", data.methodRecognition.map(renderMethodCard).join(""))}

    ${sectionTitle("Part B — Solve with Elimination")}
    ${grid("2", data.eliminationGuided.map(renderGuidedProblem).join(""))}
    <div class="mt-sm">${grid("2", data.eliminationPractice.map(renderPracticeProblem).join(""))}</div>
  `);
}

function renderPageTwo(data) {
  return page(`
    ${sectionTitle("Part C — Solve with Substitution")}
    ${grid("2", data.substitutionGuided.map(renderGuidedProblem).join(""))}
    <div class="mt-sm">${grid("2", data.substitutionPractice.map(renderPracticeProblem).join(""))}</div>

    ${sectionTitle("Part D — How Many Solutions?")}
    ${box("directions", `
      Put both equations in \\(y=mx+b\\) form. Then compare slopes and y-intercepts.
      ${renderSolutionRules(data.solutionRules)}
    `)}
    ${grid("2", data.solutionCount.map(renderSolutionCountCard).join(""))}

    ${sectionTitle("Exit Ticket")}
    ${grid("3", data.exitTicket.map(renderExitTicketCard).join(""))}
  `);
}

function renderWorksheet(data) {
  return renderPageOne(data) + renderPageTwo(data);
}
