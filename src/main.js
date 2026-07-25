import { Plugin } from "@impro.social/impro-plugin";
import katex from "katex";
import { htmlToVirtualTree } from "./parseHtml.js";

// ── Detection ───────────────────────────────────────────────────────────────

const DISPLAY_RE = /\$\$([^$]*?)\$\$/g;
const INLINE_RE = /(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g;

// ── Rendering ───────────────────────────────────────────────────────────────

function renderLaTeX(formula, displayMode) {
  try {
    const html = katex.renderToString(formula, {
      displayMode,
      throwOnError: false,
      strict: "ignore",
    });
    return htmlToVirtualTree(html);
  } catch (e) {
    // Fallback: show the raw formula
    console.warn("[impro-latex] KaTeX render failed:", formula, e);
    return {
      tag: "span",
      attrs: { class: "latex-error" },
      children: [{ type: "text", value: formula }],
    };
  }
}

// ── Token transform ─────────────────────────────────────────────────────────

function transformTokens(tokens) {
  const result = [];
  for (const token of tokens) {
    if (token.type !== "text") {
      result.push(token);
      continue;
    }
    const text = token.value;
    if (!text.includes("$")) {
      result.push(token);
      continue;
    }

    // Match display and inline math
    const combinedRe =
      /(\$\$([^$]*?)\$\$)|(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g;
    let lastIndex = 0;
    let match;

    while ((match = combinedRe.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) result.push({ type: "text", value: before });

      if (match[1]) {
        // Display math: $$...$$
        const node = renderLaTeX(match[2] || "", true);
        if (node) {
          result.push({ type: "block", node });
        }
      } else if (match[3] !== undefined) {
        // Inline math: $...$
        const node = renderLaTeX(match[3] || "", false);
        if (node) {
          result.push({ type: "inline", node });
        }
      }
      lastIndex = match.index + match[0].length;
    }

    const after = text.slice(lastIndex);
    if (after) result.push({ type: "text", value: after });
  }
  return result;
}

// ── Plugin ──────────────────────────────────────────────────────────────────

export default class LatexPlugin extends Plugin {
  async onload() {
    this.registerRichTextTransform((tokens, _context) =>
      transformTokens(tokens),
    );
  }

  async onunload() {}
}
