import { validateWorksheet } from "./validate/worksheet-validator.js";

/* global jsyaml */

/**
 * Worksheet loading.
 *
 * Responsibility:
 * - load the worksheet manifest
 * - determine which worksheet slug to load
 * - resolve the worksheet URL safely
 * - fetch YAML
 * - parse YAML
 * - validate basic worksheet shape
 * - return immutable data
 */

const DEFAULT_FALLBACK_SLUG = "systems-solving-methods";
const WORKSHEET_DIRECTORY = "./assets/worksheets/";
const WORKSHEET_INDEX_PATH = "./assets/worksheets/index.yaml";

export async function loadWorksheetIndex() {
  const indexUrl = new URL(WORKSHEET_INDEX_PATH, document.baseURI);
  const response = await fetch(indexUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Could not load worksheet index at ${indexUrl.href}: ${response.status} ${response.statusText}`
    );
  }

  const yamlText = await response.text();
  const index = parseYaml(yamlText);

  if (!index || !Array.isArray(index.worksheets)) {
    throw new Error("Worksheet index must include a worksheets list.");
  }

  return deepFreeze({
    default: normalizeWorksheetSlug(index.default || DEFAULT_FALLBACK_SLUG),
    worksheets: index.worksheets.map((worksheet) => ({
      slug: normalizeWorksheetSlug(worksheet.slug),
      title: String(worksheet.title || worksheet.slug),
      description: String(worksheet.description || ""),
    })),
  });
}

export async function loadWorksheet(slug) {
  const safeSlug = normalizeWorksheetSlug(slug || DEFAULT_FALLBACK_SLUG);
  const worksheetUrl = getWorksheetUrl(safeSlug);
  const response = await fetch(worksheetUrl, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(
      `Could not load worksheet "${safeSlug}" at ${worksheetUrl.href}: ${response.status} ${response.statusText}`
    );
  }

  const yamlText = await response.text();
  const data = parseYaml(yamlText);

  validateWorksheet(data);

  return deepFreeze({
    ...data,
    meta: {
      ...(data.meta ?? {}),
      slug: safeSlug,
      url: worksheetUrl.href,
    },
  });
}

export function getWorksheetSlugFromUrl(defaultSlug = DEFAULT_FALLBACK_SLUG) {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("sheet") || defaultSlug;

  return normalizeWorksheetSlug(slug);
}

export function setWorksheetSlugInUrl(slug) {
  const safeSlug = normalizeWorksheetSlug(slug);
  const url = new URL(window.location.href);

  url.searchParams.set("sheet", safeSlug);
  window.history.pushState({}, "", url);
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