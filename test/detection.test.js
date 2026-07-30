import assert from "node:assert/strict";
import test from "node:test";

import { createMathRegex } from "../src/detection.js";

function formulas(text) {
  return [...text.matchAll(createMathRegex())].map((match) => ({
    mode: match[1] ? "display" : "inline",
    value: match[1] ? match[2] : match[3],
  }));
}

test("does not pair separate currency amounts as inline math", () => {
  assert.deepEqual(formulas("Lunch was $5 and dinner was $10."), []);
  assert.deepEqual(formulas("Tickets cost $5–$10."), []);
  assert.deepEqual(formulas("Values rose from $1.25 to $2.50."), []);
});

test("does not parse the reported BlueSky posts as math", () => {
  const posts = [
    "Choose whether your worst enemy gets $50K or a 50% chance at $1M.",
    "I also can't imagine if I was doing Taskrabbit and an account offered me like $5 for the ~30 seconds of work to solve a captcha that I would care enough to not just do it and get $5",
    "Oh oh, I seem to have become addicted to Claude tokens! Probably late to the party, but I keep upping my spend limit.\n\nI'm at $400 so far this week 😬. This is because I thought I could build my own version of something that cost $2800 to buy, we'll see if I end up saving money or not 😊.",
  ];

  for (const post of posts) assert.deepEqual(formulas(post), []);
});

test("finds math surrounded by currency text", () => {
  assert.deepEqual(
    formulas("It cost $5, but $E = mc^2$ is still math, not $10."),
    [{ mode: "inline", value: "E = mc^2" }],
  );
});

test("supports inline and display formulas", () => {
  assert.deepEqual(formulas("Use $x_i$ or $$\\sum_i x_i$$."), [
    { mode: "inline", value: "x_i" },
    { mode: "display", value: "\\sum_i x_i" },
  ]);
});

test("requires tight inline delimiters and ignores escaped dollars", () => {
  assert.deepEqual(formulas("Keep \\$5 literal, plus $ x$ and $x $."), []);
});
