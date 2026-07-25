/**
 * Parse KaTeX HTML output into the VirtualEl tree format that Impro's
 * PluginRenderer understands.  Workers have no DOMParser so this uses a
 * simple recursive-descent parser.
 */

/**
 * Parse an HTML attribute string ("class=\"foo\" style=\"height:1em\"")
 * into separate { attrs, styles } objects.
 */
function parseAttrs(attrStr) {
  const attrs = {};
  const styles = {};

  const re = /([\w-]+)\s*=\s*(?:"([^"]*)"|'([^']*)')/g;
  let m;
  while ((m = re.exec(attrStr))) {
    const name = m[1];
    const value = m[2] !== undefined ? m[2] : m[3];
    if (name === "style") {
      value.split(";").forEach((decl) => {
        const colon = decl.indexOf(":");
        if (colon === -1) return;
        const prop = decl.slice(0, colon).trim();
        const val = decl.slice(colon + 1).trim();
        if (prop && val) styles[prop] = val;
      });
    } else if (name === "class") {
      attrs.class = value;
    } else if (name.startsWith("aria-") || name.startsWith("data-")) {
      attrs[name] = value;
    }
  }
  return { attrs, styles };
}

/**
 * Convert a KaTeX HTML string into a VirtualEl-compatible tree.
 * Returns a node like { tag, attrs, styles?, children } where children
 * are either { type: "text", value } text nodes or nested element nodes.
 */
export function htmlToVirtualTree(html) {
  if (!html) return null;

  const root = [];
  const stack = [root];
  // Match: opening tags, closing tags, and text between tags
  const re = /<(\/?)(\w+)((?:\s+[\w-]+=(?:"[^"]*"|'[^']*'))*)\s*\/?>|([^<]+)/g;
  let m;

  while ((m = re.exec(html))) {
    const slash = m[1];
    const tagName = m[2];
    const attrStr = m[3];
    const text = m[4];
    const isClosing = slash === "/";

    if (text !== undefined) {
      // Text between tags
      if (text.trim()) {
        stack[stack.length - 1].push({
          type: "text",
          value: text,
        });
      }
    } else if (isClosing) {
      // Closing tag: </span>
      if (stack.length > 1) stack.pop();
    } else {
      // Opening tag: <span class="x">
      const { attrs, styles } = parseAttrs(attrStr || "");
      const node = {
        tag: tagName,
        attrs,
        styles: Object.keys(styles).length ? styles : undefined,
        children: [],
      };
      stack[stack.length - 1].push(node);
      stack.push(node.children);
    }
  }

  // Return the first element child of root
  for (const node of root) {
    if (node.tag) return node;
  }
  const textOnly = root
    .filter((n) => n.type === "text")
    .map((n) => n.value)
    .join("");
  if (textOnly) return { tag: "span", attrs: {}, children: root };
  return null;
}
