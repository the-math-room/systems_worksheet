import { loadWorksheet } from "./worksheet-loader.js";
import { renderToolbar } from "./render/components.js";
import { renderWorksheet } from "./render/worksheet.js";

/**
 * App bootstrap and DOM wiring.
 */

function mount(selector, html) {
  const element = document.querySelector(selector);
  if (!element) return;
  element.innerHTML = html;
}

function setStatus(message) {
  mount("#status", message || "");
}

function typesetMath() {
  if (window.MathJax?.typesetPromise) {
    return window.MathJax.typesetPromise();
  }

  return Promise.resolve();
}

function bindToolbar() {
  document.querySelector("#toolbar")?.addEventListener("click", (event) => {
    const action = event.target?.dataset?.action;

    if (action === "print") {
      window.print();
      return;
    }

    if (action === "toggle-key") {
      document.body.classList.toggle("show-key");
    }
  });
}

async function boot() {
  try {
    mount("#toolbar", renderToolbar());
    bindToolbar();

    const worksheet = await loadWorksheet();
    mount("#worksheet-root", renderWorksheet(worksheet));

    await typesetMath();
    setStatus("");
  } catch (error) {
    console.error(error);
    setStatus(`
      <strong>Could not load worksheet.</strong><br />
      ${escapeHtml(error.message)}
    `);
  }
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

boot();