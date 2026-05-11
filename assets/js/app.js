import {
  getWorksheetSlugFromUrl,
  loadWorksheet,
  loadWorksheetIndex,
  setWorksheetSlugInUrl,
} from "./worksheet-loader.js";

import { renderToolbar } from "./render/components.js";
import { renderWorksheet } from "./render/worksheet.js";

/**
 * App bootstrap and DOM wiring.
 */

let worksheetIndex = null;

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
  if (!window.MathJax) return;

  if (window.MathJax.startup?.promise) {
    await window.MathJax.startup.promise;
  }

  if (window.MathJax.typesetPromise) {
    await window.MathJax.typesetPromise();
  }
}

async function printWorksheet() {
  await typesetMath();
  await new Promise((resolve) => requestAnimationFrame(resolve));
  window.print();
}

function bindToolbar() {
  document.querySelector("#toolbar")?.addEventListener("click", async (event) => {
    const action = event.target?.dataset?.action;

    if (action === "print") {
      await printWorksheet();
      return;
    }

    if (action === "toggle-key") {
      document.body.classList.toggle("show-key");
      await typesetMath();
    }
  });
}

function bindWorksheetPicker() {
  document.querySelector("#worksheet-picker")?.addEventListener("change", async (event) => {
    if (event.target?.name !== "worksheet-slug") return;

    const slug = event.target.value;
    setWorksheetSlugInUrl(slug);
    await renderSelectedWorksheet(slug);
  });

  window.addEventListener("popstate", async () => {
    const slug = getWorksheetSlugFromUrl(worksheetIndex.default);
    await renderSelectedWorksheet(slug);
  });
}

async function renderSelectedWorksheet(slug) {
  try {
    setStatus("Loading worksheet…");
    mount("#worksheet-root", "");

    const worksheet = await loadWorksheet(slug);

    setDocumentTitle(worksheet);
    mount("#worksheet-picker", renderWorksheetPicker(worksheetIndex, worksheet.meta.slug));
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

function renderWorksheetPicker(index, selectedSlug) {
  const selectedWorksheet = index.worksheets.find((worksheet) => worksheet.slug === selectedSlug);

  return `
    <section class="worksheet-picker">
      <div class="worksheet-picker__top">
        <div class="worksheet-picker__control">
          <label for="worksheet-slug">Worksheet</label>
          <select id="worksheet-slug" name="worksheet-slug">
            ${index.worksheets.map((worksheet) => `
              <option value="${escapeHtml(worksheet.slug)}" ${worksheet.slug === selectedSlug ? "selected" : ""}>
                ${escapeHtml(worksheet.title)}
              </option>
            `).join("")}
          </select>
          <div class="worksheet-picker__description">
            ${escapeHtml(selectedWorksheet?.description || "")}
          </div>
        </div>
      </div>

      <details class="authoring-notes">
        <summary>How to add your own worksheet</summary>
        <p>
          Create a new YAML file in <code>assets/worksheets/</code>, using a lowercase hyphenated filename.
          For example, <code>graphing-systems.yaml</code>.
        </p>
        <p>
          Add it to <code>assets/worksheets/index.yaml</code> with a matching slug:
          <code>graphing-systems</code>.
        </p>
        <p>
          Then open it with <code>?sheet=graphing-systems</code>. This picker and these instructions do not print.
        </p>
      </details>
    </section>
  `;
}

async function boot() {
  try {
    mount("#toolbar", renderToolbar());
    bindToolbar();

    worksheetIndex = await loadWorksheetIndex();

    const initialSlug = getWorksheetSlugFromUrl(worksheetIndex.default);
    bindWorksheetPicker();

    await renderSelectedWorksheet(initialSlug);
  } catch (error) {
    console.error(error);
    setStatus(`
      <strong>Could not start worksheet site.</strong><br />
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