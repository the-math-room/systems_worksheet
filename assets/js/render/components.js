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
    <a class="toolbar__link" href="../">Projects</a>
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
    <span class="no-break">What do you notice? ${answer(notice)}</span><br />
    <span class="no-break">Best method: ${answer(method)}</span>
  `, { compact: true });
}

export function renderGuidedProblem({ id, title, system, hint, steps, solution }) {
  return card(`
    <div class="problem-title">${escapeHtml(id)}. ${withAnswers(title)}</div>
    <div class="system">${mathSystem(system)}</div>
    ${box("hint", withAnswers(hint))}
    <div class="steps">
      ${steps.map(renderStep).join("")}
      <div class="step no-break"><strong>Solution:</strong> ${answer(solution)}</div>
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
    ${renderWorkspaceLines(workspaceLines, "Work space:", options.workspaceStyle)}
    <span class="no-break"><strong>Solution:</strong> ${answer(solution)}</span>
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
    ${workspaceLines > 0 ? renderWorkspaceLines(workspaceLines, "Work / rewrite:", options.workspaceStyle) : ""}
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

export function renderLineComparisonProblem(problem, options = {}) {
  const {
    id,
    title,
    equations,
    rewritePrompt,
    slope1,
    slope2,
    intercept1,
    intercept2,
    slopeCompare,
    interceptCompare,
    result,
  } = problem;

  const workspaceLines = options.workspaceLines ?? 0;
  const workspaceStyle = options.workspaceStyle ?? "blank";

  return card(`
    <div class="problem-title">${escapeHtml(id)}. ${withAnswers(title ?? "")}</div>

    <div class="system">
      ${equations.map(mathInline).join("<br />")}
    </div>

    ${rewritePrompt ? `<div>${withAnswers(rewritePrompt)}</div>` : ""}

    ${
      workspaceLines > 0
        ? renderWorkspaceLines(workspaceLines, "Rewrite / work space:", workspaceStyle)
        : ""
    }

    <table class="comparison-table">
      <tr>
        <th></th>
        <th>Slope</th>
        <th>Y-intercept</th>
      </tr>
      <tr>
        <td>Line 1</td>
        <td>${answer(slope1)}</td>
        <td>${answer(intercept1)}</td>
      </tr>
      <tr>
        <td>Line 2</td>
        <td>${answer(slope2)}</td>
        <td>${answer(intercept2)}</td>
      </tr>
    </table>

    Slopes are: ${answer(slopeCompare)}<br />
    Y-intercepts are: ${answer(interceptCompare)}<br />

    ${renderNumberOfSolutionsAnswer(result, options.answerStyle)}
  `);
}

export function renderSolutionMeaning() {
  return box("directions", `
    <strong>A solution to a system is where the two lines meet.</strong>

    <div class="solution-meaning-grid">
      ${renderSolutionMeaningCard({
        title: "One solution",
        caption: "The lines cross once.",
        svg: renderIntersectingLinesSvg(),
      })}

      ${renderSolutionMeaningCard({
        title: "No solution",
        caption: "Parallel lines never cross.",
        svg: renderParallelLinesSvg(),
      })}

      ${renderSolutionMeaningCard({
        title: "Infinite solutions",
        caption: "Same line: every point matches.",
        svg: renderSameLineSvg(),
      })}
    </div>

    <div class="solution-meaning-note">
      The slope and y-intercept help us tell which picture we have.
    </div>
  `);
}

function renderSolutionMeaningCard({ title, caption, svg }) {
  return `
    <div class="solution-meaning-card">
      <div class="solution-meaning-card__title">${escapeHtml(title)}</div>
      ${svg}
      <div class="solution-meaning-card__caption">${escapeHtml(caption)}</div>
    </div>
  `;
}

function renderGraphFrame(innerSvg) {
  return `
    <svg class="solution-meaning-graph" viewBox="0 0 160 90" role="img" aria-hidden="true">
      <line x1="20" y1="80" x2="145" y2="80" stroke="#cbd5e1" stroke-width="1" />
      <line x1="20" y1="10" x2="20" y2="80" stroke="#cbd5e1" stroke-width="1" />
      ${innerSvg}
    </svg>
  `;
}

function renderIntersectingLinesSvg() {
  return renderGraphFrame(`
    <line x1="30" y1="70" x2="135" y2="18" stroke="#111827" stroke-width="2" />
    <line x1="30" y1="20" x2="135" y2="70" stroke="#111827" stroke-width="2" />
    <circle cx="82" cy="44" r="4" fill="#111827" />
  `);
}

function renderParallelLinesSvg() {
  return renderGraphFrame(`
    <line x1="30" y1="70" x2="135" y2="35" stroke="#111827" stroke-width="2" />
    <line x1="30" y1="52" x2="135" y2="17" stroke="#111827" stroke-width="2" />
  `);
}

function renderSameLineSvg() {
  return renderGraphFrame(`
    <line x1="30" y1="70" x2="135" y2="22" stroke="#111827" stroke-width="5" opacity="0.22" />
    <line x1="30" y1="70" x2="135" y2="22" stroke="#111827" stroke-width="2" />
  `);
}

function renderStep({ label, prompt, math }) {
  return `
    <div class="step">
      <strong>${escapeHtml(label)}:</strong> ${withAnswers(prompt)}
      <div class="math-line">${withAnswers(math)}</div>
    </div>
  `;
}

function renderWorkspaceLines(count, label = "Work space:", style = "blank") {
  const safeCount = Number.isFinite(Number(count)) ? Number(count) : 4;
  const safeStyle = style === "ruled" ? "ruled" : "blank";

  if (safeStyle === "ruled") {
    const lines = Array.from(
      { length: safeCount },
      () => `<div class="workspace-line"></div>`
    ).join("");

    return `
      <div class="workspace-label">${escapeHtml(label)}</div>
      <div class="workspace-box workspace-box--ruled">${lines}</div>
    `;
  }

  return `
    <div class="workspace-label">${escapeHtml(label)}</div>
    <div
      class="workspace-box workspace-box--blank"
      style="--workspace-lines: ${safeCount};"
    ></div>
  `;
}

function renderNumberOfSolutionsAnswer(result, answerStyle = "blank") {
  if (answerStyle === "circle") {
    return `
      <div class="answer-choices">
        <strong>Circle one:</strong>
        &nbsp no solution &nbsp;
        | &nbsp one solution &nbsp;
        | &nbsp infinite solutions
        <span class="key-answer"> Answer: ${escapeHtml(result)}</span>
      </div>
    `;
  }

  return `
    <div class="answer-choices">
      Choices: no solutions &nbsp; | &nbsp; one solution &nbsp; | &nbsp; infinite solutions
    </div>

    <strong>Number of solutions:</strong> ${answer(result)}
  `;
}