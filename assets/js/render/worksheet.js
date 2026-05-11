/**
 * Worksheet-level assembly.
 *
 * This file turns YAML page/section layout into rendered worksheet pages.
 * It should know about section types, but not about any one specific worksheet.
 */

import {
  box,
  escapeHtml,
  grid,
  mathInline,
  page,
  sectionTitle,
} from "./html.js";

import {
  renderExitTicketCard,
  renderGuidedProblem,
  renderHeader,
  renderLineComparisonProblem,
  renderMethodCard,
  renderMethodClues,
  renderPracticeProblem,
  renderSolutionCountCard,
  renderSolutionMeaning,
  renderSolutionRules,
  renderWorkspaceProblem,
} from "./components.js";

const DEFAULT_COLUMNS = "1";

const SECTION_RENDERERS = {
  goal: renderGoalSection,
  "method-clues": renderMethodCluesSection,
  "method-recognition": renderMethodRecognitionSection,
  "guided-problems": renderGuidedProblemsSection,
  "practice-problems": renderPracticeProblemsSection,
  "workspace-problems": renderWorkspaceProblemsSection,
  "solution-count": renderSolutionCountSection,
  "line-comparison": renderLineComparisonSection,
  "rules-table": renderRulesTableSection,
  "solution-meaning": renderSolutionMeaningSection,
  "exit-ticket": renderExitTicketSection,
};

export function renderWorksheet(data) {
  const content = data.content ?? data;
  const layoutClass = data.layout?.className
    ? ` worksheet--${data.layout.className}`
    : "";

  const pagesHtml = data.pages
    .map((pageData, pageIndex) => renderWorksheetPage(data, content, pageData, pageIndex))
    .join("");

  return `<div class="worksheet${layoutClass}">${pagesHtml}</div>`;
}

function renderWorksheetPage(data, content, pageData, pageIndex) {
  const includeHeader = pageData.header ?? pageIndex === 0;

  return page(`
    ${includeHeader ? renderHeader(data) : ""}
    ${pageData.sections.map((section) => renderSection(content, section)).join("")}
  `);
}

function renderSection(content, section) {
  const renderer = SECTION_RENDERERS[section.type];

  if (!renderer) {
    throw new Error(`No renderer found for section type: ${section.type}`);
  }

  const rendered = renderer(content, section);
  return section.marginTop ? `<div class="mt-sm">${rendered}</div>` : rendered;
}

function renderSectionTitle(title) {
  return title ? sectionTitle(title) : "";
}

function getSource(content, section) {
  if (!section.source) return undefined;

  const source = content[section.source];

  if (source === undefined) {
    throw new Error(`Section source not found: ${section.source}`);
  }

  return source;
}

function renderGoalSection(content, section) {
  const goal = section.text ?? content.goal;

  return `
    ${renderSectionTitle(section.title)}
    ${box("goal", `<strong>Goal:</strong> ${escapeHtml(goal)}`)}
  `;
}

function renderMethodCluesSection(content, section) {
  const clues = getSource(content, section);

  return `
    ${renderSectionTitle(section.title)}
    ${renderMethodClues(clues)}
  `;
}

function renderMethodRecognitionSection(content, section) {
  const problems = getSource(content, section);
  const columns = section.columns ?? "4-to-2";

  return `
    ${renderSectionTitle(section.title)}
    ${grid(columns, problems.map(renderMethodCard).join(""))}
  `;
}

function renderGuidedProblemsSection(content, section) {
  const problems = getSource(content, section);
  const columns = section.columns ?? DEFAULT_COLUMNS;

  return `
    ${renderSectionTitle(section.title)}
    ${grid(columns, problems.map(renderGuidedProblem).join(""))}
  `;
}

function renderPracticeProblemsSection(content, section) {
  const problems = getSource(content, section);
  const columns = section.columns ?? DEFAULT_COLUMNS;

  return `
    ${renderSectionTitle(section.title)}
    ${grid(columns, problems.map(renderPracticeProblem).join(""))}
  `;
}

function renderWorkspaceProblemsSection(content, section) {
  const problems = getSource(content, section);
  const columns = section.columns ?? DEFAULT_COLUMNS;
  const options = {
    workspaceLines: section.workspaceLines ?? 4,
    workspaceStyle: section.workspaceStyle ?? "blank",
  };

  return `
    ${renderSectionTitle(section.title)}
    ${grid(columns, problems.map((problem) => renderWorkspaceProblem(problem, options)).join(""))}
  `;
}

function renderRulesTableSection(content, section) {
  const rules = getSource(content, section);
  const prompt = section.prompt ?? "Compare the slopes and y-intercepts.";

  return `
    ${renderSectionTitle(section.title)}
    ${box("directions", `
      ${escapeHtml(prompt)}
      ${renderSolutionRules(rules)}
    `)}
  `;
}

function renderSolutionCountSection(content, section) {
  const problems = getSource(content, section);
  const columns = section.columns ?? DEFAULT_COLUMNS;
  const rulesSource = section.rulesSource ?? "solutionRules";
  const rules = content[rulesSource];
  const options = {
    workspaceLines: section.workspaceLines ?? 0,
    workspaceStyle: section.workspaceStyle ?? "blank",
  };

  if (!rules) {
    throw new Error(`Solution-count section could not find rules source: ${rulesSource}`);
  }

  return `
    ${renderSectionTitle(section.title)}
    ${box("directions", `
      Put both equations in ${mathInline("y=mx+b")} form. Then compare slopes and y-intercepts.
      ${renderSolutionRules(rules)}
    `)}
    ${grid(columns, problems.map((problem) => renderSolutionCountCard(problem, options)).join(""))}
  `;
}

function renderLineComparisonSection(content, section) {
  const problems = getSource(content, section);
  const columns = section.columns ?? DEFAULT_COLUMNS;
  const options = {
    workspaceLines: section.workspaceLines ?? 0,
    workspaceStyle: section.workspaceStyle ?? "blank",
    answerStyle: section.answerStyle ?? "blank",
  };

  return `
    ${renderSectionTitle(section.title)}
    ${grid(columns, problems.map((problem) => renderLineComparisonProblem(problem, options)).join(""))}
  `;
}

function renderExitTicketSection(content, section) {
  const items = getSource(content, section);
  const columns = section.columns ?? DEFAULT_COLUMNS;

  return `
    ${renderSectionTitle(section.title)}
    ${grid(columns, items.map(renderExitTicketCard).join(""))}
  `;
}

function renderSolutionMeaningSection(content, section) {
  return `
    ${renderSectionTitle(section.title)}
    ${renderSolutionMeaning()}
  `;
}