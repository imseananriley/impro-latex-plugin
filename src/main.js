import { Plugin } from "@impro.social/impro-plugin";

// ── LaTeX-to-Unicode lookup tables ──────────────────────────────────────────

const SUPERSCRIPTS = {
  0: "\u2070", 1: "\u00B9", 2: "\u00B2", 3: "\u00B3",
  4: "\u2074", 5: "\u2075", 6: "\u2076", 7: "\u2077",
  8: "\u2078", 9: "\u2079",
  "+": "\u207A", "-": "\u207B", "=": "\u207C",
  "(": "\u207D", ")": "\u207E", "n": "\u207F",
  "i": "\u2071", "j": "\u02B2",
  a: "\u1D43", b: "\u1D47", c: "\u1D9C", d: "\u1D48",
  e: "\u1D49", f: "\u1DA0", g: "\u1D4D", h: "\u02B0",
  k: "\u1D4F", l: "\u02E1", m: "\u1D50", o: "\u1D52",
  p: "\u1D56", r: "\u02B3", s: "\u02E2", t: "\u1D57",
  u: "\u1D58", v: "\u1D5B", w: "\u02B7", x: "\u02E3",
  y: "\u02B8", z: "\u1DBB",
};

const SUBSCRIPTS = {
  0: "\u2080", 1: "\u2081", 2: "\u2082", 3: "\u2083",
  4: "\u2084", 5: "\u2085", 6: "\u2086", 7: "\u2087",
  8: "\u2088", 9: "\u2089",
  "+": "\u208A", "-": "\u208B", "=": "\u208C",
  "(": "\u208D", ")": "\u208E",
  a: "\u2090", e: "\u2091", h: "\u2095", i: "\u1D62",
  j: "\u2C7C", k: "\u2096", l: "\u2097", m: "\u2098",
  n: "\u2099", o: "\u2092", p: "\u209A", r: "\u1D63",
  s: "\u209B", t: "\u209C", u: "\u1D64", v: "\u1D65",
  x: "\u2093",
};

const SYMBOLS = {
  "\\alpha": "\u03B1",
  "\\beta": "\u03B2",
  "\\gamma": "\u03B3",
  "\\delta": "\u03B4",
  "\\epsilon": "\u03B5",
  "\\varepsilon": "\u03B5",
  "\\zeta": "\u03B6",
  "\\eta": "\u03B7",
  "\\theta": "\u03B8",
  "\\vartheta": "\u03D1",
  "\\iota": "\u03B9",
  "\\kappa": "\u03BA",
  "\\lambda": "\u03BB",
  "\\mu": "\u03BC",
  "\\nu": "\u03BD",
  "\\xi": "\u03BE",
  "\\pi": "\u03C0",
  "\\varpi": "\u03D6",
  "\\rho": "\u03C1",
  "\\varrho": "\u03F1",
  "\\sigma": "\u03C3",
  "\\varsigma": "\u03C2",
  "\\tau": "\u03C4",
  "\\upsilon": "\u03C5",
  "\\phi": "\u03C6",
  "\\varphi": "\u03C7",
  "\\chi": "\u03C7",
  "\\psi": "\u03C8",
  "\\omega": "\u03C9",
  "\\Gamma": "\u0393",
  "\\Delta": "\u0394",
  "\\Theta": "\u0398",
  "\\Lambda": "\u039B",
  "\\Xi": "\u039E",
  "\\Pi": "\u03A0",
  "\\Sigma": "\u03A3",
  "\\Phi": "\u03A6",
  "\\Psi": "\u03A8",
  "\\Omega": "\u03A9",
  "\\infty": "\u221E",
  "\\partial": "\u2202",
  "\\nabla": "\u2207",
  "\\sum": "\u2211",
  "\\prod": "\u220F",
  "\\int": "\u222B",
  "\\oint": "\u222E",
  "\\iint": "\u222C",
  "\\iiint": "\u222D",
  "\\sqrt": "\u221A",
  "\\times": "\u00D7",
  "\\cdot": "\u00B7",
  "\\div": "\u00F7",
  "\\pm": "\u00B1",
  "\\mp": "\u2213",
  "\\approx": "\u2248",
  "\\equiv": "\u2261",
  "\\propto": "\u221D",
  "\\sim": "\u223C",
  "\\neq": "\u2260",
  "\\le": "\u2264",
  "\\ge": "\u2265",
  "\\ll": "\u226A",
  "\\gg": "\u226B",
  "\\to": "\u2192",
  "\\rightarrow": "\u2192",
  "\\leftarrow": "\u2190",
  "\\leftrightarrow": "\u2194",
  "\\Rightarrow": "\u21D2",
  "\\Leftarrow": "\u21D0",
  "\\Leftrightarrow": "\u21D4",
  "\\mapsto": "\u21A6",
  "\\implies": "\u21D2",
  "\\iff": "\u21D4",
  "\\forall": "\u2200",
  "\\exists": "\u2203",
  "\\nexists": "\u2204",
  "\\in": "\u2208",
  "\\notin": "\u2209",
  "\\ni": "\u220B",
  "\\subset": "\u2282",
  "\\supset": "\u2283",
  "\\subseteq": "\u2286",
  "\\supseteq": "\u2287",
  "\\cup": "\u222A",
  "\\cap": "\u2229",
  "\\emptyset": "\u2205",
  "\\varnothing": "\u2205",
  "\\land": "\u2227",
  "\\lor": "\u2228",
  "\\lnot": "\u00AC",
  "\\neg": "\u00AC",
  "\\top": "\u22A4",
  "\\bot": "\u22A5",
  "\\angle": "\u2220",
  "\\parallel": "\u2225",
  "\\perp": "\u27C2",
  "\\circ": "\u2218",
  "\\hbar": "\u0127",
  "\\ell": "\u2113",
  "\\wp": "\u2118",
  "\\Re": "\u211C",
  "\\Im": "\u2111",
  "\\aleph": "\u2135",
  "\\degree": "\u00B0",
  "\\prime": "\u2032",
  "\\dagger": "\u2020",
  "\\ddagger": "\u2021",
  "\\dots": "\u2026",
  "\\cdots": "\u22EF",
  "\\vdots": "\u22EE",
  "\\ddots": "\u22F1",
  "\\therefore": "\u2234",
  "\\because": "\u2235",
  "\\square": "\u25A1",
  "\\Box": "\u25A1",
  "\\triangle": "\u25B3",
  "\\oplus": "\u2295",
  "\\ominus": "\u2296",
  "\\otimes": "\u2297",
  "\\odot": "\u2299",
  "\\oslash": "\u2298",
  "\\star": "\u22C6",
  "\\bigstar": "\u2605",
};

