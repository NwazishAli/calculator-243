import React from "react";
import ReactDOM from "react-dom";
import { act } from "react-dom/test-utils";

import App from "./App";

/**
 * Drives the real components the way a user would: render, click, read the
 * display. This is what catches wiring mistakes (props not passed down, a label
 * that does not match the button name the logic expects) that the pure logic
 * tests cannot see.
 */

let container;

beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
  act(() => {
    ReactDOM.render(<App />, container);
  });
});

afterEach(() => {
  ReactDOM.unmountComponentAtNode(container);
  container.remove();
  container = null;
});

function labels() {
  return Array.from(container.querySelectorAll("button")).map(
    button => button.textContent,
  );
}

function click(label) {
  const button = Array.from(container.querySelectorAll("button")).find(
    candidate => candidate.textContent === label,
  );
  if (!button) {
    throw new Error(
      `No button labelled "${label}". Visible: ${labels().join(", ")}`,
    );
  }
  act(() => {
    button.dispatchEvent(new window.MouseEvent("click", { bubbles: true }));
  });
}

function display() {
  return container.querySelector(".component-display > div").textContent;
}

it("starts in basic mode with no scientific keys", () => {
  expect(display()).toBe("0");
  expect(labels()).toContain("AC");
  expect(labels()).not.toContain("sin");
  expect(labels().length).toBe(20); // 19 keys plus the SCI toggle
});

it("reveals the scientific keypad from the display toggle", () => {
  click("SCI");
  expect(labels()).toContain("sin");
  expect(labels()).toContain("cos");
  expect(labels()).toContain("tan");
  expect(labels()).toContain("π");
  expect(labels()).toContain("1/x");
  expect(labels()).toContain("10ˣ");
  expect(labels()).toContain("xʸ");
  expect(labels()).toContain("mod");
  expect(labels()).toContain("⌫");
  expect(container.querySelectorAll(".scientific-row").length).toBe(4);
  // The toggle now offers the way back.
  expect(labels()).toContain("BASIC");
});

it("hides the scientific keypad again", () => {
  click("SCI");
  click("BASIC");
  expect(labels()).not.toContain("sin");
  expect(container.querySelectorAll(".scientific-row").length).toBe(0);
});

it("computes a square root through the UI", () => {
  click("SCI");
  click("9");
  click("√x");
  expect(display()).toBe("3");
});

it("switches between degrees and radians", () => {
  click("SCI");
  expect(labels()).toContain("DEG");
  click("3");
  click("0");
  click("sin");
  expect(display()).toBe("0.5");
  click("DEG");
  expect(labels()).toContain("RAD");
  click("AC");
  click("3");
  click("0");
  click("sin");
  expect(display()).toBe("-0.988031624093");
});

it("shows an error for a domain violation and recovers", () => {
  click("SCI");
  click("0");
  click("1/x");
  expect(display()).toBe("Error");
  // Keys are inert while the error is showing.
  click("7");
  expect(display()).toBe("7");
});

it("raises a value to a power", () => {
  click("SCI");
  click("2");
  click("xʸ");
  click("1");
  click("0");
  click("=");
  expect(display()).toBe("1024");
});

it("backspaces the entry", () => {
  click("SCI");
  click("1");
  click("2");
  click("3");
  click("⌫");
  expect(display()).toBe("12");
});

it("still does ordinary arithmetic", () => {
  click("6");
  click("+");
  click("6");
  click("=");
  expect(display()).toBe("12");
});

it("reports tan(90 degrees) as an error rather than 1.6e16", () => {
  click("SCI");
  click("9");
  click("0");
  click("tan");
  expect(display()).toBe("Error");
});
