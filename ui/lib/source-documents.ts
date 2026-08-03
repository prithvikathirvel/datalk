/**
 * Normalises the `source_documents` payload coming from the chat backend.
 *
 * The backend currently returns each source as a doubly-nested markdown link
 * whose ampersands are HTML-escaped one or two levels deep, e.g.
 *
 *   "[[https://host/file?a=1&amp;amp;b=2](https://host/file?a=1&amp;amp;b=2)](https://host/file?a=1&amp;b=2))"
 *
 * Rendered raw, the chip label becomes a wall of URL text and the href is a
 * broken markdown string. These helpers unwrap every layer, recover the real
 * presigned URL, and produce a short human label for the chip.
 */

/** Repeatedly resolves `&amp;` (double-encoded) → `&` until stable. */
function decodeHtmlEntities(value: string): string {
  let out = value;
  for (let i = 0; i < 4; i++) {
    const next = out
      .replaceAll("&amp;amp;", "&")
      .replaceAll("&amp;", "&")
      .replaceAll("&quot;", '"')
      .replaceAll("&#39;", "'");
    if (next === out) break;
    out = next;
  }
  return out;
}

/** Extracts the innermost http(s) URL from any wrapping markdown text. */
export function extractSourceUrl(raw: string): string | null {
  if (!raw) return null;
  // Grab the first absolute URL inside the (possibly nested) markdown.
  const match = raw.match(/https?:\/\/[^\s)\]"'<>]+/);
  if (!match) return null;
  // Trim trailing markdown punctuation the regex may have absorbed.
  const cleaned = match[0].replace(/[)\].,;]+$/, "");
  const url = decodeHtmlEntities(cleaned);
  try {
    // Validates the final URL — a malformed one would 403 in a new tab anyway.
    new URL(url);
    return url;
  } catch {
    return null;
  }
}

/** Derives the filename portion of an S3/HTTP URL, without query params. */
function fileNameFromUrl(url: string): string | null {
  try {
    const pathname = new URL(url).pathname;
    const segment = pathname.split("/").filter(Boolean).pop();
    if (!segment) return null;
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

/** True for UUID-ish object keys that carry no meaningful name. */
function isOpaqueName(name: string) {
  const stem = name.replace(/\.[a-z0-9]{1,5}$/i, "");
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    stem,
  );
}

export interface NormalizedSource {
  url: string;
  label: string;
  /** Full filename when it is meaningful — used for the hover tooltip. */
  title: string;
}

/**
 * Converts the raw backend array into a deduped list of clickable sources.
 * Anything that does not contain a usable URL is silently dropped.
 */
export function normalizeSourceDocuments(raw: unknown): NormalizedSource[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const results: NormalizedSource[] = [];

  for (const entry of raw) {
    if (typeof entry !== "string") continue;
    const url = extractSourceUrl(entry);
    if (!url || seen.has(url)) continue;
    seen.add(url);

    const filename = fileNameFromUrl(url);
    const meaningful = filename && !isOpaqueName(filename) ? filename : null;
    const label =
      meaningful && meaningful.length > 26
        ? `${meaningful.slice(0, 25)}…`
        : (meaningful ?? `Source ${results.length + 1}`);
    results.push({
      url,
      label,
      title: meaningful ?? `Source document ${results.length + 1}`,
    });
  }

  return results;
}