// ── Conversion helpers ──────────────────────────────────────────────────────

function convertSuperscript(text) {
  return [...text].map((ch) => SUPERSCRIPTS[ch] || ch).join("");
}

function convertSubscript(text) {
  return [...text].map((ch) => SUBSCRIPTS[ch] || ch).join("");
}

function handleFrac(_match, num, den) {
  return "(" + convertFormula(num.trim()) + ")/(" + convertFormula(den.trim()) + ")";
}

function handleSqrt(_match, arg) {
  return "\u221A(" + convertFormula(arg.trim()) + ")";
}

function handleSupSub(text) {
  let result = "";
  let i = 0;
  while (i < text.length) {
    if (text[i] === "^" && i + 1 < text.length) {
      let sup = "";
      i++;
      if (text[i] === "{") {
        let depth = 1;
        i++;
        while (i < text.length && depth > 0) {
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          if (depth > 0) sup += text[i];
          i++;
        }
      } else {
        sup = text[i];
        i++;
      }
      result += convertSuperscript(convertFormula(sup));
      continue;
    }
    if (text[i] === "_" && i + 1 < text.length) {
      let sub = "";
      i++;
      if (text[i] === "{") {
        let depth = 1;
        i++;
        while (i < text.length && depth > 0) {
          if (text[i] === "{") depth++;
          else if (text[i] === "}") depth--;
          if (depth > 0) sub += text[i];
          i++;
        }
      } else {
        sub = text[i];
        i++;
      }
      result += convertSubscript(convertFormula(sub));
      continue;
    }
    result += text[i];
    i++;
  }
  return result;
}

function convertFormula(formula) {
  if (!formula) return "";
  formula = formula.replace(/\\\\/g, "\n");

  // \frac
  formula = formula.replace(
    /\\frac\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    handleFrac,
  );

  // \sqrt{...}
  formula = formula.replace(
    /\\sqrt\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    handleSqrt,
  );
  // \sqrt[n]{...}
  formula = formula.replace(
    /\\sqrt\s*\[([^\]]*)\]\s*\{([^{}]*(?:\{[^{}]*\}[^{}]*)*)\}/g,
    (_m, _root, arg) => "\u221A(" + convertFormula(arg.trim()) + ")",
  );

  // Symbols
  for (const [tex, unicode] of Object.entries(SYMBOLS)) {
    formula = formula.replace(new RegExp(tex.replace(/\\/g, "\\\\"), "g"), unicode);
  }

  formula = handleSupSub(formula);
  return formula.trim();
}

// ── Token transform ─────────────────────────────────────────────────────────

const DISPLAY_RE = /\$\$([^$]*?)\$\$/g;
const INLINE_RE = /(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g;

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

    let lastIndex = 0;
    const combinedRegex = /(\$\$([^$]*?)\$\$)|(?<!\$)\$(?!\$)([^\n$]+?)(?<!\$)\$(?!\$)/g;
    let match;
    while ((match = combinedRegex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) result.push({ type: "text", value: before });

      if (match[1]) {
        const formula = convertFormula(match[2] || "");
        result.push({
          type: "block",
          node: {
            tag: "div",
            attrs: { class: "latex-math latex-math-display" },
            text: formula,
          },
        });
      } else if (match[3] !== undefined) {
        const formula = convertFormula(match[3] || "");
        result.push({
          type: "inline",
          node: {
            tag: "span",
            attrs: { class: "latex-math latex-math-inline" },
            text: formula,
          },
        });
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
    this.registerRichTextTransform((tokens, _context) => transformTokens(tokens));
  }

  async onunload() {}
}
