import { validateWorksheet } from "./validate/worksheet-validator.js";

/* global jsyaml */

/**
 * Worksheet loading.
 *
 * Responsibility:
 * - determine which worksheet slug to load
 * - resolve the worksheet URL safely
 * - fetch YAML
 * - parse YAML
 * - validate basic worksheet shape
 * - return immutable data
 */

const DEFAULT_WORKSHEET_SLUG = "systems-linear-equations";
const WORKSHEET_DIRECTORY = "./assets/worksheets/";

export async function loadWorksheet(slug = getWorksheetSlugFromUrl()) {
  const worksheetUrl = getWorksheetUrl(slug);
  const response = await fetch(worksheetUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Could not load worksheet "${slug}" at ${worksheetUrl.href}: ${response.status} ${response.statusText}`
    );
  }

  const yamlText = await response.text();
  const data = parseYaml(yamlText);

  validateWorksheet(data);

  return deepFreeze({
    ...data,
    meta: {
      ...(data.meta ?? {}),
      slug,
      url: worksheetUrl.href,
    },
  });
}

function getWorksheetSlugFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("sheet") || DEFAULT_WORKSHEET_SLUG;

  return normalizeWorksheetSlug(slug);
}

function normalizeWorksheetSlug(slug) {
  const normalized = String(slug).trim().toLowerCase();

  if (!/^[a-z0-9-]+$/.test(normalized)) {
    throw new Error(
      `Invalid worksheet slug "${slug}". Use only lowercase letters, numbers, and hyphens.`
    );
  }

  return normalized;
}

function getWorksheetUrl(slug) {
  const safeSlug = normalizeWorksheetSlug(slug);
  return new URL(`${WORKSHEET_DIRECTORY}${safeSlug}.yaml`, document.baseURI);
}

function parseYaml(yamlText) {
  try {
    return jsyaml.load(yamlText);
  } catch (error) {
    throw new Error(`YAML parse error: ${error.message}`);
  }
}

function deepFreeze(value) {
  if (!value || typeof value !== "object") {
    return value;
  }

  Object.freeze(value);

  Object.values(value).forEach((child) => {
    if (child && typeof child === "object" && !Object.isFrozen(child)) {
      deepFreeze(child);
    }
  });

  return value;
}