/**
 * Low-level HTML rendering helpers.
 *
 * This file owns:
 * - escaping
 * - blanks
 * - teacher-key answer spans
 * - tiny layout primitives
 *
 * It should not know anything about full worksheet structure.
 */

const SAFE_ENTITY_REPLACEMENTS = [
  [/&amp;nbsp;/g, "&nbsp;"],
];

export const cx = (...classes) => classes.filter(Boolean).join(" ");

export function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export function escapeTextButAllowSafeEntities(value) {
  return SAFE_ENTITY_REPLACEMENTS.reduce(
    (html, [pattern, replacement]) => html.replace(pattern, replacement),
    escapeHtml(value)
  );
}

export function mathInline(content) {
  return `\\(${escapeHtml(content)}\\)`;
}

export function mathSystem([eq1, eq2]) {
  return `\\(\\begin{cases}${escapeHtml(eq1)}\\\\${escapeHtml(eq2)}\\end{cases}\\)`;
}

export function blank(size = "md") {
  return `<span class="student-blank blank blank--${size}"></span>`;
}

export function answer(value, options = {}) {
  const blankSize = options.blankSize ?? "md";

  return `${blank(blankSize)}<span class="key-answer">${escapeTextButAllowSafeEntities(value)}</span>`;
}

export function withAnswers(template) {
  return String(template)
    .split(/(\{\{.*?\}\})/g)
    .map((part) => {
      const match = part.match(/^\{\{(.*?)\}\}$/);
      if (match) return answer(match[1].trim());
      return escapeTextButAllowSafeEntities(part);
    })
    .join("");
}

export function box(kind, contentHtml) {
  return `<div class="box box--${escapeHtml(kind)}">${contentHtml}</div>`;
}

export function sectionTitle(title) {
  return `<div class="section-title">${escapeHtml(title)}</div>`;
}

export function card(contentHtml, { compact = false } = {}) {
  return `<section class="${cx("card", compact && "card--compact")}">${contentHtml}</section>`;
}

export function page(contentHtml) {
  return `<main class="page">${contentHtml}</main>`;
}

export function grid(columns, contentHtml) {
  return `<div class="grid-${escapeHtml(columns)}">${contentHtml}</div>`;
}