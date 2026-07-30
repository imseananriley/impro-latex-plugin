/**
 * Match display and inline math without pairing ordinary currency amounts.
 *
 * Inline delimiters must be adjacent to their content, escaped dollar signs
 * stay literal, and a closing delimiter cannot be followed by a digit. The
 * latter prevents text such as "$5–$10" from becoming a formula.
 */
export function createMathRegex() {
  return /((?<!\\)\$\$([^$]*?)\$\$)|(?<![\\$])\$(?![\s$])([^\n$]*?\S)\$(?![\d$])/g;
}
