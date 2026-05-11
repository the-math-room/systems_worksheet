/* global loadWorksheet, renderToolbar, renderWorksheet, MathJax */

/**
 * App bootstrap and DOM wiring.
 *
 * Keep this file imperative and small. All worksheet content lives in YAML;
 * all rendering decisions live in render.js.
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
    if (action === "print") window.print();
    if (action === "toggle-key") document.body.classList.toggle("show-key");
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
    setStatus(`Could not load worksheet: ${error.message}`);
  }
}

boot();
