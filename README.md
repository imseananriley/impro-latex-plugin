# Impro LaTeX Math Plugin

Converts LaTeX math in BlueSky posts to Unicode symbols for display in Impro.

## Usage

Write math in your posts using standard LaTeX delimiters:

- **Inline**: `$E = mc^2$` → E = mc²
- **Display**: `$$\int_0^\infty e^{-x^2} dx$$` → centered equation

Inline delimiters must touch their formula (`$x$`, not `$ x $`). Escaped dollar
signs and ordinary currency amounts such as `$5 and $10` remain plain text.

## Supported notation

- Greek letters: `\alpha`, `\beta`, `\Gamma`, `\Omega`, etc.
- Superscripts: `x^2`, `x^{n+1}`
- Subscripts: `x_i`, `x_{i+1}`
- Fractions: `\frac{a}{b}` → (a)/(b)
- Square roots: `\sqrt{x}` → √(x)
- Common symbols: `\infty`, `\pm`, `\times`, `\cdot`, `\to`, `\in`, etc.
- Operators: `\sum`, `\prod`, `\int`, `\nabla`, `\partial`

For complete LaTeX equation rendering (integrals, matrices, etc.), Impro's built-in KaTeX support provides full typesetting.

## Development

```bash
npm install
npm run build
npm run watch  # auto-rebuild on changes
```
