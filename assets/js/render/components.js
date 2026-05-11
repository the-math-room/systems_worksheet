/**
 * Reusable worksheet components.
 *
 * Components accept worksheet data and return HTML strings.
 * They should not touch the DOM.
 */

import {
  answer,
  box,
  card,
  escapeHtml,
  grid,
  mathInline,
  mathSystem,
  withAnswers,
} from "./html.js";

export function renderToolbar() {
  return `
    <button data-action="print">Print</button>
    <button data-action="toggle-key">Toggle Teacher Key</button>
    <span class="hint">Student version prints by default. Toggle key before printing teacher copy.</span>
  `;
}

export function renderHeader({ title, subtitle }) {
  return `
    <header class="worksheet-header">
      <div>
        <h1 class="worksheet-title">${escapeHtml(title)}</h1>
        <div class="worksheet-subtitle">${escapeHtml(subtitle)}</div>
      </div>
      <div class="name-lines">
        <div>Name: <span class="line line--medium"></span></div>
        <div>Date: <span class="line line--medium"></span></div>
      </div>
    </header>
  `;
}

export function renderMethodClues(clues) {
  return box("directions", `
    <strong>Look for the clue.</strong>
    <div class="method-options">
      ${clues.map(({ clue, method }) => `
        <div class="option">${withAnswers(clue)} → <strong>${withAnswers(method)}</strong></div>
      `).join("")}
    </div>
  `);
}

export function renderMethodCard({ id, system, notice, method }) {
  return card(`
    <div class="problem-title">${escapeHtml(id)}.</div>
    <div class="system">${mathSystem(system)}</div>
    What do you notice? ${answer(notice)}<br />
    Best method: ${answer(method)}
  `, { compact: true });
}

export function renderGuidedProblem({ id, title, system, hint, steps, solution }) {
  return card(`
    <div class="problem-title">${escapeHtml(id)}. ${withAnswers(title)}</div>
    <div class="system">${mathSystem(system)}</div>
    ${box("hint", withAnswers(hint))}
    <div class="steps">
      ${steps.map(renderStep).join("")}
      <div class="step"><strong>Solution:</strong> ${answer(solution)}</div>
    </div>
  `);
}

export function renderPracticeProblem({ id, title, system, prompts, solution }) {
  return card(`
    <div class="problem-title">${escapeHtml(id)}. ${withAnswers(title)}</div>
    <div class="system">${mathSystem(system)}</div>
    ${prompts.map((prompt) => `${withAnswers(prompt)}<br />`).join("")}
    Solution: ${answer(solution)}
  `, { compact: true });
}

export function renderWorkspaceProblem(problem, options = {}) {
  const { id, title, system, prompt, solution } = problem;
  const workspaceLines = options.workspaceLines ?? 4;

  return card(`
    <div class="problem-title">${escapeHtml(id)}. ${withAnswers(title)}</div>
    <div class="system">${mathSystem(system)}</div>
    ${prompt ? `<div>${withAnswers(prompt)}</div>` : ""}
    ${renderWorkspaceLines(workspaceLines)}
    <strong>Solution:</strong> ${answer(solution)}
  `);
}

export function renderSolutionRules(rules) {
  return `
    <table class="solution-table">
      <tr><th>Slopes</th><th>Y-intercepts</th><th>Answer</th></tr>
      ${rules.map(([slopes, intercepts, result]) => `
        <tr>
          <td>${escapeHtml(slopes)}</td>
          <td>${escapeHtml(intercepts)}</td>
          <td>${escapeHtml(result)}</td>
        </tr>
      `).join("")}
    </table>
  `;
}

export function renderSolutionCountCard(problem, options = {}) {
  const { id, equations, work, result } = problem;
  const workspaceLines = options.workspaceLines ?? 0;

  return card(`
    <div class="problem-title">${escapeHtml(id)}.</div>
    ${equations.map(mathInline).join("<br />")}<br />
    ${workspaceLines > 0 ? renderWorkspaceLines(workspaceLines, "Work / rewrite:") : ""}
    Work: ${answer(work)}<br />
    Number of solutions: ${answer(result)}
  `, { compact: workspaceLines === 0 });
}

export function renderExitTicketCard({ title, body, bodyHtml }) {
  const renderedBody = bodyHtml === undefined ? withAnswers(body) : bodyHtml;

  return card(`
    <strong>${escapeHtml(title)}</strong><br />
    ${renderedBody}
  `, { compact: true });
}

function renderStep({ label, prompt, math }) {
  return `
    <div class="step">
      <strong>${escapeHtml(label)}:</strong> ${withAnswers(prompt)}
      <div class="math-line">${withAnswers(math)}</div>
    </div>
  `;
}

function renderWorkspaceLines(count, label = "Work space:") {
  const lines = Array.from({ length: count }, () => `<div class="workspace-line"></div>`).join("");

  return `
    <div class="workspace-label">${escapeHtml(label)}</div>
    <div class="workspace-lines">${lines}</div>
  `;
}