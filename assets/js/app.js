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

function setDocumentTitle(worksheet) {
  const title = worksheet?.title || "Math Worksheet";
  document.title = `${title} — Scaffolded Worksheet`;
}

async function typesetMath() {
  if (!window.MathJax) {
    return;
  }

  if (window.MathJax.startup?.promise) {
    await window.MathJax.startup.promise;
  }

  if (window.MathJax.typesetPromise) {
    await window.MathJax.typesetPromise();
  }
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

    setDocumentTitle(worksheet);
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